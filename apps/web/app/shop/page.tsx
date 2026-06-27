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
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const SORTS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Más recientes" },
  { value: "price_asc", label: "Menor precio" },
  { value: "price_desc", label: "Mayor precio" },
  { value: "name", label: "Nombre A-Z" },
];

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
    getProducts({ categorySlug: category, q, brand, minPrice, maxPrice, sort, page, pageSize: PAGE_SIZE }),
  ]);

  const { items, total } = result;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = { q, category, brand, min, max, sort };
  const activeCat = categories.find((c) => c.slug === category);

  const build = (over: Partial<typeof current>) => {
    const merged = { ...current, ...over };
    const params = new URLSearchParams();
    (["q", "category", "brand", "min", "max", "sort"] as const).forEach((k) => {
      const v = merged[k as keyof typeof merged];
      if (v) params.set(k, String(v));
    });
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };
  const pageUrl = (p: number) => {
    const params = new URLSearchParams();
    (["q", "category", "brand", "min", "max", "sort"] as const).forEach((k) => {
      const v = current[k as keyof typeof current];
      if (v) params.set(k, String(v));
    });
    params.set("page", String(p));
    return `/shop?${params.toString()}`;
  };

  const chips: { label: string; href: string }[] = [];
  if (q) chips.push({ label: `“${q}”`, href: build({ q: undefined }) });
  if (activeCat) chips.push({ label: activeCat.name, href: build({ category: undefined }) });
  if (brand) chips.push({ label: brand, href: build({ brand: undefined }) });
  if (min || max) chips.push({ label: `S/ ${min || "0"} – ${max || "∞"}`, href: build({ min: undefined, max: undefined }) });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/" className="hover:text-brand-600">Inicio</Link> / <span className="text-ink">Tienda</span>
          {activeCat && <> / <span className="text-ink">{activeCat.name}</span></>}
        </nav>
        <h1 className="mt-2 text-3xl font-bold text-ink">{activeCat ? activeCat.name : "Tienda"}</h1>
        <p className="mt-1 text-ink-soft">{total} producto{total === 1 ? "" : "s"}</p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
          <FiltersBar categories={categories} brands={brands} current={current} />

          <div>
            {/* Barra: orden + chips */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-surface-border/70 bg-white p-3">
              <div className="flex flex-wrap items-center gap-2">
                {chips.length > 0 ? (
                  chips.map((c) => (
                    <Link
                      key={c.label}
                      href={c.href}
                      className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600 hover:bg-brand-100"
                    >
                      {c.label} <span className="text-brand-400">✕</span>
                    </Link>
                  ))
                ) : (
                  <span className="px-1 text-sm text-ink-muted">Todos los productos</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="hidden text-xs font-medium text-ink-muted sm:inline">Ordenar:</span>
                {SORTS.map((s) => (
                  <Link
                    key={s.value}
                    href={build({ sort: s.value })}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${sort === s.value ? "bg-brand-500 text-white" : "text-ink-soft hover:bg-brand-50"}`}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>

            {items.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-surface-border p-16 text-center">
                <p className="text-4xl">🔍</p>
                <p className="mt-3 text-ink-soft">No se encontraron productos con esos filtros.</p>
                <Link href="/shop" className="mt-4 inline-flex rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
                  Ver todo el catálogo
                </Link>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-1">
                {page > 1 && (
                  <Link href={pageUrl(page - 1)} className="rounded-lg border border-surface-border px-3 py-2 text-sm text-ink-soft hover:bg-brand-50">←</Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={pageUrl(p)}
                    className={`rounded-lg px-3.5 py-2 text-sm font-medium ${p === page ? "bg-brand-500 text-white" : "border border-surface-border text-ink-soft hover:bg-brand-50"}`}
                  >
                    {p}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link href={pageUrl(page + 1)} className="rounded-lg border border-surface-border px-3 py-2 text-sm text-ink-soft hover:bg-brand-50">→</Link>
                )}
              </nav>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
