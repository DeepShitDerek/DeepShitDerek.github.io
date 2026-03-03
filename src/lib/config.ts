import { SESSION_MAX_AGE_MS, BUCKET_NAME } from "./constants";

/** Default site URL for fallback */
const DEFAULT_SITE_URL = "https://abharadva.github.io";

export interface AppConfig {
  admin: Record<string, never>;
  mfa: {
    appName: string;
    issuer: string;
  };
  site: {
    title: string;
    description: string;
    url: string;
    defaultOgImage: string;
    author: string;
    twitterHandle?: string;
  };
  supabase: {
    url: string;
    anonKey: string;
    bucketName: string;
  };
  session: {
    maxAge: number;
  };
}

export const config: AppConfig = {
  admin: {},
  mfa: {
    appName: process.env.NEXT_PUBLIC_APP_NAME || "Akshay Bharadva | Portfolio",
    issuer: process.env.NEXT_PUBLIC_MFA_ISSUER || "Akshay Bharadva | MFA",
  },
  site: {
    title: process.env.NEXT_PUBLIC_SITE_TITLE || "Akshay Bharadva | Portfolio",
    description:
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
      "A modern portfolio website with blog functionality, built by Akshay Bharadva.",
    url: process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL,
    defaultOgImage: `${process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL}/default-og-image.png`,
    author: "Akshay Bharadva",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    bucketName: BUCKET_NAME,
  },
  session: {
    maxAge: SESSION_MAX_AGE_MS,
  },
};

// --- CONFIGURATION VALIDATION ---
export const isSupabaseConfigured =
  !!config.supabase.url && !!config.supabase.anonKey;

if (!isSupabaseConfigured) {
  console.info(
    "⚠️ Supabase credentials not found. App running in STATIC MOCK MODE.",
  );
}