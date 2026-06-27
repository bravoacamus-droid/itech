import { createClient } from "@/lib/supabase/server";

export type Quote = {
  id: string;
  quote_number: string;
  token: string;
  customer_name: string;
  customer_doc: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  currency: string;
  total: number;
  notes: string | null;
  valid_until: string | null;
  status: string;
  created_at: string;
};

export type QuoteItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export const QUOTE_STATUS_LABEL: Record<string, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
  vencida: "Vencida",
};

export async function listQuotes(): Promise<Quote[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quotes")
    .select("id, quote_number, token, customer_name, total, status, valid_until, created_at")
    .order("created_at", { ascending: false })
    .returns<Quote[]>();
  return data ?? [];
}

export async function getQuote(id: string): Promise<Quote | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("quotes").select("*").eq("id", id).maybeSingle<Quote>();
  return data ?? null;
}

export async function getQuoteItems(id: string): Promise<QuoteItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quote_items")
    .select("id, description, quantity, unit_price, line_total")
    .eq("quote_id", id)
    .returns<QuoteItem[]>();
  return data ?? [];
}

export async function getCatalogForPicker() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("name, price")
    .eq("is_active", true)
    .order("name", { ascending: true });
  return (data ?? []) as { name: string; price: number }[];
}

export function money(v: number | string | null | undefined): string {
  return `S/ ${Number(v ?? 0).toFixed(2)}`;
}
