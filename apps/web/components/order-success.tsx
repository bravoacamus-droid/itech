"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "./cart/cart-context";
import { WHATSAPP_NUMBER } from "@/lib/config";

export function OrderSuccess({ whatsappNumber }: { whatsappNumber?: string }) {
  const params = useSearchParams();
  const { clear } = useCart();
  const orderNumber = params.get("n") ?? "";
  const total = params.get("t") ?? "";

  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const msg = encodeURIComponent(
    `Hola, acabo de hacer el pedido ${orderNumber} en la web. Quiero coordinar el pago y la entrega.`,
  );
  const waLink = `https://wa.me/${whatsappNumber || WHATSAPP_NUMBER}?text=${msg}`;

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-surface-border/70 bg-white p-8 text-center shadow-card">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-2xl text-success">
        ✓
      </div>
      <h1 className="text-2xl font-bold text-ink">¡Pedido recibido!</h1>
      <p className="mt-2 text-ink-soft">
        Tu número de pedido es{" "}
        <span className="font-bold text-brand-600">{orderNumber}</span>.
      </p>
      {total && (
        <p className="mt-1 text-sm text-ink-muted">Total: S/ {total}</p>
      )}
      <p className="mt-4 text-sm text-ink-soft">
        Para coordinar el pago y la entrega, escríbenos por WhatsApp con tu
        número de pedido.
      </p>
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex rounded-xl bg-success px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Coordinar por WhatsApp
      </a>
      <div className="mt-4">
        <Link href="/shop" className="text-sm font-semibold text-brand-600 hover:underline">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
