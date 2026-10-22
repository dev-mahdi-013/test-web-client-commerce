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
