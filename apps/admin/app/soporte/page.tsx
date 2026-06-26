import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import {
  listSupportTickets,
  slaState,
  SUPPORT_STATUS_LABEL,
  PRIORITY_LABEL,
} from "@/lib/b2b";
import { AdminHeader } from "@/components/admin-header";

export const dynamic = "force-dynamic";

export default async function SupportQueuePage() {
  const { user } = await requireAdmin();
  const tickets = await listSupportTickets();

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-ink">Soporte (Helpdesk B2B)</h1>
        <p className="text-sm text-ink-soft">{tickets.length} tickets</p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-semibold">Ticket</th>
                <th className="px-4 py-3 font-semibold">Empresa</th>
                <th className="px-4 py-3 font-semibold">Asunto</th>
                <th className="px-4 py-3 font-semibold">Prioridad</th>
                <th className="px-4 py-3 font-semibold">SLA</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => {
                const sla = slaState(t);
                return (
                  <tr key={t.id} className="border-b border-surface-border/50 last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/soporte/${t.id}`} className="font-medium text-brand-600 hover:underline">
                        {t.ticket_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{t.company?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-ink">{t.subject}</td>
                    <td className="px-4 py-3 text-ink-soft">{PRIORITY_LABEL[t.priority] ?? t.priority}</td>
                    <td className="px-4 py-3">
                      {sla === "vencido" ? (
                        <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">Vencido</span>
                      ) : sla === "en_plazo" ? (
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">En plazo</span>
                      ) : (
                        <span className="text-xs text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{SUPPORT_STATUS_LABEL[t.status] ?? t.status}</td>
                  </tr>
                );
              })}
              {tickets.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-muted">No hay tickets de soporte.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
