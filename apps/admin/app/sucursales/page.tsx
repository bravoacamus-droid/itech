import { requireAdmin } from "@/lib/auth";
import { listBranches, getBranchMetrics } from "@/lib/branches";
import { money } from "@/lib/format";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@itech/ui";
import { createBranch, updateBranch } from "@/app/sucursales/actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";

export default async function BranchesPage() {
  const { user } = await requireAdmin();
  const [branches, metrics] = await Promise.all([listBranches(), getBranchMetrics()]);

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-ink">Sucursales</h1>
        <p className="text-sm text-ink-soft">Comparativo de ventas y stock por sede.</p>

        {/* Comparativo */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-semibold">Sede</th>
                <th className="px-4 py-3 font-semibold">Ventas</th>
                <th className="px-4 py-3 font-semibold">Pedidos</th>
                <th className="px-4 py-3 font-semibold">Stock (unid.)</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.name} className="border-b border-surface-border/50 last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">{m.name}</span>
                    {m.is_default && <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-600">POS</span>}
                    {m.is_online && <span className="ml-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">Web</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-600">{money(m.sales)}</td>
                  <td className="px-4 py-3 text-ink-soft">{m.orders}</td>
                  <td className="px-4 py-3 text-ink-soft">{m.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Gestión */}
        <h2 className="mt-10 mb-3 text-lg font-bold text-ink">Gestionar sedes</h2>
        <div className="space-y-3">
          {branches.map((b) => (
            <form
              key={b.id}
              action={updateBranch.bind(null, b.id)}
              className="grid items-center gap-3 rounded-2xl border border-surface-border/70 bg-white p-4 sm:grid-cols-[1fr_1fr_auto_auto_auto]"
            >
              <input name="name" defaultValue={b.name} className={field} />
              <input name="address" defaultValue={b.address ?? ""} placeholder="Dirección" className={field} />
              <label className="flex items-center gap-1 text-xs text-ink-soft">
                <input type="checkbox" name="is_online" defaultChecked={b.is_online} /> Web
              </label>
              <label className="flex items-center gap-1 text-xs text-ink-soft">
                <input type="checkbox" name="is_active" defaultChecked={b.is_active} /> Activa
              </label>
              <Button type="submit" variant="outline">Guardar</Button>
            </form>
          ))}
        </div>

        <h2 className="mt-8 mb-3 text-lg font-bold text-ink">Nueva sede</h2>
        <form action={createBranch} className="grid items-center gap-3 rounded-2xl border border-surface-border/70 bg-white p-4 sm:grid-cols-[1fr_1fr_auto_auto]">
          <input name="name" required placeholder="Nombre de la sede" className={field} />
          <input name="address" placeholder="Dirección" className={field} />
          <label className="flex items-center gap-1 text-xs text-ink-soft">
            <input type="checkbox" name="is_online" /> Recibe ventas web
          </label>
          <Button type="submit">Crear sede</Button>
        </form>
        <p className="mt-3 text-xs text-ink-muted">
          Nota: al crear una sede nueva su stock inicia en 0; usa Inventario para
          cargar stock por sede. Una sola sede debe estar marcada como “Web”.
        </p>
      </main>
    </div>
  );
}
