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

export async function listInventoryByBranch(branchId: string): Promise<InventoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("branch_stock")
    .select("product_id, stock, low_stock_threshold, products(name, brand, image_url, is_active)")
    .eq("branch_id", branchId)
    .order("stock", { ascending: true });
  const rows = (data ?? []) as unknown as {
    product_id: string;
    stock: number;
    low_stock_threshold: number;
    products: { name: string; brand: string | null; image_url: string | null; is_active: boolean } | null;
  }[];
  return rows
    .filter((r) => r.products)
    .map((r) => ({
      id: r.product_id,
      name: r.products!.name,
      brand: r.products!.brand,
      image_url: r.products!.image_url,
      stock: r.stock,
      low_stock_threshold: r.low_stock_threshold,
      is_active: r.products!.is_active,
    }));
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
