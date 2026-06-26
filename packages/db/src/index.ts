import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export type { Database, AppRole } from "./types";
export { ADMIN_ROLES } from "./types";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return v;
}

/** Cliente Supabase para el navegador (clave anónima, sujeto a RLS). */
export function getBrowserSupabase() {
  return createBrowserClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
}

export const SUPABASE_URL_ENV = "NEXT_PUBLIC_SUPABASE_URL";
export const SUPABASE_ANON_ENV = "NEXT_PUBLIC_SUPABASE_ANON_KEY";
