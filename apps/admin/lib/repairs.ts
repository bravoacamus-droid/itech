import { createClient } from "@/lib/supabase/server";

export const REPAIR_STATUSES = [
  "recibido",
  "diagnostico",
  "esperando_repuesto",
  "en_reparacion",
  "listo",
  "entregado",
  "anulado",
] as const;

export const STATUS_LABEL: Record<string, string> = {
  recibido: "Recibido",
  diagnostico: "En diagnóstico",
  esperando_repuesto: "Esperando repuesto",
  en_reparacion: "En reparación",
  listo: "Listo para retirar",
  entregado: "Entregado",
  anulado: "Anulado",
};

export type Ticket = {
  id: string;
  ticket_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  device_type: string | null;
  brand: string | null;
  model: string | null;
  imei_serial: string | null;
  reported_issue: string | null;
  diagnosis: string | null;
  technician_name: string | null;
  status: string;
  estimated_cost: number | null;
  company_id: string | null;
  warranty_days: number;
  parent_ticket_id: string | null;
  is_warranty: boolean;
  created_at: string;
  delivered_at: string | null;
};

/** Días restantes de garantía (si fue entregado); null si no aplica. */
export function warrantyLeft(t: {
  delivered_at: string | null;
  warranty_days: number;
}): number | null {
  if (!t.delivered_at || !t.warranty_days) return null;
  const until = new Date(t.delivered_at).getTime() + t.warranty_days * 86400000;
  return Math.max(0, Math.ceil((until - Date.now()) / 86400000));
}

export type TicketUpdate = {
  id: string;
  status: string;
  note: string | null;
  created_at: string;
};

export async function listTickets(status?: string): Promise<Ticket[]> {
  const supabase = await createClient();
  let query = supabase
    .from("repair_tickets")
    .select(
      "id, ticket_number, customer_name, customer_phone, device_type, brand, model, technician_name, status, estimated_cost, created_at",
    )
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data } = await query.returns<Ticket[]>();
  return data ?? [];
}

export async function getTicket(id: string): Promise<Ticket | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("repair_tickets")
    .select("*")
    .eq("id", id)
    .maybeSingle<Ticket>();
  return data ?? null;
}

export async function getTicketUpdates(id: string): Promise<TicketUpdate[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("repair_updates")
    .select("id, status, note, created_at")
    .eq("ticket_id", id)
    .order("created_at", { ascending: false })
    .returns<TicketUpdate[]>();
  return data ?? [];
}

export async function statusCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase.from("repair_tickets").select("status");
  const rows = (data ?? []) as { status: string }[];
  const counts: Record<string, number> = {};
  rows.forEach((r) => (counts[r.status] = (counts[r.status] ?? 0) + 1));
  return counts;
}
