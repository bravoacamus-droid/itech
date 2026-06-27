import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ ok: false }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const id = body?.id as string | undefined;
  const now = new Date().toISOString();

  // RLS limita a las del propio usuario.
  let q = supabase.from("user_notifications").update({ read_at: now } as never).is("read_at", null);
  if (id) q = supabase.from("user_notifications").update({ read_at: now } as never).eq("id", id);
  const { error } = await q;
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
