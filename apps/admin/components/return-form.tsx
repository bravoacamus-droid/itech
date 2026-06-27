"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@itech/ui";
import { createClient } from "@/lib/supabase/client";
import { money } from "@/lib/format";
import type { ReturnableItem } from "@/lib/returns";

export function ReturnForm({
  orderId,
  items,
}: {
  orderId: string;
  items: ReturnableItem[];
}) {
  const router = useRouter();
  const [qty, setQty] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refund = items.reduce(
    (s, it) => s + (qty[it.order_item_id] || 0) * it.unit_price,
    0,
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = items
      .map((it) => ({ order_item_id: it.order_item_id, quantity: qty[it.order_item_id] || 0 }))
      .filter((x) => x.quantity > 0);
    if (payload.length === 0) {
      setError("Indica al menos una cantidad a devolver");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("create_return" as never, {
        p_order: orderId,
        p_items: payload,
        p_reason: reason,
      } as never);
      if (error) throw error;
      router.push(`/pedidos/${orderId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar la devolución");
      setLoading(false);
    }
  }

  const anyAvailable = items.some((i) => i.available > 0);

  return (
    <form onSubmit={submit} className="grid gap-5">
      <div className="overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3 font-semibold">Producto</th>
              <th className="px-4 py-3 font-semibold">Comprado</th>
              <th className="px-4 py-3 font-semibold">Devuelto</th>
              <th className="px-4 py-3 font-semibold">Disponible</th>
              <th className="px-4 py-3 font-semibold">Devolver</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.order_item_id} className="border-b border-surface-border/50 last:border-0">
                <td className="px-4 py-3 text-ink">{it.name}</td>
                <td className="px-4 py-3 text-ink-soft">{it.purchased}</td>
                <td className="px-4 py-3 text-ink-soft">{it.returned}</td>
                <td className="px-4 py-3 text-ink-soft">{it.available}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    max={it.available}
                    disabled={it.available <= 0}
                    value={qty[it.order_item_id] ?? ""}
                    onChange={(e) =>
                      setQty((p) => ({
                        ...p,
                        [it.order_item_id]: Math.max(0, Math.min(it.available, parseInt(e.target.value || "0", 10))),
                      }))
                    }
                    className="w-20 rounded-lg border border-surface-border px-2 py-1 text-sm disabled:bg-surface-subtle"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!anyAvailable && (
        <p className="text-sm text-ink-muted">No quedan ítems disponibles para devolver.</p>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Motivo</label>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          placeholder="Ej. Producto defectuoso"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-ink">
          A reembolsar: <span className="text-brand-600">{money(refund)}</span>
        </span>
        <Button type="submit" disabled={loading || !anyAvailable}>
          {loading ? "Registrando…" : "Registrar devolución"}
        </Button>
      </div>
    </form>
  );
}
