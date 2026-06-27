import { requireStaff } from "@/lib/auth";
import { AdminHeader } from "@/components/admin-header";

export const dynamic = "force-dynamic";

const REPORTS = [
  { tipo: "ventas", label: "Ventas", desc: "Pedidos por fecha, canal, sucursal y total", dated: true },
  { tipo: "inventario", label: "Inventario", desc: "Stock por producto y sucursal", dated: false },
  { tipo: "asistencia", label: "Asistencia", desc: "Marcajes de entrada/salida y horas", dated: true },
  { tipo: "transferencias", label: "Transferencias", desc: "Movimientos de stock entre sedes", dated: true },
];

export default async function ReportsPage() {
  const { user } = await requireStaff();
  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  const from = new Date(today.getTime() - 29 * 86400000).toISOString().slice(0, 10);
  const field =
    "rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-ink">Reportes</h1>
        <p className="text-sm text-ink-soft">
          Descarga reportes en CSV (se abren directamente en Excel). Los datos se
          acotan a tus sucursales según tu rol.
        </p>

        <div className="mt-6 space-y-3">
          {REPORTS.map((r) => (
            <form
              key={r.tipo}
              method="GET"
              action={`/api/reportes/${r.tipo}`}
              className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-surface-border/70 bg-white p-4"
            >
              <div>
                <h2 className="text-base font-semibold text-ink">{r.label}</h2>
                <p className="text-sm text-ink-muted">{r.desc}</p>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                {r.dated && (
                  <>
                    <label className="text-xs text-ink-soft">
                      Desde
                      <input type="date" name="from" defaultValue={from} className={`${field} mt-1 block`} />
                    </label>
                    <label className="text-xs text-ink-soft">
                      Hasta
                      <input type="date" name="to" defaultValue={to} className={`${field} mt-1 block`} />
                    </label>
                  </>
                )}
                <button
                  type="submit"
                  name="format"
                  value="xlsx"
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Excel
                </button>
                <button
                  type="submit"
                  name="format"
                  value="csv"
                  className="rounded-xl border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
                >
                  CSV
                </button>
              </div>
            </form>
          ))}
        </div>
      </main>
    </div>
  );
}
