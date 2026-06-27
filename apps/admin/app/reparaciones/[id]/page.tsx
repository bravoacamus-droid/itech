import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  getTicket,
  getTicketUpdates,
  REPAIR_STATUSES,
  STATUS_LABEL,
} from "@/lib/repairs";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@itech/ui";
import { money } from "@/lib/format";
import { listCompanies } from "@/lib/b2b";
import { warrantyLeft } from "@/lib/repairs";
import { updateTicket, reopenWarranty } from "@/app/reparaciones/actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";
const label = "block text-sm font-medium text-ink mb-1";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireAdmin();
  const { id } = await params;
  const [ticket, updates, companies] = await Promise.all([
    getTicket(id),
    getTicketUpdates(id),
    listCompanies(),
  ]);
  if (!ticket) notFound();

  const action = updateTicket.bind(null, id);

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/reparaciones" className="hover:text-brand-600">
            Reparaciones
          </Link>{" "}
          / <span className="text-ink">{ticket.ticket_number}</span>
        </nav>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-ink">{ticket.ticket_number}</h1>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-600">
            {STATUS_LABEL[ticket.status] ?? ticket.status}
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Info + actualización */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-surface-border/70 bg-white p-5 text-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                Datos
              </h2>
              <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                <p><span className="text-ink-muted">Cliente:</span> {ticket.customer_name}</p>
                <p><span className="text-ink-muted">Teléfono:</span> {ticket.customer_phone}</p>
                <p><span className="text-ink-muted">Equipo:</span> {[ticket.device_type, ticket.brand, ticket.model].filter(Boolean).join(" ") || "—"}</p>
                <p><span className="text-ink-muted">IMEI/Serie:</span> {ticket.imei_serial ?? "—"}</p>
                <p className="sm:col-span-2"><span className="text-ink-muted">Falla:</span> {ticket.reported_issue ?? "—"}</p>
                <p><span className="text-ink-muted">Costo estimado:</span> {ticket.estimated_cost != null ? money(ticket.estimated_cost) : "—"}</p>
                <p><span className="text-ink-muted">Técnico:</span> {ticket.technician_name ?? "—"}</p>
              </div>
            </div>

            <form action={action} className="rounded-2xl border border-surface-border/70 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                Actualizar ticket
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={label}>Estado</label>
                  <select name="status" defaultValue={ticket.status} className={field}>
                    {REPAIR_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>Técnico</label>
                  <input name="technician_name" defaultValue={ticket.technician_name ?? ""} className={field} />
                </div>
                <div>
                  <label className={label}>Empresa (B2B)</label>
                  <select name="company_id" defaultValue={ticket.company_id ?? ""} className={field}>
                    <option value="">— Cliente final —</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>Costo estimado (S/)</label>
                  <input name="estimated_cost" type="number" step="0.01" min={0} defaultValue={ticket.estimated_cost ?? ""} className={field} />
                </div>
                <div className="sm:col-span-2">
                  <label className={label}>Diagnóstico (interno)</label>
                  <textarea name="diagnosis" rows={2} defaultValue={ticket.diagnosis ?? ""} className={field} />
                </div>
                <div className="sm:col-span-2">
                  <label className={label}>Nota para el historial (visible al cliente)</label>
                  <input name="note" className={field} placeholder="Ej. Esperando repuesto de pantalla" />
                </div>
              </div>
              <div className="mt-4">
                <Button type="submit">Guardar actualización</Button>
              </div>
            </form>
          </div>

          {/* Timeline + seguimiento */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-surface-border/70 bg-white p-5">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                Seguimiento del cliente
              </h2>
              <p className="text-xs text-ink-soft">
                El cliente consulta su estado en la web con su número de ticket y
                teléfono.
              </p>
              <div className="mt-2 rounded-lg bg-surface-subtle px-3 py-2 text-xs">
                <div><span className="text-ink-muted">N°:</span> {ticket.ticket_number}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-surface-border/70 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                Garantía
              </h2>
              {ticket.is_warranty && (
                <p className="mb-2 rounded-lg bg-brand-50 px-2 py-1 text-xs font-medium text-brand-600">
                  Ticket de garantía (sin costo)
                </p>
              )}
              {ticket.delivered_at ? (
                (() => {
                  const left = warrantyLeft(ticket);
                  return (
                    <p className="text-sm">
                      {left && left > 0 ? (
                        <span className="font-semibold text-success">{left} días</span>
                      ) : (
                        <span className="font-semibold text-danger">Vencida</span>
                      )}{" "}
                      <span className="text-ink-muted">
                        (entregado {new Date(ticket.delivered_at).toLocaleDateString("es-PE")}, {ticket.warranty_days} días)
                      </span>
                    </p>
                  );
                })()
              ) : (
                <p className="text-sm text-ink-muted">
                  La garantía ({ticket.warranty_days} días) inicia al entregar el equipo.
                </p>
              )}
              <form action={reopenWarranty.bind(null, ticket.id)} className="mt-3 space-y-2 border-t border-surface-border/70 pt-3">
                <input
                  name="note"
                  placeholder="Motivo de la reapertura"
                  className="w-full rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                />
                <Button type="submit" variant="outline" className="w-full">
                  Reabrir por garantía (sin costo)
                </Button>
              </form>
            </div>

            <div className="rounded-2xl border border-surface-border/70 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                Historial
              </h2>
              <ol className="space-y-4">
                {updates.map((u) => (
                  <li key={u.id} className="relative border-l-2 border-brand-100 pl-4">
                    <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-brand-500" />
                    <div className="text-sm font-medium text-ink">
                      {STATUS_LABEL[u.status] ?? u.status}
                    </div>
                    {u.note && <div className="text-xs text-ink-soft">{u.note}</div>}
                    <div className="text-[11px] text-ink-muted">
                      {new Date(u.created_at).toLocaleString("es-PE")}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
