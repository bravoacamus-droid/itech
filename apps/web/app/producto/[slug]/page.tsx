import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { AddToCart } from "@/components/add-to-cart";
import { getProductBySlug, getRelatedProducts, formatPrice } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const TRUST = [
  { icon: "🚚", t: "Envío a todo el Perú" },
  { icon: "🛡️", t: "Garantía real" },
  { icon: "💳", t: "Pago seguro" },
  { icon: "🔧", t: "Soporte técnico" },
];

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const hasDiscount =
    product.compare_at_price != null && product.compare_at_price > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : 0;
  const inStock = product.stock > 0;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/" className="hover:text-brand-600">Inicio</Link> /{" "}
          <Link href="/shop" className="hover:text-brand-600">Tienda</Link>
          {product.category && (
            <>
              {" / "}
              <Link href={`/categoria/${product.category.slug}`} className="hover:text-brand-600">
                {product.category.name}
              </Link>
            </>
          )}
          {" / "}
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          {/* Imagen */}
          <div className="relative flex h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-surface-border/70 bg-white p-8">
            {hasDiscount && (
              <span className="absolute left-4 top-4 rounded-full bg-danger px-3 py-1 text-xs font-bold uppercase text-white">
                -{discountPct}%
              </span>
            )}
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image_url} alt={product.name} className="max-h-full w-auto object-contain" />
            ) : (
              <div className="text-ink-muted">Sin imagen</div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.brand && (
              <span className="text-sm font-semibold uppercase tracking-wide text-brand-500">{product.brand}</span>
            )}
            <h1 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">{product.name}</h1>
            {product.sku && <p className="mt-1 text-sm text-ink-muted">SKU: {product.sku}</p>}

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-extrabold text-ink">{formatPrice(product.price, product.currency)}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-ink-muted line-through">{formatPrice(product.compare_at_price!, product.currency)}</span>
                  <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-bold text-danger">Ahorra {discountPct}%</span>
                </>
              )}
            </div>

            <div className="mt-4">
              {inStock ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
                  ● En stock ({product.stock} disponibles)
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-danger/10 px-3 py-1 text-sm font-medium text-danger">
                  ● Sin stock
                </span>
              )}
            </div>

            {product.description && <p className="mt-6 leading-relaxed text-ink-soft">{product.description}</p>}

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
              <Link href="/carrito" className="rounded-xl border border-brand-200 px-6 py-3 text-sm font-semibold text-brand-600 transition hover:bg-brand-50">
                Ir al carrito
              </Link>
            </div>

            {/* Confianza */}
            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-surface-border/70 pt-6 sm:grid-cols-4">
              {TRUST.map((t) => (
                <div key={t.t} className="flex flex-col items-center gap-1 text-center">
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-xs text-ink-soft">{t.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Relacionados */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="text-2xl font-bold text-ink">Productos relacionados</h2>
              {product.category && (
                <Link href={`/categoria/${product.category.slug}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                  Ver más →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
