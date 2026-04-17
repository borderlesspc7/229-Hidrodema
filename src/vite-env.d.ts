/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  /** Base URL da API externa de vendedores (ex.: https://api.exemplo.com/v1). */
  readonly VITE_SELLER_API_BASE_URL?: string;
  readonly VITE_SELLER_API_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
