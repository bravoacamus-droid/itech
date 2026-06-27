"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const STATUS_LABEL: Record<string, string> = {
  recibido: "Recibido",
  diagnostico: "En diagnóstico",
  esperando_repuesto: "Esperando repuesto",
  en_reparacion: "En reparación",
  listo: "Listo para retirar",
  entregado: "Entregado",
  anulado: "Anulado",
};

type Result = {
  found: boolean;
  ticket?: {
    number: string;
    status: string;
    device: string;
    estimated_cost: number | null;
    created_at: string;
    delivered_at: string | null;
    warranty_until: string | null;
    warranty_days_left: number | null;
  };
  timeline?: { status: string; note: string | null; at: string }[];
};

const field =
  "w-full rounded-xl border border-surface-border px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";

export function RepairTracker() {
  const [number, setNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const [searched, setSearched] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSearched(false);
    try {
      const supabase = createClient();
      const { data } = await supabase.rpc("track_repair" as never, {
        p_number: number,
        p_phone: phone,
      } as never);
      setRes((data as unknown as Result) ?? { found: false });
    } catch {
      setRes({ found: false });
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-surface-border/70 bg-white p-6 shadow-card">
        <h1 className="text-2xl font-bold text-ink">Seguimiento de reparación</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Ingresa tu número de ticket y tu teléfono para ver el estado.
        </p>
        <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="N° de ticket (REP-...)"
            required
            className={field}
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Tu teléfono"
            required
            className={field}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {loading ? "Buscando…" : "Consultar"}
          </button>
        </form>
      </div>

      {searched && res && !res.found && (
        <p className="mt-6 rounded-2xl border border-dashed border-surface-border p-6 text-center text-ink-muted">
          No encontramos un ticket con esos datos. Verifica el número y el teléfono.
        </p>
      )}

      {res?.found && res.ticket && (
        <div className="mt-6 rounded-2xl border border-surface-border/70 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-muted">{res.ticket.number}</p>
              <p className="text-lg font-bold text-ink">{res.ticket.device || "Equipo"}</p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-600">
              {STATUS_LABEL[res.ticket.status] ?? res.ticket.status}
            </span>
          </div>

          {res.ticket.warranty_days_left != null && (
            <div className="mt-4 rounded-xl bg-surface-subtle p-3 text-sm">
              {res.ticket.warranty_days_left > 0 ? (
                <span className="font-semibold text-success">
                  Garantía vigente: {res.ticket.warranty_days_left} días restantes
                </span>
              ) : (
                <span className="font-semibold text-danger">Garantía vencida</span>
              )}
              {res.ticket.warranty_until && (
                <span className="text-ink-muted">
                  {" "}
                  (hasta {new Date(res.ticket.warranty_until).toLocaleDateString("es-PE")})
                </span>
              )}
            </div>
          )}

          <ol className="mt-6 space-y-4">
            {(res.timeline ?? []).map((u, i) => (
              <li key={i} className="relative border-l-2 border-brand-100 pl-4">
                <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-brand-500" />
                <div className="text-sm font-medium text-ink">
                  {STATUS_LABEL[u.status] ?? u.status}
                </div>
                {u.note && <div className="text-xs text-ink-soft">{u.note}</div>}
                <div className="text-[11px] text-ink-muted">
                  {new Date(u.at).toLocaleString("es-PE")}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
