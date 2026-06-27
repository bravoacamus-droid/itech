import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser, type PushPayload } from "./server";

/** Roles que reciben avisos operativos (stock bajo, etc.). Constante compartida. */
export const OPS_NOTIFY_ROLES = ["super_admin", "org_admin", "branch_manager", "warehouse_clerk"];

async function log(
  source: string,
  target: string | null,
  title: string,
  status: "attempt" | "ok" | "error",
  detail?: string,
) {
  try {
    const admin = createAdminClient();
    await admin.from("push_log").insert({
      source,
      target_user_id: target,
      title,
      status,
      detail: detail ?? null,
    } as never);
  } catch {
    // nunca debe romper el flujo de negocio
  }
}

/** Notifica a un usuario. NUNCA lanza; loguea attempt/ok/error en push_log. */
export async function notifyUser(userId: string, payload: PushPayload, source = "app") {
  await log(source, userId, payload.title, "attempt");
  try {
    const { sent } = await sendPushToUser(userId, payload);
    await log(source, userId, payload.title, "ok", `sent=${sent}`);
    return { sent };
  } catch (e) {
    await log(source, userId, payload.title, "error", e instanceof Error ? e.message : String(e));
    return { sent: 0 };
  }
}

/** Notifica a todos los usuarios con alguno de los roles dados. NUNCA lanza. */
export async function notifyRoles(roles: string[], payload: PushPayload, source = "app") {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("profiles").select("id").in("role", roles);
    const ids = ((data ?? []) as { id: string }[]).map((p) => p.id);
    await Promise.all(ids.map((id) => notifyUser(id, payload, source)));
  } catch (e) {
    await log(source, null, payload.title, "error", e instanceof Error ? e.message : String(e));
  }
}
