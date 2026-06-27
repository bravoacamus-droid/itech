import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { vapidStatus, sendPushToUser } from "@/lib/push/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Diagnóstico de push: estado VAPID, n.º de suscripciones y prueba de envío. */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });

  const vapid = vapidStatus();

  let count = 0;
  try {
    const admin = createAdminClient();
    const { count: c } = await admin
      .from("push_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    count = c ?? 0;
  } catch (e) {
    return Response.json({ ok: false, vapid, error: e instanceof Error ? e.message : String(e) });
  }

  let testPush: { ok: boolean; sent?: number; error?: string } = { ok: false };
  try {
    const { sent } = await sendPushToUser(user.id, {
      title: "iTech ERP — diagnóstico",
      body: "Si ves esto, push está OK.",
      url: "/",
      tag: "diag",
    });
    testPush = { ok: sent > 0, sent };
  } catch (e) {
    testPush = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  return Response.json({
    ok: vapid.public && vapid.private && vapid.serviceRole,
    vapid,
    suscripciones: { count },
    testPush,
  });
}
