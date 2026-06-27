import { requireStaff } from "@/lib/auth";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@itech/ui";
import { PosTerminal } from "@/components/pos-terminal";
import {
  getOpenSession,
  getSessionSummary,
  getPosProducts,
  getMyOpenTimeEntry,
  money,
} from "@/lib/pos";
import { getBranchScope } from "@/lib/branches";
import { openCash, closeCash, clockIn, clockOut } from "@/app/pos/actions";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const { user } = await requireStaff();
  const session = await getOpenSession();

  if (!session) {
    const branches = (await getBranchScope()).branches.filter((b) => b.is_active);
    return (
      <div className="min-h-screen">
        <AdminHeader email={user.email} />
        <main className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-surface-border/70 bg-white p-8 text-center shadow-card">
            <h1 className="text-2xl font-bold text-ink">Abrir caja</h1>
            {branches.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">
                No tienes una sucursal asignada. Pide a un administrador que te
                asigne una en <span className="font-medium">Accesos</span>.
              </p>
            ) : (
            <>
            <p className="mt-2 text-sm text-ink-soft">
              Elige la sucursal e ingresa el monto inicial en efectivo.
            </p>
            <form action={openCash} className="mt-6 space-y-4 text-left">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Sucursal</label>
                <select
                  name="branch_id"
                  defaultValue={branches.find((b) => b.is_default)?.id ?? branches[0]?.id ?? ""}
                  className="w-full rounded-xl border border-surface-border px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Monto inicial (S/)</label>
                <input
                  name="opening"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue="0"
                  className="w-full rounded-xl border border-surface-border px-3 py-2.5 text-center text-lg font-semibold outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                />
              </div>
              <Button type="submit" className="w-full">Abrir caja</Button>
            </form>
            </>
            )}
          </div>
        </main>
      </div>
    );
  }

  const summary = await getSessionSummary(session.id);
  const products = await getPosProducts();
  const expectedCash = Number(session.opening_amount) + summary.cash;
  const openEntry = await getMyOpenTimeEntry();

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
            <div>
              <span className="block text-xs uppercase text-ink-muted">Mi turno</span>
              {openEntry ? (
                <form action={clockOut}>
                  <span className="mr-2 text-xs text-success">
                    Entrada {new Date(openEntry.clock_in).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <button className="rounded-lg bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger hover:bg-danger/20">
                    Marcar salida
                  </button>
                </form>
              ) : (
                <form action={clockIn.bind(null, session.branch_id ?? null)}>
                  <button className="rounded-lg bg-success/10 px-2.5 py-1 text-xs font-semibold text-success hover:bg-success/20">
                    Marcar entrada
                  </button>
                </form>
              )}
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
