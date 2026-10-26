import { env } from "@/config/env";
import { accountsHttp } from "@/lib/accounts-http";
import type { UserRole } from "@/features/profile/types";
import type { AuthSession, Captcha, SendOtpPayload, SendOtpResponse, UserSession, VerifyOtpPayload } from "../types";

/** Account Service login types, as listed in its API docs. */
const LOGIN_TYPE = {
  admin: 0xff16,
  town: 0xff26,
  commerce: 0xff36,
} as const;

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
  associationName?: string;
  association?: { name?: string };
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

type ApiSessionDevice = {
  name?: string;
  os?: string;
  os_version?: string;
};

type ApiSession = {
  [key: string]: unknown;
  id?: string | number;
  _id?: string;
  tokenId?: string;
  device?: string | ApiSessionDevice;
  deviceName?: string;
  os?: string;
  browser?: string;
  userAgent?: string;
  ip?: string;
  ipAddress?: string;
  lastAccess?: number | string;
  lastActiveAt?: string;
  lastSeenAt?: string;
  updatedAt?: string;
  createdAt?: string;
  current?: boolean;
  isCurrent?: boolean;
  loginType?: number | string;
};

type ApiSessionList = ApiSession[] | { items?: ApiSession[]; sessions?: ApiSession[] };

function textOf(...candidates: unknown[]) {
  const value = candidates.find((item): item is string => typeof item === "string" && item.trim() !== "");
  return value ? value.trim() : null;
}

function dateOf(...candidates: unknown[]) {
  for (const candidate of candidates) {
    const time =
      typeof candidate === "number"
        ? candidate
        : typeof candidate === "string" && candidate.trim() !== ""
          ? /^\d+$/.test(candidate.trim())
            ? Number(candidate)
            : new Date(candidate).getTime()
          : Number.NaN;
    const date = new Date(time);
    if (Number.isFinite(time) && !Number.isNaN(date.getTime())) return date.toISOString();
  }
  return null;
}

/** Panel labels by backend login type; the docs name the types but not their Persian labels. */
const panelByLoginType: Record<number, string> = {
  [LOGIN_TYPE.admin]: "پنل ادمین",
  [LOGIN_TYPE.town]: "پنل شهر",
  [LOGIN_TYPE.commerce]: "پنل بازرگانی",
};

/** Reads the numeric login type, accepting plain numbers, decimal strings and hex strings. */
function loginTypeCode(loginType: number | string | undefined) {
  if (typeof loginType === "number") return Number.isFinite(loginType) ? loginType : null;
  const raw = loginType?.trim();
  if (!raw) return null;
  const code = /^0x/i.test(raw)
    ? Number.parseInt(raw.slice(2), 16)
    : /^\d+$/.test(raw)
      ? Number(raw)
      : Number.NaN;
  return Number.isFinite(code) ? code : null;
}

/** The badge text follows the login type the sessions service reports, never the current app. */
function panelOf(loginType: number | string | undefined) {
  const code = loginTypeCode(loginType);
  return code === null ? null : (panelByLoginType[code] ?? null);
}

function toUserSession(session: ApiSession, index: number, currentTokenId: string | null): UserSession {
  const id = textOf(session.tokenId, session.id, session._id) ?? String(index);
  const device = typeof session.device === "object" ? session.device : null;
  const deviceName =
    [device?.name, session.deviceName, typeof session.device === "string" ? session.device : null, session.browser]
      .map((value) => textOf(value))
      .find((value) => value !== null) ?? "دستگاه نامشخص";
  const operatingSystem = textOf(device?.os, session.os);
  return {
    id,
    deviceName: operatingSystem && operatingSystem !== deviceName ? `${deviceName} - ${operatingSystem}` : deviceName,
    ip: textOf(session.ip, session.ipAddress),
    lastActiveAt: dateOf(session.lastAccess, session.lastActiveAt, session.lastSeenAt, session.updatedAt, session.createdAt),
    isCurrent: session.isCurrent ?? session.current ?? (currentTokenId !== null && id === currentTokenId),
    panel: panelOf(session.loginType),
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

function associationNameOf(role: ApiRole) {
  return textOf(role.associationName, role.association?.name);
}

function toUserRole(role: ApiRole, index: number): UserRole {
  return {
    ...role,
    id: String(role.roleId ?? role.id ?? role._id ?? index),
    roleTypeId: role.role == null ? undefined : String(role.role),
    title: role.title ?? role.name ?? "",
    province: role.province == null ? "" : String(role.province),
    chamberName: chamberNameOf(role),
    associationName: associationNameOf(role),
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
      body: { phone, appHash: env.otpAppHash, captchaId, captchaAnswer: captchaValue, loginType: LOGIN_TYPE.commerce },
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

  /**
   * Ends the login with this token id. The access token is passed explicitly because the caller clears the stored
   * session right after (the request interceptor reads the store later, when it would already be empty).
   */
  logout: async (tokenId: string, accessToken: string) => {
    await accountsHttp(`/user/sessions/${encodeURIComponent(tokenId)}/logout`, {
      method: "POST",
      headers: { Authorization: accessToken },
    });
  },

  /** The user's active logins; the current one is matched against the stored token id. */
  getSessions: async (currentTokenId: string | null): Promise<UserSession[]> => {
    const list = await accountsHttp<ApiSessionList>("/user/sessions/list");
    return sessionListOf(list).map((session, index) => toUserSession(session, index, currentTokenId));
  },

  /** Ends one login; the current login uses the same route through `logout`. */
  logoutSession: async (id: string) => {
    await accountsHttp(`/user/sessions/${encodeURIComponent(id)}/logout`, { method: "POST" });
  },
};
