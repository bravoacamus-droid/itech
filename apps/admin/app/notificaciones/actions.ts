"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function markSent(id: string) {
  const { supabase } = await requireAdmin();
  await supabase
    .from("notifications")
    .update({ status: "enviado", sent_at: new Date().toISOString() } as never)
    .eq("id", id);
  revalidatePath("/notificaciones");
}

export async function discard(id: string) {
  const { supabase } = await requireAdmin();
  await supabase
    .from("notifications")
    .update({ status: "descartado" } as never)
    .eq("id", id);
  revalidatePath("/notificaciones");
}

export async function sendPendingEmails() {
  const { supabase } = await requireAdmin();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "iTech <onboarding@resend.dev>";

  const { data } = await supabase
    .from("notifications")
    .select("id, recipient, subject, body")
    .eq("channel", "email")
    .eq("status", "pendiente")
    .limit(50);
  const rows = (data ?? []) as { id: string; recipient: string; subject: string | null; body: string }[];

  if (!apiKey) {
    throw new Error(
      "Falta RESEND_API_KEY en el servidor. Agrégala para enviar emails automáticamente.",
    );
  }

  for (const n of rows) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [n.recipient],
          subject: n.subject || "Notificación de iTech",
          text: n.body,
        }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
      await supabase
        .from("notifications")
        .update({ status: "enviado", sent_at: new Date().toISOString(), error: null } as never)
        .eq("id", n.id);
    } catch (e) {
      await supabase
        .from("notifications")
        .update({ status: "error", error: e instanceof Error ? e.message : "error" } as never)
        .eq("id", n.id);
    }
  }
  revalidatePath("/notificaciones");
}
