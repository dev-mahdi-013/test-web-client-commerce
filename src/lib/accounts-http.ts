import { env } from "@/config/env";
import { createHttpClient } from "./http";

const messages: Record<string, string> = {
  "please try again later": "تعداد درخواست‌ها زیاد است، کمی بعد دوباره تلاش کنید",
  "captcha answer is incorrect": "کد امنیتی اشتباه است",
  "error to verify code": "کد تأیید نادرست است",
  "access denied": "شما به این بخش دسترسی ندارید",
  "access denied !": "شما به این بخش دسترسی ندارید",
  "authentication error !": "نشست شما منقضی شده است، دوباره وارد شوید",
  "token not found or you not access": "نشست مورد نظر یافت نشد",
};

export const accountsHttp = createHttpClient({
  baseUrl: env.accountsApiUrl,
  authorization: (token) => token,
  unwrapEnvelope: true,
  translateMessage: (message) => messages[message.trim().toLowerCase()] ?? message,
});
