import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listCompanies } from "@/lib/b2b";
import { AdminHeader } from "@/components/admin-header";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const { user } = await requireAdmin();
  const companies = await listCompanies();

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Empresas (B2B)</h1>
            <p className="text-sm text-ink-soft">{companies.length} empresas</p>
          </div>
          <Link
            href="/empresas/nueva"
            className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600"
          >
            + Nueva empresa
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-semibold">Empresa</th>
                <th className="px-4 py-3 font-semibold">RUC</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b border-surface-border/50 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/empresas/${c.id}`} className="font-medium text-brand-600 hover:underline">
                      {c.name}
                    </Link>
                    {c.contact_name && <div className="text-xs text-ink-muted">{c.contact_name}</div>}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{c.ruc ?? "—"}</td>
                  <td className="px-4 py-3 capitalize text-ink-soft">{c.plan}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.is_active ? "bg-success/10 text-success" : "bg-ink-muted/10 text-ink-muted"}`}>
                      {c.is_active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-ink-muted">Aún no hay empresas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
