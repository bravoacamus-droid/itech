import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con service_role: BYPASS de RLS. Úsalo SOLO en el servidor
 * (route handlers / server actions) para lookups internos tras validar permisos.
 * Evita el bug de "SELECT post-UPDATE devuelve null silencioso por RLS".
 * Sin genérico <Database> a propósito: la tabla push_subscriptions/push_log no
 * están en los tipos hechos a mano, y este cliente accede a todo el esquema.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
