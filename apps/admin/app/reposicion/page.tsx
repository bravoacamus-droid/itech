import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getReplenishment } from "@/lib/replenishment";
import { listBranches } from "@/lib/branches";
import { AdminHeader } from "@/components/admin-header";

export const dynamic = "force-dynamic";

const WINDOW = 30;
const TARGET = 30;

export default async function ReplenishmentPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string }>;
}) {
  const { user } = await requireAdmin();
  const sp = await searchParams;
  const branchId = sp.branch ?? null;
  const branches = await listBranches();
  const items = await getReplenishment(branchId, WINDOW, TARGET);
  const toRestock = items.filter((i) => i.suggested_qty > 0);
  const totalUnits = toRestock.reduce((s, i) => s + i.suggested_qty, 0);

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-ink">Proyección de reposición</h1>
        <p className="text-sm text-ink-soft">
          Sugerencia de compra según ventas de los últimos {WINDOW} días, para
          mantener {TARGET} días de stock{branchId ? " en la sede" : " (total)"}.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/reposicion"
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${!branchId ? "bg-brand-500 text-white" : "bg-surface-subtle text-ink-soft hover:bg-brand-50"}`}
          >
            Total
          </Link>
          {branches.map((b) => (
            <Link
              key={b.id}
              href={`/reposicion?branch=${b.id}`}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${branchId === b.id ? "bg-brand-500 text-white" : "bg-surface-subtle text-ink-soft hover:bg-brand-50"}`}
            >
              {b.name}
            </Link>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-surface-border/70 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              Productos a reponer
            </p>
            <p className="mt-1 text-2xl font-extrabold text-brand-600">
              {toRestock.length}
            </p>
          </div>
          <div className="rounded-2xl border border-surface-border/70 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              Unidades sugeridas
            </p>
            <p className="mt-1 text-2xl font-extrabold text-brand-600">
              {totalUnits}
            </p>
          </div>
          <div className="rounded-2xl border border-surface-border/70 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              Productos analizados
            </p>
            <p className="mt-1 text-2xl font-extrabold text-ink">{items.length}</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Vendidos ({WINDOW}d)</th>
                <th className="px-4 py-3 font-semibold">Prom./día</th>
                <th className="px-4 py-3 font-semibold">Cobertura</th>
                <th className="px-4 py-3 text-right font-semibold">Sugerido</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const urgent = it.suggested_qty > 0;
                return (
                  <tr
                    key={it.product_id}
                    className="border-b border-surface-border/50 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/inventario/${it.product_id}`}
                        className="font-medium text-ink hover:text-brand-600"
                      >
                        {it.name}
                      </Link>
                      {it.brand && (
                        <div className="text-xs text-ink-muted">{it.brand}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{it.stock}</td>
                    <td className="px-4 py-3 text-ink-soft">{it.sold}</td>
                    <td className="px-4 py-3 text-ink-soft">{it.daily_avg}</td>
                    <td className="px-4 py-3">
                      {it.days_cover == null ? (
                        <span className="text-ink-muted">sin ventas</span>
                      ) : (
                        <span
                          className={
                            it.days_cover < 15 ? "font-medium text-danger" : "text-ink-soft"
                          }
                        >
                          {it.days_cover} días
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {urgent ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 font-bold text-brand-600">
                          +{it.suggested_qty} u
                        </span>
                      ) : (
                        <span className="text-success">OK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-ink-muted">
                    No hay productos para analizar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-ink-muted">
          La sugerencia usa el promedio de ventas del período. Para registrar la
          compra, entra al producto y usa “Registrar movimiento → Entrada”.
        </p>
      </main>
    </div>
  );
}
