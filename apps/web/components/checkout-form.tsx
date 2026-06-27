"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "./cart/cart-context";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/config";

const field =
  "w-full rounded-xl border border-surface-border px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";
const label = "block text-sm font-medium text-ink mb-1";

export function CheckoutForm({
  defaultName = "",
  defaultEmail = "",
}: {
  defaultName?: string;
  defaultEmail?: string;
}) {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc(
        "create_order" as never,
        {
          p_customer: {
            name: String(fd.get("name") ?? ""),
            phone: String(fd.get("phone") ?? ""),
            email: String(fd.get("email") ?? ""),
            address: String(fd.get("address") ?? ""),
            payment_method: String(fd.get("payment_method") ?? "whatsapp"),
          },
          p_items: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
        } as never,
      );
      if (rpcError) throw rpcError;

      const row = (Array.isArray(data) ? data[0] : data) as {
        order_number?: string;
      } | null;
      const orderNumber = row?.order_number ?? "";
      clear();
      router.push(
        `/pedido/exito?n=${encodeURIComponent(orderNumber)}&t=${subtotal.toFixed(2)}`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear el pedido. Intenta de nuevo.",
      );
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-border p-12 text-center">
        <p className="text-ink-soft">No hay productos para comprar.</p>
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
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[1fr_360px]"
    >
      <div className="space-y-6">
        <div className="grid gap-5 rounded-2xl border border-surface-border/70 bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">1</span>
            <h2 className="text-lg font-bold text-ink">Datos de contacto</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label}>Nombre completo *</label>
              <input name="name" required defaultValue={defaultName} className={field} />
            </div>
            <div>
              <label className={label}>Teléfono / WhatsApp *</label>
              <input name="phone" required className={field} placeholder="9XX XXX XXX" />
            </div>
            <div>
              <label className={label}>Correo (opcional)</label>
              <input name="email" type="email" defaultValue={defaultEmail} className={field} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Dirección de entrega (opcional)</label>
              <input name="address" className={field} placeholder="Calle, número, distrito, ciudad" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-surface-border/70 bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">2</span>
            <h2 className="text-lg font-bold text-ink">Método de pago</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {PAYMENT_METHODS.map((m, i) => (
              <label
                key={m.value}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-surface-border p-3 text-sm transition hover:border-brand-300 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
              >
                <input type="radio" name="payment_method" value={m.value} defaultChecked={i === 0} className="accent-brand-500" />
                <span className="font-medium text-ink">{m.label}</span>
              </label>
            ))}
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-surface-border/70 bg-white p-6 lg:sticky lg:top-44">
        <h2 className="text-lg font-bold text-ink">Tu pedido</h2>
        <ul className="mt-4 space-y-3">
          {items.map((i) => (
            <li key={i.product_id} className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-surface-border/60 bg-white p-1">
                {i.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image_url} alt={i.name} className="max-h-full w-auto object-contain" />
                )}
              </span>
              <span className="min-w-0 flex-1 text-sm text-ink-soft">
                <span className="line-clamp-1 font-medium text-ink">{i.name}</span>
                <span className="text-xs text-ink-muted">{i.quantity} × {formatPrice(i.price)}</span>
              </span>
              <span className="text-sm font-semibold text-ink">{formatPrice(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-surface-border/70 pt-4 text-base font-bold text-ink">
          <span>Total</span>
          <span className="text-brand-600">{formatPrice(subtotal)}</span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 block w-full rounded-xl bg-brand-500 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
        >
          {loading ? "Procesando…" : "Confirmar pedido"}
        </button>
        <p className="mt-3 text-center text-xs text-ink-muted">
          🔒 Coordinaremos el pago y la entrega contigo.
        </p>
      </aside>
    </form>
  );
}
