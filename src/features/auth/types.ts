import type { UserRole } from "@/features/profile/types";

export type Captcha = {
  id: string;
  image: string;
};

export type SendOtpPayload = {
  phone: string;
  captchaId: string;
  captchaValue: string;
};

export type SendOtpResponse = {
  /** Seconds until the user may request a new code */
  resendIn: number;
};

export type VerifyOtpPayload = {
  phone: string;
  code: string;
};

export type AuthUser = {
  name: string;
  phone: string;
  roles: UserRole[];
};

export type AuthSession = {
  accessToken: string;
  /** Identifies this session on the server, used to log it out */
  tokenId: string;
  user: AuthUser;
};

/** One of the user's logins, as listed in the active sessions dialog. */
export type UserSession = {
  /** Server id of the login; also the token id the logout endpoint expects */
  id: string;
  deviceName: string;
  ip: string | null;
  /** ISO date of the last activity, missing when the backend sends no timestamp */
  lastActiveAt: string | null;
  isCurrent: boolean;
  /** Panel label from the session's loginType (e.g. پنل بازرگانی); null when it is missing or unknown */
  panel: string | null;
};
