import Link from "next/link";
import type { Product } from "@itech/db";
import { formatPrice } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  const hasDiscount =
    product.compare_at_price != null &&
    product.compare_at_price > product.price;

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-surface-border/70 bg-white transition hover:shadow-soft"
    >
      <div className="relative flex h-44 items-center justify-center bg-surface-subtle p-4">
        {product.is_featured && (
          <span className="absolute left-2 top-2 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            Destacado
          </span>
        )}
        {hasDiscount && (
          <span className="absolute right-2 top-2 rounded-full bg-danger px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            Oferta
          </span>
        )}
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="max-h-36 w-auto object-contain transition group-hover:scale-105"
          />
        ) : (
          <div className="text-xs text-ink-muted">Sin imagen</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.brand && (
          <span className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
            {product.brand}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-medium text-ink">
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-lg font-bold text-brand-600">
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
  );
}
