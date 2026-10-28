function required(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing env variable: ${name}. Check your .env.<mode> file.`);
  }
  return value;
}

export const env = {
  accountsApiUrl: required("VITE_ACCOUNTS_API_URL"),
  commerceApiUrl: required("VITE_COMMERCE_API_URL"),
  /** Required by OTP send; it is the Android SMS Retriever hash, so the web client has none of its own */
  otpAppHash: import.meta.env.VITE_OTP_APP_HASH ?? "",
} as const;
