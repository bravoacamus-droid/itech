import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { FiltersBar } from "@/components/filters-bar";
import {
  getBrands,
  getCategories,
  getProducts,
  type ProductSort,
} from "@/lib/catalog";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const q = one(sp.q)?.trim() || undefined;
  const category = one(sp.category) || undefined;
  const brand = one(sp.brand) || undefined;
  const min = one(sp.min);
  const max = one(sp.max);
  const sort = (one(sp.sort) as ProductSort) || "newest";
  const page = Math.max(1, parseInt(one(sp.page) ?? "1", 10) || 1);

  const minPrice = min ? parseFloat(min) : undefined;
  const maxPrice = max ? parseFloat(max) : undefined;

  const [categories, brands, result] = await Promise.all([
    getCategories(),
    getBrands(),
    getProducts({
      categorySlug: category,
      q,
      brand,
      minPrice,
      maxPrice,
      sort,
      page,
      pageSize: PAGE_SIZE,
    }),
  ]);

  const { items, total } = result;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Construye un querystring conservando filtros para la paginación
  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);
  if (category) baseParams.set("category", category);
  if (brand) baseParams.set("brand", brand);
  if (min) baseParams.set("min", min);
  if (max) baseParams.set("max", max);
  if (sort) baseParams.set("sort", sort);
  const pageUrl = (p: number) => {
    const params = new URLSearchParams(baseParams);
    params.set("page", String(p));
    return `/shop?${params.toString()}`;
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-ink">Tienda</h1>
        <p className="mt-1 text-ink-soft">{total} productos encontrados</p>

        <div className="mt-6">
          <FiltersBar
            categories={categories}
            brands={brands}
            current={{ q, category, brand, min, max, sort }}
          />
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-surface-border p-12 text-center text-ink-muted">
            No se encontraron productos con esos filtros.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-1">
            {page > 1 && (
              <Link
                href={pageUrl(page - 1)}
                className="rounded-lg border border-surface-border px-3 py-2 text-sm text-ink-soft hover:bg-brand-50"
              >
                ← Anterior
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={pageUrl(p)}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium ${
                  p === page
                    ? "bg-brand-500 text-white"
                    : "border border-surface-border text-ink-soft hover:bg-brand-50"
                }`}
              >
                {p}
              </Link>
            ))}
            {page < totalPages && (
              <Link
                href={pageUrl(page + 1)}
                className="rounded-lg border border-surface-border px-3 py-2 text-sm text-ink-soft hover:bg-brand-50"
              >
                Siguiente →
              </Link>
            )}
          </nav>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
