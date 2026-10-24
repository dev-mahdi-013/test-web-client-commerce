import { env } from "@/config/env";
import { accountsHttp } from "@/lib/accounts-http";
import type { UserRole } from "@/features/profile/types";
import type { AuthSession, Captcha, SendOtpPayload, SendOtpResponse, UserSession, VerifyOtpPayload } from "../types";

const COMMERCE_LOGIN_TYPE = 0xff36;

type CaptchaResponse = {
  captchaId: string;
  imageContent: string;
};

type OtpSendResponse = {
  phone: string;
  ttl: number;
};

type ApiRole = {
  [key: string]: unknown;
  id?: string | number;
  roleId?: string;
  _id?: string;
  role?: string | number;
  title?: string;
  name?: string;
  province?: string | number;
  chamberName?: string;
  chamber?: { name?: string };
  roomName?: string;
  room?: { name?: string };
};

type OtpVerifyResponse = {
  name: string;
  phone: string;
  tokenId: string;
  sessionToken: string;
  roles?: ApiRole[];
};

type ApiSession = {
  [key: string]: unknown;
  id?: string | number;
  _id?: string;
  tokenId?: string;
  device?: string;
  deviceName?: string;
  os?: string;
  browser?: string;
  userAgent?: string;
  ip?: string;
  ipAddress?: string;
  lastActiveAt?: string;
  lastSeenAt?: string;
  updatedAt?: string;
  createdAt?: string;
  current?: boolean;
  isCurrent?: boolean;
};

type ApiSessionList = ApiSession[] | { items?: ApiSession[]; sessions?: ApiSession[] };

function textOf(...candidates: unknown[]) {
  const value = candidates.find((item): item is string => typeof item === "string" && item.trim() !== "");
  return value ? value.trim() : null;
}

function toUserSession(session: ApiSession, index: number, currentTokenId: string | null): UserSession {
  const id = textOf(session.tokenId, session.id, session._id) ?? String(index);
  const deviceName = textOf(session.deviceName, session.device, session.os, session.browser, session.userAgent) ?? "دستگاه نامشخص";
  return {
    id,
    deviceName,
    ip: textOf(session.ip, session.ipAddress),
    lastActiveAt: textOf(session.lastActiveAt, session.lastSeenAt, session.updatedAt, session.createdAt),
    isCurrent: session.isCurrent ?? session.current ?? (currentTokenId !== null && id === currentTokenId),
  };
}

function sessionListOf(list: ApiSessionList) {
  if (Array.isArray(list)) return list;
  return list.items ?? list.sessions ?? [];
}

function chamberNameOf(role: ApiRole) {
  const candidates = [role.chamberName, role.chamber?.name, role.roomName, role.room?.name];
  const name = candidates.find((value): value is string => typeof value === "string" && value.trim() !== "");
  return name ? name.trim() : null;
}

function toUserRole(role: ApiRole, index: number): UserRole {
  return {
    ...role,
    id: String(role.roleId ?? role.id ?? role._id ?? index),
    roleTypeId: role.role == null ? undefined : String(role.role),
    title: role.title ?? role.name ?? "",
    province: role.province == null ? "" : String(role.province),
    chamberName: chamberNameOf(role),
  };
}

export const authApi = {
  getCaptcha: async (): Promise<Captcha> => {
    const { captchaId, imageContent } = await accountsHttp<CaptchaResponse>("/captcha/generate");
    return { id: captchaId, image: imageContent };
  },

  sendOtp: async ({ phone, captchaId, captchaValue }: SendOtpPayload): Promise<SendOtpResponse> => {
    const { ttl } = await accountsHttp<OtpSendResponse>("/auth/otp/send", {
      method: "POST",
      body: { phone, appHash: env.otpAppHash, captchaId, captchaAnswer: captchaValue, loginType: COMMERCE_LOGIN_TYPE },
    });
    return { resendIn: ttl };
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<AuthSession> => {
    const data = await accountsHttp<OtpVerifyResponse>("/auth/otp/verify", { method: "POST", body: payload });
    return {
      accessToken: data.sessionToken,
      tokenId: data.tokenId,
      user: { name: data.name, phone: data.phone, roles: (data.roles ?? []).map(toUserRole) },
    };
  },

  logout: async (tokenId: string) => {
    await accountsHttp(`/user/sessions/${tokenId}/logout`, { method: "POST" });
  },

  /** The user's active logins; the current one is matched against the stored token id. */
  getSessions: async (currentTokenId: string | null): Promise<UserSession[]> => {
    const list = await accountsHttp<ApiSessionList>("/user/sessions");
    return sessionListOf(list).map((session, index) => toUserSession(session, index, currentTokenId));
  },

  /** Ends one login; the current login uses the same route through `logout`. */
  logoutSession: async (id: string) => {
    await accountsHttp(`/user/sessions/${id}/logout`, { method: "POST" });
  },
};
