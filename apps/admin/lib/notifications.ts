import { createClient } from "@/lib/supabase/server";

export type Notification = {
  id: string;
  channel: string;
  recipient: string;
  subject: string | null;
  body: string;
  status: string;
  related_type: string | null;
  created_at: string;
  sent_at: string | null;
};

export async function listNotifications(limit = 100): Promise<Notification[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, channel, recipient, subject, body, status, related_type, created_at, sent_at")
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<Notification[]>();
  return data ?? [];
}

export async function pendingCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("status", "pendiente");
  return count ?? 0;
}

/** Link wa.me de 1 clic para enviar la notificación por WhatsApp. */
export function waLink(recipient: string, body: string): string {
  const phone = recipient.replace(/\D/g, "");
  const num = phone.startsWith("51") ? phone : `51${phone}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(body)}`;
}
