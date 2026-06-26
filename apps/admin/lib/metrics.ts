import { createClient } from "@/lib/supabase/server";

export type Metrics = {
  total_sales: number;
  sales_30d: number;
  orders_count: number;
  pending_count: number;
  avg_ticket: number;
  low_stock_count: number;
  by_status: { status: string; count: number; total: number }[];
  top_products: { name: string; qty: number; revenue: number }[];
};

export async function getMetrics(): Promise<Metrics | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("dashboard_metrics" as never);
  if (error || !data) return null;
  return data as unknown as Metrics;
}

export function money(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return `S/ ${n.toFixed(2)}`;
}
