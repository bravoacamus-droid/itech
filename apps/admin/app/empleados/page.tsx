import { requireAdmin } from "@/lib/auth";
import { listTimeEntries } from "@/lib/attendance";
import { AdminHeader } from "@/components/admin-header";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const { user } = await requireAdmin();
  const entries = await listTimeEntries();
  const openNow = entries.filter((e) => !e.clock_out).length;

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-ink">Empleados — Asistencia</h1>
        <p className="text-sm text-ink-soft">
          {entries.length} registros · {openNow} en turno ahora
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-semibold">Empleado</th>
                <th className="px-4 py-3 font-semibold">Sucursal</th>
                <th className="px-4 py-3 font-semibold">Entrada</th>
                <th className="px-4 py-3 font-semibold">Salida</th>
                <th className="px-4 py-3 font-semibold">Horas</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-surface-border/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{e.employee}</td>
                  <td className="px-4 py-3 text-ink-soft">{e.branch}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {new Date(e.clock_in).toLocaleString("es-PE")}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {e.clock_out ? (
                      new Date(e.clock_out).toLocaleString("es-PE")
                    ) : (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                        En turno
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink">{e.hours != null ? `${e.hours} h` : "—"}</td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-muted">Sin registros de asistencia.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
