import type { Category, Product, ProductWithCategory } from "@itech/db";
import { createClient } from "@/lib/supabase/server";

/** Lista todos los productos (incluye inactivos) para el back-office. */
export async function listProducts(): Promise<ProductWithCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(name, slug)")
    .order("created_at", { ascending: false })
    .returns<ProductWithCategory[]>();
  return data ?? [];
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle<Product>();
  return data ?? null;
}

export async function listCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .returns<Category[]>();
  return data ?? [];
}

export function formatPrice(value: number, currency = "PEN"): string {
  const symbol = currency === "PEN" ? "S/" : currency + " ";
  return `${symbol} ${value.toFixed(2)}`;
}
