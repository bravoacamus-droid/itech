import { createClient } from "@/lib/supabase/server";
import { notifyUser } from "@/lib/push/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ ok: false, error: "No autorizado" }, { status: 401 });

  const { sent } = await notifyUser(
    user.id,
    {
      title: "iTech ERP",
      body: "Notificación de prueba ✔ Push funcionando.",
      url: "/",
      tag: "test",
    },
    "api/push/test",
  );
  return Response.json({ ok: true, enviadas: sent });
}
