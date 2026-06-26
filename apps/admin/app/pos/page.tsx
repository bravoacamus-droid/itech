import { requireAdmin } from "@/lib/auth";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@itech/ui";
import { PosTerminal } from "@/components/pos-terminal";
import {
  getOpenSession,
  getSessionSummary,
  getPosProducts,
  money,
} from "@/lib/pos";
import { openCash, closeCash } from "@/app/pos/actions";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const { user } = await requireAdmin();
  const session = await getOpenSession();

  if (!session) {
    return (
      <div className="min-h-screen">
        <AdminHeader email={user.email} />
        <main className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-surface-border/70 bg-white p-8 text-center shadow-card">
            <h1 className="text-2xl font-bold text-ink">Abrir caja</h1>
            <p className="mt-2 text-sm text-ink-soft">
              Ingresa el monto inicial en efectivo para comenzar a vender.
            </p>
            <form action={openCash} className="mt-6 space-y-4">
              <input
                name="opening"
                type="number"
                step="0.01"
                min={0}
                defaultValue="0"
                className="w-full rounded-xl border border-surface-border px-3 py-2.5 text-center text-lg font-semibold outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
              />
              <Button type="submit" className="w-full">
                Abrir caja
              </Button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  const summary = await getSessionSummary(session.id);
  const products = await getPosProducts();
  const expectedCash = Number(session.opening_amount) + summary.cash;

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-surface-border/70 bg-white p-5">
          <div>
            <h1 className="text-xl font-bold text-ink">Punto de venta</h1>
            <p className="text-sm text-ink-soft">
              Caja abierta desde{" "}
              {new Date(session.opened_at).toLocaleString("es-PE")} · Apertura{" "}
              {money(session.opening_amount)}
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm">
            <div>
              <span className="block text-xs uppercase text-ink-muted">Ventas</span>
              <span className="font-bold text-ink">
                {summary.count} · {money(summary.total)}
              </span>
            </div>
            <div>
              <span className="block text-xs uppercase text-ink-muted">Efectivo esperado</span>
              <span className="font-bold text-brand-600">{money(expectedCash)}</span>
            </div>
          </div>
        </div>

        <PosTerminal products={products} />

        {/* Arqueo / cierre */}
        <details className="mt-8 rounded-2xl border border-surface-border/70 bg-white p-5">
          <summary className="cursor-pointer text-sm font-semibold text-ink">
            Cerrar caja (arqueo)
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-surface-subtle p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft">Apertura</span>
                <span className="font-medium">{money(session.opening_amount)}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-ink-soft">Ventas en efectivo</span>
                <span className="font-medium">{money(summary.cash)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-surface-border/70 pt-2">
                <span className="font-semibold text-ink">Efectivo esperado</span>
                <span className="font-bold text-brand-600">{money(expectedCash)}</span>
              </div>
            </div>
            <form action={closeCash.bind(null, session.id)} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  Efectivo contado
                </label>
                <input
                  name="counted"
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  className="w-full rounded-xl border border-surface-border px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  Nota (obligatoria si hay descuadre)
                </label>
                <input
                  name="note"
                  className="w-full rounded-xl border border-surface-border px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                />
              </div>
              <Button type="submit" variant="outline" className="w-full">
                Cerrar caja
              </Button>
            </form>
          </div>
        </details>
      </main>
    </div>
  );
}
