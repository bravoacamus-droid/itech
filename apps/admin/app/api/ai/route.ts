import { NextResponse } from "next/server";
import { ADMIN_ROLES, type AppRole } from "@itech/db";
import { generateText, generateJson } from "@itech/ai";
import { createClient } from "@/lib/supabase/server";

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = (data as { role: AppRole } | null)?.role;
  // permitimos cualquier staff (incluye técnicos), no solo admins
  const staff = role
    ? [...ADMIN_ROLES, "technician", "cashier", "warehouse_clerk", "accountant", "branch_manager"].includes(role)
    : false;
  return staff ? { supabase } : null;
}

export async function POST(request: Request) {
  const ctx = await requireStaff();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { supabase } = ctx;

  let payload: { action?: string; ticketId?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    if (payload.action === "suggest_reply" && payload.ticketId) {
      const { data: t } = await supabase
        .from("support_tickets")
        .select("subject, priority, company:companies(name)")
        .eq("id", payload.ticketId)
        .maybeSingle();
      const { data: msgs } = await supabase
        .from("support_messages")
        .select("author_type, body, created_at")
        .eq("ticket_id", payload.ticketId)
        .order("created_at", { ascending: true });
      const ticket = t as { subject?: string; priority?: string; company?: { name?: string } } | null;
      const conversation = ((msgs ?? []) as { author_type: string; body: string }[])
        .map((m) => `${m.author_type === "soporte" ? "Soporte" : "Cliente"}: ${m.body}`)
        .join("\n");

      const text = await generateText({
        system:
          "Eres un agente de soporte técnico de iTech Import Perú. Redacta respuestas claras, " +
          "amables y profesionales en español (Perú). Sé conciso y orientado a la solución. " +
          "No inventes datos; si falta información, pídela.",
        prompt:
          `Empresa: ${ticket?.company?.name ?? "—"}\n` +
          `Asunto: ${ticket?.subject ?? "—"} (prioridad ${ticket?.priority ?? "media"})\n\n` +
          `Conversación hasta ahora:\n${conversation || "(sin mensajes)"}\n\n` +
          `Redacta la próxima respuesta del agente de soporte.`,
        temperature: 0.5,
      });
      return NextResponse.json({ text });
    }

    if (payload.action === "triage" && payload.ticketId) {
      const { data: t } = await supabase
        .from("support_tickets")
        .select("subject")
        .eq("id", payload.ticketId)
        .maybeSingle();
      const { data: first } = await supabase
        .from("support_messages")
        .select("body")
        .eq("ticket_id", payload.ticketId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      const subject = (t as { subject?: string } | null)?.subject ?? "";
      const body = (first as { body?: string } | null)?.body ?? "";

      const result = await generateJson<{
        priority: string;
        category: string;
        summary: string;
      }>({
        system:
          "Clasificas tickets de soporte técnico de TI. Responde SOLO JSON con las claves " +
          "priority (uno de: baja, media, alta, urgente), category (texto corto) y summary " +
          "(resumen en una frase, español).",
        prompt: `Asunto: ${subject}\nDescripción: ${body}`,
        temperature: 0.1,
      });
      return NextResponse.json({ triage: result });
    }

    return NextResponse.json({ error: "Acción no soportada" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error de IA" },
      { status: 500 },
    );
  }
}
