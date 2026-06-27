import { requireAdmin } from "@/lib/auth";
import { getB2bMetrics } from "@/lib/b2b";
import { AdminHeader } from "@/components/admin-header";

export const dynamic = "force-dynamic";

export default async function B2bDashboardPage() {
  const { user } = await requireAdmin();
  const m = await getB2bMetrics();

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-ink">Panel gerencial B2B</h1>
        <p className="text-sm text-ink-soft">Cumplimiento de SLA y actividad por empresa.</p>

        {!m ? (
          <p className="mt-8 text-ink-muted">No se pudieron cargar las métricas.</p>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { label: "Empresas", value: String(m.companies) },
                { label: "Tickets abiertos", value: String(m.open_tickets) },
                { label: "SLA vencidos", value: String(m.overdue), danger: m.overdue > 0 },
                { label: "Resueltos", value: String(m.resolved) },
                { label: "Cumplimiento SLA", value: `${m.sla_compliance}%` },
              ].map((k) => (
                <div key={k.label} className="rounded-2xl border border-surface-border/70 bg-white p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{k.label}</p>
                  <p className={`mt-2 text-2xl font-extrabold ${k.danger ? "text-danger" : "text-brand-600"}`}>
                    {k.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                    <th className="px-4 py-3 font-semibold">Empresa</th>
                    <th className="px-4 py-3 font-semibold">Plan</th>
                    <th className="px-4 py-3 font-semibold">Tickets abiertos</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">SLA vencidos</th>
                    <th className="px-4 py-3 font-semibold">Reparaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {m.by_company.map((c) => (
                    <tr key={c.name} className="border-b border-surface-border/50 last:border-0">
                      <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                      <td className="px-4 py-3 capitalize text-ink-soft">{c.plan}</td>
                      <td className="px-4 py-3 text-ink-soft">{c.open}</td>
                      <td className="px-4 py-3 text-ink-soft">{c.total}</td>
                      <td className="px-4 py-3">
                        {c.overdue > 0 ? (
                          <span className="font-semibold text-danger">{c.overdue}</span>
                        ) : (
                          <span className="text-ink-muted">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{c.repairs}</td>
                    </tr>
                  ))}
                  {m.by_company.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-muted">Aún no hay empresas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
