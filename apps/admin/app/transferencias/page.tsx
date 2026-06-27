import { requireStaff } from "@/lib/auth";
import { getBranchScope } from "@/lib/branches";
import { listTransfers, getTransferProducts } from "@/lib/transfers";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@itech/ui";
import { createTransfer } from "@/app/transferencias/actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";

export default async function TransfersPage() {
  const { user } = await requireStaff();
  const [{ branches }, products, transfers] = await Promise.all([
    getBranchScope(),
    getTransferProducts(),
    listTransfers(),
  ]);
  const allBranches = branches; // origen acotado a las sedes del usuario

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-ink">Transferencias entre sedes</h1>
        <p className="text-sm text-ink-soft">
          Mueve unidades de una sucursal a otra. El stock total no cambia; se
          registra un movimiento de salida y otro de entrada.
        </p>

        {branches.length < 2 ? (
          <div className="mt-6 rounded-2xl border border-amber-300/50 bg-amber-50 p-4 text-sm text-amber-800">
            Necesitas al menos 2 sucursales (a las que tengas acceso) para
            transferir stock.
          </div>
        ) : (
          <form
            action={createTransfer}
            className="mt-6 grid gap-4 rounded-2xl border border-surface-border/70 bg-white p-5 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-ink">Producto</label>
              <select name="product_id" required className={field} defaultValue="">
                <option value="" disabled>Selecciona un producto</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Desde (origen)</label>
              <select name="from_branch" required className={field} defaultValue={allBranches[0]?.id}>
                {allBranches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Hacia (destino)</label>
              <select name="to_branch" required className={field} defaultValue={allBranches[1]?.id}>
                {allBranches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Cantidad</label>
              <input name="quantity" type="number" min={1} defaultValue={1} required className={field} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Nota (opcional)</label>
              <input name="note" className={field} placeholder="Motivo o referencia" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Transferir</Button>
            </div>
          </form>
        )}

        <h2 className="mt-10 mb-3 text-lg font-bold text-ink">Historial</h2>
        <div className="overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-semibold">N°</th>
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Origen → Destino</th>
                <th className="px-4 py-3 font-semibold">Cant.</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <tr key={t.id} className="border-b border-surface-border/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{t.transfer_number}</td>
                  <td className="px-4 py-3 text-ink-soft">{t.product}</td>
                  <td className="px-4 py-3 text-ink-soft">{t.from_branch} → {t.to_branch}</td>
                  <td className="px-4 py-3 font-semibold text-brand-600">{t.quantity}</td>
                  <td className="px-4 py-3 text-ink-muted">{new Date(t.created_at).toLocaleString("es-PE")}</td>
                </tr>
              ))}
              {transfers.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-muted">Aún no hay transferencias.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
