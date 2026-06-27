import { createClient } from "@/lib/supabase/server";

export type FiscalConfig = {
  id: string;
  ruc: string | null;
  razon_social: string | null;
  direccion: string | null;
  ubigeo: string | null;
  factura_serie: string;
  boleta_serie: string;
  environment: string;
  sol_user: string | null;
  cert_uploaded: boolean;
  igv_rate: number;
};

export type Invoice = {
  id: string;
  order_id: string | null;
  doc_type: string;
  full_number: string;
  customer_doc_type: string;
  customer_doc: string | null;
  customer_name: string;
  currency: string;
  op_gravada: number;
  igv: number;
  total: number;
  status: string;
  created_at: string;
};

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  igv: number;
  line_total: number;
};

export const DOC_LABEL: Record<string, string> = { "01": "Factura", "03": "Boleta" };
export const INVOICE_STATUS_LABEL: Record<string, string> = {
  borrador: "Borrador",
  firmado: "Firmado",
  enviado: "Enviado",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
  anulado: "Anulado",
};

export async function getFiscalConfig(): Promise<FiscalConfig | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("fiscal_config")
    .select("*")
    .eq("id", "default")
    .maybeSingle<FiscalConfig>();
  return data ?? null;
}

export async function listInvoices(): Promise<Invoice[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("id, order_id, doc_type, full_number, customer_doc, customer_name, currency, op_gravada, igv, total, status, created_at")
    .order("created_at", { ascending: false })
    .returns<Invoice[]>();
  return data ?? [];
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("invoices").select("*").eq("id", id).maybeSingle<Invoice>();
  return data ?? null;
}

export async function getInvoiceItems(id: string): Promise<InvoiceItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoice_items")
    .select("id, description, quantity, unit_price, igv, line_total")
    .eq("invoice_id", id)
    .returns<InvoiceItem[]>();
  return data ?? [];
}

export function money(v: number | string | null | undefined): string {
  return `S/ ${Number(v ?? 0).toFixed(2)}`;
}
