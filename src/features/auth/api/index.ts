export { authApi } from "./auth.api";

export const authKeys = {
  all: ["auth"] as const,
  captcha: () => [...authKeys.all, "captcha"] as const,
  sessions: () => [...authKeys.all, "sessions"] as const,
};
