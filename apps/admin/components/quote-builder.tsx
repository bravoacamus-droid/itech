"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@itech/ui";
import { createClient } from "@/lib/supabase/client";
import { money } from "@/lib/format";

type Line = { description: string; quantity: number; unit_price: number };

const field =
  "w-full rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";
const label = "block text-sm font-medium text-ink mb-1";

export function QuoteBuilder({
  catalog,
}: {
  catalog: { name: string; price: number }[];
}) {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([{ description: "", quantity: 1, unit_price: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0), 0);

  function update(i: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function onPickName(i: number, name: string) {
    const found = catalog.find((c) => c.name === name);
    update(i, { description: name, ...(found ? { unit_price: Number(found.price) } : {}) });
  }
  function addLine() {
    setLines((prev) => [...prev, { description: "", quantity: 1, unit_price: 0 }]);
  }
  function removeLine(i: number) {
    setLines((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const valid = lines.filter((l) => l.description.trim() && Number(l.quantity) > 0);
    if (valid.length === 0) {
      setError("Agrega al menos un ítem válido");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      const supabase = createClient();
      const { data, error } = await supabase.rpc("create_quote" as never, {
        p_customer: {
          name: String(fd.get("customer_name") ?? ""),
          doc: String(fd.get("customer_doc") ?? ""),
          email: String(fd.get("customer_email") ?? ""),
          phone: String(fd.get("customer_phone") ?? ""),
        },
        p_items: valid.map((l) => ({
          description: l.description,
          quantity: Number(l.quantity),
          unit_price: Number(l.unit_price),
        })),
        p_notes: String(fd.get("notes") ?? ""),
        p_valid_days: Number(fd.get("valid_days") ?? 15),
      } as never);
      if (error) throw error;
      const row = (Array.isArray(data) ? data[0] : data) as { quote_id?: string } | null;
      router.push(row?.quote_id ? `/cotizaciones/${row.quote_id}` : "/cotizaciones");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cotización");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      <datalist id="catalog">
        {catalog.map((c) => (
          <option key={c.name} value={c.name} />
        ))}
      </datalist>

      <div className="grid gap-4 rounded-2xl border border-surface-border/70 bg-white p-6 sm:grid-cols-2">
        <h2 className="sm:col-span-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">Cliente</h2>
        <div><label className={label}>Nombre / Razón social *</label><input name="customer_name" required className={field} /></div>
        <div><label className={label}>RUC / DNI</label><input name="customer_doc" className={field} /></div>
        <div><label className={label}>Correo</label><input name="customer_email" type="email" className={field} /></div>
        <div><label className={label}>Teléfono</label><input name="customer_phone" className={field} /></div>
      </div>

      <div className="rounded-2xl border border-surface-border/70 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">Ítems</h2>
        <div className="space-y-3">
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_70px_110px_90px_32px] items-center gap-2">
              <input
                list="catalog"
                value={l.description}
                onChange={(e) => onPickName(i, e.target.value)}
                placeholder="Descripción / producto"
                className={field}
              />
              <input
                type="number" min={0} step="0.01" value={l.quantity}
                onChange={(e) => update(i, { quantity: Number(e.target.value) })}
                className={field}
              />
              <input
                type="number" min={0} step="0.01" value={l.unit_price}
                onChange={(e) => update(i, { unit_price: Number(e.target.value) })}
                className={field}
              />
              <div className="text-right text-sm font-medium text-ink">
                {money((Number(l.quantity) || 0) * (Number(l.unit_price) || 0))}
              </div>
              <button type="button" onClick={() => removeLine(i)} className="text-danger hover:opacity-70" aria-label="Quitar">×</button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button type="button" onClick={addLine} className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-100">
            + Agregar ítem
          </button>
          <div className="text-lg font-bold text-ink">Total: <span className="text-brand-600">{money(total)}</span></div>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-surface-border/70 bg-white p-6 sm:grid-cols-2">
        <div className="sm:col-span-2"><label className={label}>Notas / condiciones</label><textarea name="notes" rows={2} className={field} placeholder="Ej. Precios incluyen IGV. Entrega en 3 días." /></div>
        <div><label className={label}>Validez (días)</label><input name="valid_days" type="number" defaultValue={15} className={field} /></div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      <div><Button type="submit" disabled={loading}>{loading ? "Creando…" : "Crear cotización"}</Button></div>
    </form>
  );
}
