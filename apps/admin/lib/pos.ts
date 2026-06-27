import { createClient } from "@/lib/supabase/server";

export type CashSession = {
  id: string;
  opened_at: string;
  opening_amount: number;
  status: string;
  branch_id: string | null;
};

export type PosProduct = {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  sku: string | null;
};

export async function getOpenSession(): Promise<CashSession | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cash_sessions")
    .select("id, opened_at, opening_amount, status, branch_id")
    .eq("status", "abierta")
    .order("opened_at", { ascending: false })
    .limit(1)
    .maybeSingle<CashSession>();
  return data ?? null;
}

export async function getSessionSummary(sessionId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("payment_method, total, status")
    .eq("cash_session_id", sessionId);
  const rows = (data ?? []) as {
    payment_method: string;
    total: number;
    status: string;
  }[];
  const valid = rows.filter((r) => r.status !== "anulado");
  const byMethod: Record<string, number> = {};
  let total = 0;
  for (const r of valid) {
    const t = Number(r.total);
    byMethod[r.payment_method] = (byMethod[r.payment_method] ?? 0) + t;
    total += t;
  }
  return { count: valid.length, total, byMethod, cash: byMethod["efectivo"] ?? 0 };
}

export async function getPosProducts(): Promise<PosProduct[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, brand, price, stock, image_url, sku")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .returns<PosProduct[]>();
  return data ?? [];
}

export async function getMyOpenTimeEntry() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("time_entries")
    .select("id, clock_in")
    .eq("user_id", user.id)
    .is("clock_out", null)
    .maybeSingle();
  return data as { id: string; clock_in: string } | null;
}

export function money(value: number | string | null | undefined): string {
  return `S/ ${Number(value ?? 0).toFixed(2)}`;
}
