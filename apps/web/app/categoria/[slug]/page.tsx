import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, categories] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
  ]);

  if (!category) notFound();

  const { items: products } = await getProducts({
    categorySlug: slug,
    pageSize: 48,
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/shop" className="hover:text-brand-600">
            Tienda
          </Link>{" "}
          / <span className="text-ink">{category.name}</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold text-ink">{category.name}</h1>
        <p className="mt-1 text-ink-soft">{products.length} productos</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Categorías
            </h2>
            <nav className="space-y-1">
              <Link
                href="/shop"
                className="block rounded-lg px-3 py-2 text-sm text-ink-soft transition hover:bg-brand-50 hover:text-brand-600"
              >
                Todos los productos
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/categoria/${c.slug}`}
                  className={`block rounded-lg px-3 py-2 text-sm transition ${
                    c.slug === slug
                      ? "bg-brand-50 font-medium text-brand-600"
                      : "text-ink-soft hover:bg-brand-50 hover:text-brand-600"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </aside>

          <div>
            {products.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-surface-border p-10 text-center text-ink-muted">
                Aún no hay productos en esta categoría.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
