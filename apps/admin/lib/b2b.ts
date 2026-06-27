import { createClient } from "@/lib/supabase/server";

export const SUPPORT_STATUSES = ["abierto", "en_proceso", "resuelto", "cerrado"] as const;
export const SUPPORT_STATUS_LABEL: Record<string, string> = {
  abierto: "Abierto",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
};
export const PRIORITY_LABEL: Record<string, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
};

export type Company = {
  id: string;
  name: string;
  ruc: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  plan: string;
  is_active: boolean;
  created_at: string;
};

export type SupportTicket = {
  id: string;
  ticket_number: string;
  company_id: string;
  subject: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  sla_due_at: string | null;
  resolved_at: string | null;
  created_at: string;
};

export type SupportMessage = {
  id: string;
  author_type: string;
  body: string;
  created_at: string;
};

export async function listCompanies(): Promise<Company[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Company[]>();
  return data ?? [];
}

export async function getCompany(id: string): Promise<Company | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("companies").select("*").eq("id", id).maybeSingle<Company>();
  return data ?? null;
}

export async function getCompanyMembers(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("company_id", id);
  return (data ?? []) as { id: string; full_name: string | null; role: string }[];
}

export async function listSupportTickets(): Promise<
  (SupportTicket & { company: { name: string } | null })[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("support_tickets")
    .select("*, company:companies(name)")
    .order("created_at", { ascending: false })
    .returns<(SupportTicket & { company: { name: string } | null })[]>();
  return data ?? [];
}

export async function getSupportTicket(
  id: string,
): Promise<(SupportTicket & { company: { name: string } | null }) | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("support_tickets")
    .select("*, company:companies(name)")
    .eq("id", id)
    .maybeSingle<SupportTicket & { company: { name: string } | null }>();
  return data ?? null;
}

export async function getSupportMessages(id: string): Promise<SupportMessage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("support_messages")
    .select("id, author_type, body, created_at")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true })
    .returns<SupportMessage[]>();
  return data ?? [];
}

export type B2bMetrics = {
  companies: number;
  open_tickets: number;
  overdue: number;
  resolved: number;
  sla_compliance: number;
  by_company: {
    name: string;
    plan: string;
    open: number;
    total: number;
    overdue: number;
    repairs: number;
  }[];
};

export async function getB2bMetrics(): Promise<B2bMetrics | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("b2b_metrics" as never);
  if (error || !data) return null;
  return data as unknown as B2bMetrics;
}

export function slaState(t: { sla_due_at: string | null; status: string }) {
  if (!t.sla_due_at || t.status === "resuelto" || t.status === "cerrado") return "ok";
  return new Date(t.sla_due_at).getTime() < Date.now() ? "vencido" : "en_plazo";
}
