
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOPIFY_ACCESS_TOKEN: string;
  readonly VITE_SHOPIFY_STORE_URL: string;
  readonly VITE_SHOPIFY_API_KEY: string;
  readonly VITE_SHOPIFY_API_SECRET: string;
  readonly VITE_FB_APP_ID: string;
  readonly VITE_FB_BUSINESS_ID: string;
  readonly VITE_FB_ACCESS_TOKEN: string;
  readonly VITE_FB_AD_ACCOUNT_ID: string;
  readonly VITE_APPMAX_API_KEY: string;
  readonly VITE_APPMAX_SECRET_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Add Node.js global type definitions
declare namespace NodeJS {
  interface ProcessEnv extends ImportMetaEnv {}
}
