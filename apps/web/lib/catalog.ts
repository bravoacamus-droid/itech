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

export type ProductSort = "newest" | "price_asc" | "price_desc" | "name";

export type ProductFilters = {
  categorySlug?: string;
  q?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
};

export async function getProducts(
  opts: ProductFilters = {},
): Promise<{ items: ProductWithCategory[]; total: number }> {
  const supabase = await createClient();
  const pageSize = opts.pageSize ?? 12;
  const page = Math.max(1, opts.page ?? 1);

  let query = supabase
    .from("products")
    .select("*, category:categories(name, slug)", { count: "exact" })
    .eq("is_active", true);

  if (opts.categorySlug) {
    const cat = await getCategoryBySlug(opts.categorySlug);
    if (!cat) return { items: [], total: 0 };
    query = query.eq("category_id", cat.id);
  }

  if (opts.q) {
    // saneamos para no romper el filtro PostgREST
    const term = opts.q.replace(/[,()%*]/g, "").trim();
    if (term) query = query.or(`name.ilike.%${term}%,brand.ilike.%${term}%`);
  }
  if (opts.brand) query = query.eq("brand", opts.brand);
  if (opts.minPrice != null) query = query.gte("price", opts.minPrice);
  if (opts.maxPrice != null) query = query.lte("price", opts.maxPrice);

  switch (opts.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, count } = await query.returns<ProductWithCategory[]>();
  return { items: data ?? [], total: count ?? 0 };
}

export async function getBrands(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("brand")
    .eq("is_active", true)
    .not("brand", "is", null);
  const rows = (data ?? []) as { brand: string | null }[];
  const set = new Set<string>();
  rows.forEach((r) => {
    if (r.brand) set.add(r.brand);
  });
  return Array.from(set).sort();
}

export async function getRelatedProducts(
  product: Pick<Product, "id" | "category_id">,
  limit = 4,
): Promise<Product[]> {
  if (!product.category_id) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(limit)
    .returns<Product[]>();
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
