import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/catalog";

export const revalidate = 60;

export default async function ShopPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-ink">Tienda</h1>
        <p className="mt-1 text-ink-soft">
          {products.length} productos disponibles
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Categorías
            </h2>
            <nav className="space-y-1">
              <Link
                href="/shop"
                className="block rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-600"
              >
                Todos los productos
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/categoria/${c.slug}`}
                  className="block rounded-lg px-3 py-2 text-sm text-ink-soft transition hover:bg-brand-50 hover:text-brand-600"
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
