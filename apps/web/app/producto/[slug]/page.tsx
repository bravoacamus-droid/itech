import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AddToCart } from "@/components/add-to-cart";
import { getProductBySlug, formatPrice } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const hasDiscount =
    product.compare_at_price != null &&
    product.compare_at_price > product.price;
  const inStock = product.stock > 0;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/shop" className="hover:text-brand-600">
            Tienda
          </Link>
          {product.category && (
            <>
              {" / "}
              <Link
                href={`/categoria/${product.category.slug}`}
                className="hover:text-brand-600"
              >
                {product.category.name}
              </Link>
            </>
          )}
          {" / "}
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div className="flex items-center justify-center rounded-2xl border border-surface-border/70 bg-surface-subtle p-10">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="max-h-96 w-auto object-contain"
              />
            ) : (
              <div className="text-ink-muted">Sin imagen</div>
            )}
          </div>

          <div>
            {product.brand && (
              <span className="text-sm font-medium uppercase tracking-wide text-ink-muted">
                {product.brand}
              </span>
            )}
            <h1 className="mt-1 text-3xl font-bold text-ink">{product.name}</h1>
            {product.sku && (
              <p className="mt-1 text-sm text-ink-muted">SKU: {product.sku}</p>
            )}

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-brand-600">
                {formatPrice(product.price, product.currency)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-ink-muted line-through">
                  {formatPrice(product.compare_at_price!, product.currency)}
                </span>
              )}
            </div>

            <div className="mt-4">
              {inStock ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
                  En stock ({product.stock} disponibles)
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-danger/10 px-3 py-1 text-sm font-medium text-danger">
                  Sin stock
                </span>
              )}
            </div>

            {product.description && (
              <p className="mt-6 text-ink-soft">{product.description}</p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <AddToCart
                disabled={!inStock}
                product={{
                  product_id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  image_url: product.image_url,
                }}
              />
              <Link
                href="/carrito"
                className="rounded-xl border border-brand-200 px-6 py-3 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
              >
                Ir al carrito
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
