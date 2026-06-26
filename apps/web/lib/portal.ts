import { createClient } from "@/lib/supabase/server";

export const SUPPORT_STATUS_LABEL: Record<string, string> = {
  abierto: "Abierto",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
  cerrado: "Cerrado",
};
export const REPAIR_STATUS_LABEL: Record<string, string> = {
  recibido: "Recibido",
  diagnostico: "En diagnóstico",
  esperando_repuesto: "Esperando repuesto",
  en_reparacion: "En reparación",
  listo: "Listo para retirar",
  entregado: "Entregado",
  anulado: "Anulado",
};

export type PortalUser = {
  userId: string;
  company: { id: string; name: string; plan: string } | null;
};

export async function getPortalUser(): Promise<PortalUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();
  const companyId = (profile as { company_id?: string } | null)?.company_id;
  if (!companyId) return { userId: user.id, company: null };

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, plan")
    .eq("id", companyId)
    .maybeSingle();
  return {
    userId: user.id,
    company: (company as { id: string; name: string; plan: string } | null) ?? null,
  };
}

export async function getMyRepairs() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("repair_tickets")
    .select("id, ticket_number, status, device_type, brand, model, created_at")
    .order("created_at", { ascending: false });
  return (data ?? []) as {
    id: string;
    ticket_number: string;
    status: string;
    device_type: string | null;
    brand: string | null;
    model: string | null;
    created_at: string;
  }[];
}

export async function getMySupport() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("support_tickets")
    .select("id, ticket_number, subject, status, priority, created_at")
    .order("created_at", { ascending: false });
  return (data ?? []) as {
    id: string;
    ticket_number: string;
    subject: string;
    status: string;
    priority: string;
    created_at: string;
  }[];
}

export async function getSupportThread(id: string) {
  const supabase = await createClient();
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id, ticket_number, subject, status, priority")
    .eq("id", id)
    .maybeSingle();
  if (!ticket) return null;
  const { data: messages } = await supabase
    .from("support_messages")
    .select("id, author_type, body, created_at")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });
  return {
    ticket: ticket as {
      id: string;
      ticket_number: string;
      subject: string;
      status: string;
      priority: string;
    },
    messages: (messages ?? []) as {
      id: string;
      author_type: string;
      body: string;
      created_at: string;
    }[],
  };
}
