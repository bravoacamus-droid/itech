import { redirect } from "next/navigation";
import { ADMIN_ROLES, STAFF_ROLES, type AppRole } from "@itech/db";
import { createClient } from "@/lib/supabase/server";

/**
 * Garantiza que la request pertenece a un administrador.
 * Redirige a /login si no hay sesión, o a / si no tiene rol admin.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (data as { role: AppRole } | null)?.role;
  if (!role || !ADMIN_ROLES.includes(role)) redirect("/");

  return { supabase, user, role };
}

/**
 * Garantiza acceso al back-office a nivel staff (cajero, almacén, etc.).
 * Los datos quedan acotados por sucursal vía RLS. Devuelve isAdmin para
 * mostrar/ocultar funciones globales.
 */
export async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (data as { role: AppRole } | null)?.role;
  if (!role || !STAFF_ROLES.includes(role)) redirect("/");

  return { supabase, user, role, isAdmin: ADMIN_ROLES.includes(role) };
}
