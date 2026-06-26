import { createClient } from "@/lib/supabase/server";

export type InventoryRow = {
  id: string;
  name: string;
  brand: string | null;
  image_url: string | null;
  stock: number;
  low_stock_threshold: number;
  is_active: boolean;
};

export type Movement = {
  id: string;
  delta: number;
  reason: string;
  note: string | null;
  resulting_stock: number;
  created_at: string;
};

export async function listInventory(): Promise<InventoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, brand, image_url, stock, low_stock_threshold, is_active")
    .order("stock", { ascending: true })
    .returns<InventoryRow[]>();
  return data ?? [];
}

export async function getInventoryItem(id: string): Promise<InventoryRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, brand, image_url, stock, low_stock_threshold, is_active")
    .eq("id", id)
    .maybeSingle<InventoryRow>();
  return data ?? null;
}

export async function listMovements(productId: string): Promise<Movement[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stock_movements")
    .select("id, delta, reason, note, resulting_stock, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<Movement[]>();
  return data ?? [];
}

export function isLow(row: { stock: number; low_stock_threshold: number }) {
  return row.stock <= row.low_stock_threshold;
}
