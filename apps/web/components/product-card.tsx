import Link from "next/link";
import type { Product } from "@itech/db";
import { formatPrice } from "@/lib/format";
import { AddToCart } from "./add-to-cart";

export function ProductCard({ product }: { product: Product }) {
  const hasDiscount =
    product.compare_at_price != null && product.compare_at_price > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : 0;
  const outOfStock = product.stock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-surface-border/70 bg-white transition duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft">
      {/* Badges (siempre por encima de la imagen) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-2.5">
        <div className="flex flex-col gap-1">
          {product.is_featured && (
            <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              Destacado
            </span>
          )}
          {outOfStock && (
            <span className="rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              Agotado
            </span>
          )}
        </div>
        {hasDiscount && (
          <span className="rounded-full bg-danger px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            -{discountPct}%
          </span>
        )}
      </div>

      <Link href={`/producto/${product.slug}`} className="flex flex-1 flex-col">
        {/* Imagen: fondo blanco (las fotos vienen sobre blanco) + recorte contenido */}
        <div className="relative flex h-48 items-center justify-center overflow-hidden bg-white p-5">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="max-h-full w-auto object-contain transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="text-xs text-ink-muted">Sin imagen</div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 border-t border-surface-border/60 px-4 pt-3">
          {product.brand && (
            <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-500">
              {product.brand}
            </span>
          )}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-ink">
            {product.name}
          </h3>
          <div className="mt-auto flex items-baseline gap-2 pt-1">
            <span className="text-lg font-extrabold text-ink">
              {formatPrice(product.price, product.currency)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-ink-muted line-through">
                {formatPrice(product.compare_at_price!, product.currency)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="p-4 pt-3">
        <AddToCart
          compact
          disabled={outOfStock}
          product={{
            product_id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
          }}
        />
      </div>
    </div>
  );
}
