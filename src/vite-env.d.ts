/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ACCOUNTS_API_URL?: string;
  readonly VITE_COMMERCE_API_URL?: string;
  readonly VITE_OTP_APP_HASH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
