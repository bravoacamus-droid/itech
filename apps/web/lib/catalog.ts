import type { Category, Product, ProductWithCategory } from "@itech/db";
import { createClient } from "@/lib/supabase/server";

export { formatPrice } from "@/lib/format";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .returns<Category[]>();
  return data ?? [];
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle<Category>();
  return data ?? null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<Product[]>();
  return data ?? [];
}

export async function getProducts(opts?: {
  categorySlug?: string;
}): Promise<ProductWithCategory[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, category:categories(name, slug)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (opts?.categorySlug) {
    const cat = await getCategoryBySlug(opts.categorySlug);
    if (!cat) return [];
    query = query.eq("category_id", cat.id);
  }

  const { data } = await query.returns<ProductWithCategory[]>();
  return data ?? [];
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithCategory | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(name, slug)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle<ProductWithCategory>();
  return data ?? null;
}
