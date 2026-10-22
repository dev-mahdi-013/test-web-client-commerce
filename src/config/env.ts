export const env = {
  accountsApiUrl: import.meta.env.VITE_ACCOUNTS_API_URL ?? "https://dev.hoopeo.ir/7a909a25b36a0469/accounts/v1",
  commerceApiUrl: import.meta.env.VITE_COMMERCE_API_URL ?? "https://dev.hoopeo.ir/7a909a25b36a0469/commerce/v1",
  /** Required by OTP send; it is the Android SMS Retriever hash, so the web client has none of its own */
  otpAppHash: import.meta.env.VITE_OTP_APP_HASH ?? "",
} as const;
