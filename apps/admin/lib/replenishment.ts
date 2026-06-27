import { createClient } from "@/lib/supabase/server";

export type ReplenishItem = {
  product_id: string;
  name: string;
  brand: string | null;
  stock: number;
  low_stock_threshold: number;
  sold: number;
  daily_avg: number;
  days_cover: number | null;
  suggested_qty: number;
};

export async function getReplenishment(
  branchId: string | null = null,
  windowDays = 30,
  targetDays = 30,
): Promise<ReplenishItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("replenishment_report" as never, {
    p_branch: branchId,
    p_window: windowDays,
    p_target_days: targetDays,
  } as never);
  if (error || !data) return [];
  return data as unknown as ReplenishItem[];
}
