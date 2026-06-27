import { requireAdmin } from "@/lib/auth";
import { listBranches } from "@/lib/branches";
import { listStaff, ROLE_LABELS, ASSIGNABLE_ROLES } from "@/lib/staff";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@itech/ui";
import { assignStaff } from "@/app/accesos/actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";

export default async function AccessPage() {
  const { user } = await requireAdmin();
  const [branches, staff] = await Promise.all([listBranches(), listStaff()]);

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-ink">Accesos y permisos</h1>
        <p className="text-sm text-ink-soft">
          Asigna rol y sucursales a cada usuario. Un cajero/almacén solo verá y
          operará las sedes asignadas; los administradores ven todo.
        </p>

        <h2 className="mt-8 mb-3 text-lg font-bold text-ink">Personal</h2>
        <div className="overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Rol</th>
                <th className="px-4 py-3 font-semibold">Sucursales</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-b border-surface-border/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{s.full_name}</td>
                  <td className="px-4 py-3 text-ink-soft">{ROLE_LABELS[s.role] ?? s.role}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {["super_admin", "org_admin"].includes(s.role)
                      ? "Todas"
                      : s.branches.length
                        ? s.branches.join(", ")
                        : "—"}
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-10 text-center text-ink-muted">Sin personal.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 mb-3 text-lg font-bold text-ink">Asignar acceso</h2>
        <form action={assignStaff} className="space-y-4 rounded-2xl border border-surface-border/70 bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Correo del usuario</label>
              <input name="email" type="email" required placeholder="persona@itech.pe" className={field} />
              <p className="mt-1 text-xs text-ink-muted">El usuario debe haberse registrado antes.</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Rol</label>
              <select name="role" required className={field} defaultValue="cashier">
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Sucursales asignadas</label>
            <div className="flex flex-wrap gap-3">
              {branches.map((b) => (
                <label key={b.id} className="flex items-center gap-2 rounded-xl border border-surface-border px-3 py-2 text-sm">
                  <input type="checkbox" name="branches" value={b.id} /> {b.name}
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              Para administradores no es necesario marcar sedes (ven todas).
            </p>
          </div>
          <Button type="submit">Guardar acceso</Button>
        </form>
      </main>
    </div>
  );
}
