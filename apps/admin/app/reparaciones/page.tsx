import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listTickets, statusCounts, STATUS_LABEL } from "@/lib/repairs";
import { AdminHeader } from "@/components/admin-header";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  recibido: "bg-brand-50 text-brand-600",
  diagnostico: "bg-warning/15 text-[#9a6a00]",
  esperando_repuesto: "bg-warning/15 text-[#9a6a00]",
  en_reparacion: "bg-brand-50 text-brand-600",
  listo: "bg-success/10 text-success",
  entregado: "bg-ink-muted/10 text-ink-muted",
  anulado: "bg-danger/10 text-danger",
};

export default async function RepairsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { user } = await requireAdmin();
  const sp = await searchParams;
  const active = sp.status;
  const [tickets, counts] = await Promise.all([
    listTickets(active),
    statusCounts(),
  ]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Reparaciones</h1>
            <p className="text-sm text-ink-soft">{total} tickets</p>
          </div>
          <Link
            href="/reparaciones/nuevo"
            className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600"
          >
            + Nuevo ticket
          </Link>
        </div>

        {/* Filtros por estado */}
        <div className="mb-5 flex flex-wrap gap-2">
          <Link
            href="/reparaciones"
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              !active ? "bg-brand-500 text-white" : "bg-surface-subtle text-ink-soft hover:bg-brand-50"
            }`}
          >
            Todos ({total})
          </Link>
          {Object.keys(STATUS_LABEL).map((s) => (
            <Link
              key={s}
              href={`/reparaciones?status=${s}`}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                active === s ? "bg-brand-500 text-white" : "bg-surface-subtle text-ink-soft hover:bg-brand-50"
              }`}
            >
              {STATUS_LABEL[s]} ({counts[s] ?? 0})
            </Link>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-semibold">Ticket</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Equipo</th>
                <th className="px-4 py-3 font-semibold">Técnico</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b border-surface-border/50 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/reparaciones/${t.id}`} className="font-medium text-brand-600 hover:underline">
                      {t.ticket_number}
                    </Link>
                    <div className="text-xs text-ink-muted">
                      {new Date(t.created_at).toLocaleDateString("es-PE")}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {t.customer_name}
                    <div className="text-xs text-ink-muted">{t.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {[t.device_type, t.brand, t.model].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{t.technician_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[t.status] ?? "bg-surface-subtle text-ink-soft"}`}>
                      {STATUS_LABEL[t.status] ?? t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                    No hay tickets.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
