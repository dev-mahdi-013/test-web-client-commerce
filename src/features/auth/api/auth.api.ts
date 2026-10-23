import { env } from "@/config/env";
import { accountsHttp } from "@/lib/accounts-http";
import type { UserRole } from "@/features/profile/types";
import type { AuthSession, Captcha, SendOtpPayload, SendOtpResponse, VerifyOtpPayload } from "../types";

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
};
