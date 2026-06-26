"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@itech/ui";
import { createClient } from "@/lib/supabase/client";
import type { PosProduct } from "@/lib/pos";
import { money } from "@/lib/format";

type Line = { product: PosProduct; qty: number };

const PAYMENTS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "yape", label: "Yape" },
  { value: "plin", label: "Plin" },
  { value: "tarjeta", label: "Tarjeta" },
];

export function PosTerminal({ products }: { products: PosProduct[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [payment, setPayment] = useState("efectivo");
  const [customer, setCustomer] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 24);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand ?? "").toLowerCase().includes(q) ||
          (p.sku ?? "").toLowerCase().includes(q),
      )
      .slice(0, 24);
  }, [query, products]);

  const total = lines.reduce((s, l) => s + l.product.price * l.qty, 0);

  function add(p: PosProduct) {
    setMsg(null);
    setLines((prev) => {
      const ex = prev.find((l) => l.product.id === p.id);
      if (ex) {
        if (ex.qty >= p.stock) return prev;
        return prev.map((l) =>
          l.product.id === p.id ? { ...l, qty: l.qty + 1 } : l,
        );
      }
      if (p.stock <= 0) return prev;
      return [...prev, { product: p, qty: 1 }];
    });
  }
  function setQty(id: string, qty: number) {
    setLines((prev) =>
      prev
        .map((l) =>
          l.product.id === id
            ? { ...l, qty: Math.max(0, Math.min(qty, l.product.stock)) }
            : l,
        )
        .filter((l) => l.qty > 0),
    );
  }

  async function cobrar() {
    if (lines.length === 0) return;
    setLoading(true);
    setMsg(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("pos_checkout" as never, {
        p_items: lines.map((l) => ({ product_id: l.product.id, quantity: l.qty })),
        p_payment: payment,
        p_customer: customer,
      } as never);
      if (error) throw error;
      const row = (Array.isArray(data) ? data[0] : data) as {
        order_number?: string;
      } | null;
      setMsg({ type: "ok", text: `Venta registrada: ${row?.order_number ?? ""}` });
      setLines([]);
      setCustomer("");
      router.refresh();
    } catch (e) {
      setMsg({
        type: "err",
        text: e instanceof Error ? e.message : "No se pudo cobrar",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Productos */}
      <div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar producto por nombre, marca o SKU…"
          className="mb-4 w-full rounded-xl border border-surface-border px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => add(p)}
              disabled={p.stock <= 0}
              className="flex flex-col rounded-2xl border border-surface-border/70 bg-white p-3 text-left transition hover:border-brand-300 hover:shadow-soft disabled:opacity-50"
            >
              <div className="mb-2 flex h-20 items-center justify-center rounded-lg bg-surface-subtle">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.name} className="max-h-20 w-auto object-contain" />
                ) : (
                  <span className="text-xs text-ink-muted">Sin imagen</span>
                )}
              </div>
              <span className="line-clamp-2 text-xs font-medium text-ink">{p.name}</span>
              <span className="mt-1 text-sm font-bold text-brand-600">{money(p.price)}</span>
              <span className={`text-[11px] ${p.stock <= 0 ? "text-danger" : "text-ink-muted"}`}>
                Stock: {p.stock}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Carrito */}
      <aside className="h-fit rounded-2xl border border-surface-border/70 bg-white p-5">
        <h2 className="text-lg font-bold text-ink">Venta actual</h2>
        {lines.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">
            Toca un producto para agregarlo.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {lines.map((l) => (
              <div key={l.product.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink">{l.product.name}</div>
                  <div className="text-xs text-ink-muted">{money(l.product.price)}</div>
                </div>
                <input
                  type="number"
                  min={1}
                  max={l.product.stock}
                  value={l.qty}
                  onChange={(e) => setQty(l.product.id, parseInt(e.target.value || "0", 10))}
                  className="w-14 rounded-lg border border-surface-border px-2 py-1 text-center text-sm"
                />
                <div className="w-20 text-right text-sm font-semibold text-ink">
                  {money(l.product.price * l.qty)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-surface-border/70 pt-4 text-lg font-bold text-ink">
          <span>Total</span>
          <span className="text-brand-600">{money(total)}</span>
        </div>

        <div className="mt-4 space-y-3">
          <input
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="Cliente (opcional)"
            className="w-full rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          />
          <div className="grid grid-cols-4 gap-1">
            {PAYMENTS.map((m) => (
              <button
                key={m.value}
                onClick={() => setPayment(m.value)}
                className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                  payment === m.value
                    ? "bg-brand-500 text-white"
                    : "bg-surface-subtle text-ink-soft hover:bg-brand-50"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <Button
            onClick={cobrar}
            disabled={loading || lines.length === 0}
            className="w-full"
          >
            {loading ? "Cobrando…" : `Cobrar ${money(total)}`}
          </Button>
        </div>

        {msg && (
          <p
            className={`mt-3 text-center text-sm ${
              msg.type === "ok" ? "text-success" : "text-danger"
            }`}
          >
            {msg.text}
          </p>
        )}
      </aside>
    </div>
  );
}
