import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ ok: false, items: [], unread: 0 }, { status: 401 });

  const { data } = await supabase
    .from("user_notifications")
    .select("id, title, body, url, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  const { count } = await supabase
    .from("user_notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  return Response.json({ ok: true, items: data ?? [], unread: count ?? 0 });
}
