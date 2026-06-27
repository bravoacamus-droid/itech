import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getInventoryItem, listMovements, isLow } from "@/lib/inventory";
import { listBranches, getProductBranchStock } from "@/lib/branches";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@itech/ui";
import { adjustStock } from "@/app/inventario/actions";

export const dynamic = "force-dynamic";

const REASON_LABEL: Record<string, string> = {
  entrada: "Entrada",
  salida: "Salida",
  ajuste: "Ajuste",
  venta: "Venta",
};

export default async function AdjustStockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireAdmin();
  const { id } = await params;
  const item = await getInventoryItem(id);
  if (!item) notFound();

  const [movements, branches, branchStock] = await Promise.all([
    listMovements(id),
    listBranches(),
    getProductBranchStock(id),
  ]);
  const action = adjustStock.bind(null, id);
  const low = isLow(item);
  const stockByBranch: Record<string, number> = {};
  branchStock.forEach((bs) => (stockByBranch[bs.branch_id] = bs.stock));

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/inventario" className="hover:text-brand-600">
            Inventario
          </Link>{" "}
          / <span className="text-ink">{item.name}</span>
        </nav>
        <h1 className="mt-2 text-2xl font-bold text-ink">{item.name}</h1>
        <p className="mt-1 text-sm">
          Stock actual:{" "}
          <span className={`font-bold ${low ? "text-danger" : "text-ink"}`}>
            {item.stock}
          </span>{" "}
          <span className="text-ink-muted">
            (alerta ≤ {item.low_stock_threshold})
          </span>
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Ajuste */}
          <form
            action={action}
            className="h-fit rounded-2xl border border-surface-border/70 bg-white p-5"
          >
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Registrar movimiento
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Sucursal</label>
                <select
                  name="branch_id"
                  defaultValue={branches.find((b) => b.is_default)?.id ?? branches[0]?.id ?? ""}
                  className="w-full rounded-xl border border-surface-border px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (stock: {stockByBranch[b.id] ?? 0})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Tipo</label>
                <select
                  name="type"
                  className="w-full rounded-xl border border-surface-border px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                >
                  <option value="entrada">Entrada (+)</option>
                  <option value="salida">Salida (−)</option>
                  <option value="ajuste">Ajuste (+)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Cantidad</label>
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  required
                  className="w-full rounded-xl border border-surface-border px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Nota (opcional)</label>
                <input
                  name="note"
                  className="w-full rounded-xl border border-surface-border px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                  placeholder="Ej. Compra a proveedor"
                />
              </div>
              <Button type="submit" className="w-full">
                Aplicar
              </Button>
            </div>
          </form>

          {/* Historial */}
          <div className="overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
            <div className="border-b border-surface-border/70 px-4 py-3 text-sm font-semibold text-ink">
              Historial de movimientos
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-2 font-semibold">Fecha</th>
                  <th className="px-4 py-2 font-semibold">Tipo</th>
                  <th className="px-4 py-2 font-semibold">Cambio</th>
                  <th className="px-4 py-2 font-semibold">Resultante</th>
                  <th className="px-4 py-2 font-semibold">Nota</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m.id} className="border-b border-surface-border/50 last:border-0">
                    <td className="px-4 py-2 text-ink-soft">
                      {new Date(m.created_at).toLocaleString("es-PE")}
                    </td>
                    <td className="px-4 py-2 text-ink-soft">
                      {REASON_LABEL[m.reason] ?? m.reason}
                    </td>
                    <td
                      className={`px-4 py-2 font-semibold ${
                        m.delta >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {m.delta >= 0 ? `+${m.delta}` : m.delta}
                    </td>
                    <td className="px-4 py-2 text-ink">{m.resulting_stock}</td>
                    <td className="px-4 py-2 text-ink-muted">{m.note ?? "—"}</td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                      Sin movimientos todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
