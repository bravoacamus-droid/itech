"use client";

import Link from "next/link";
import { useCart } from "./cart/cart-context";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const { items, setQty, remove, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-border p-12 text-center">
        <p className="text-ink-soft">Tu carrito está vacío.</p>
        <Link
          href="/shop"
          className="mt-4 inline-flex rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="divide-y divide-surface-border/70 rounded-2xl border border-surface-border/70 bg-white">
        {items.map((it) => (
          <div key={it.product_id} className="flex items-center gap-4 p-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-surface-subtle">
              {it.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.image_url}
                  alt={it.name}
                  className="max-h-16 w-auto object-contain"
                />
              )}
            </div>
            <div className="flex-1">
              <Link
                href={`/producto/${it.slug}`}
                className="text-sm font-medium text-ink hover:text-brand-600"
              >
                {it.name}
              </Link>
              <div className="text-sm text-ink-muted">
                {formatPrice(it.price)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty(it.product_id, it.quantity - 1)}
                className="h-8 w-8 rounded-lg border border-surface-border text-ink-soft hover:bg-brand-50"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium">
                {it.quantity}
              </span>
              <button
                onClick={() => setQty(it.product_id, it.quantity + 1)}
                className="h-8 w-8 rounded-lg border border-surface-border text-ink-soft hover:bg-brand-50"
              >
                +
              </button>
            </div>
            <div className="w-24 text-right text-sm font-semibold text-ink">
              {formatPrice(it.price * it.quantity)}
            </div>
            <button
              onClick={() => remove(it.product_id)}
              className="text-xs font-medium text-danger hover:underline"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>

      <aside className="h-fit rounded-2xl border border-surface-border/70 bg-white p-6">
        <h2 className="text-lg font-bold text-ink">Resumen</h2>
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-ink-soft">Subtotal</span>
          <span className="font-semibold text-ink">{formatPrice(subtotal)}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-ink-soft">Envío</span>
          <span className="text-ink-muted">Se coordina</span>
        </div>
        <div className="mt-4 flex justify-between border-t border-surface-border/70 pt-4 text-base font-bold text-ink">
          <span>Total</span>
          <span className="text-brand-600">{formatPrice(subtotal)}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-6 block rounded-xl bg-brand-500 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          Continuar compra
        </Link>
      </aside>
    </div>
  );
}
