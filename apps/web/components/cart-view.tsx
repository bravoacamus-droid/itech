"use client";

import Link from "next/link";
import { useCart } from "./cart/cart-context";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const { items, setQty, remove, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-border bg-white p-16 text-center">
        <p className="text-5xl">🛒</p>
        <p className="mt-4 text-lg font-semibold text-ink">Tu carrito está vacío</p>
        <p className="mt-1 text-sm text-ink-soft">Descubre nuestra tecnología y repuestos.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-3">
        {items.map((it) => (
          <div
            key={it.product_id}
            className="flex items-center gap-4 rounded-2xl border border-surface-border/70 bg-white p-4"
          >
            <Link
              href={`/producto/${it.slug}`}
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-surface-border/60 bg-white p-2"
            >
              {it.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.image_url} alt={it.name} className="max-h-full w-auto object-contain" />
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/producto/${it.slug}`} className="line-clamp-2 text-sm font-medium text-ink hover:text-brand-600">
                {it.name}
              </Link>
              <div className="mt-0.5 text-sm text-ink-muted">{formatPrice(it.price)} c/u</div>
              <button onClick={() => remove(it.product_id)} className="mt-1 text-xs font-medium text-danger hover:underline">
                Quitar
              </button>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-surface-border p-1">
              <button
                onClick={() => setQty(it.product_id, it.quantity - 1)}
                className="h-8 w-8 rounded-lg text-ink-soft transition hover:bg-brand-50"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold">{it.quantity}</span>
              <button
                onClick={() => setQty(it.product_id, it.quantity + 1)}
                className="h-8 w-8 rounded-lg text-ink-soft transition hover:bg-brand-50"
              >
                +
              </button>
            </div>
            <div className="w-24 text-right text-sm font-bold text-ink">{formatPrice(it.price * it.quantity)}</div>
          </div>
        ))}
        <Link href="/shop" className="inline-flex items-center gap-1 px-1 text-sm font-medium text-brand-600 hover:text-brand-700">
          ← Seguir comprando
        </Link>
      </div>

      <aside className="h-fit rounded-2xl border border-surface-border/70 bg-white p-6 lg:sticky lg:top-44">
        <h2 className="text-lg font-bold text-ink">Resumen del pedido</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-soft">Subtotal</span>
            <span className="font-semibold text-ink">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Envío</span>
            <span className="text-ink-muted">Se coordina</span>
          </div>
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
        <div className="mt-4 space-y-1.5 text-xs text-ink-muted">
          <p>🛡️ Compra protegida con garantía real</p>
          <p>💳 Múltiples métodos de pago</p>
          <p>🚚 Envíos a todo el Perú</p>
        </div>
      </aside>
    </div>
  );
}
