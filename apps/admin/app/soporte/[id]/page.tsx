import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  getSupportTicket,
  getSupportMessages,
  SUPPORT_STATUSES,
  SUPPORT_STATUS_LABEL,
  PRIORITY_LABEL,
} from "@/lib/b2b";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@itech/ui";
import { replySupport, changeSupportStatus } from "@/app/soporte/actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";

export default async function SupportTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireAdmin();
  const { id } = await params;
  const [ticket, messages] = await Promise.all([
    getSupportTicket(id),
    getSupportMessages(id),
  ]);
  if (!ticket) notFound();

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/soporte" className="hover:text-brand-600">Soporte</Link> /{" "}
          <span className="text-ink">{ticket.ticket_number}</span>
        </nav>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink">{ticket.subject}</h1>
            <p className="text-sm text-ink-soft">
              {ticket.company?.name} · {ticket.ticket_number} · Prioridad{" "}
              {PRIORITY_LABEL[ticket.priority] ?? ticket.priority}
            </p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-600">
            {SUPPORT_STATUS_LABEL[ticket.status] ?? ticket.status}
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Conversación */}
          <div className="rounded-2xl border border-surface-border/70 bg-white p-5">
            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                    m.author_type === "soporte"
                      ? "ml-auto bg-brand-50 text-ink"
                      : "bg-surface-subtle text-ink"
                  }`}
                >
                  <div className="mb-1 text-[11px] font-semibold uppercase text-ink-muted">
                    {m.author_type === "soporte" ? "Soporte" : "Cliente"}
                  </div>
                  <p>{m.body}</p>
                  <div className="mt-1 text-[10px] text-ink-muted">
                    {new Date(m.created_at).toLocaleString("es-PE")}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-sm text-ink-muted">Sin mensajes.</p>
              )}
            </div>

            <form action={replySupport.bind(null, id)} className="mt-5 flex gap-2 border-t border-surface-border/70 pt-4">
              <input name="body" required placeholder="Escribe una respuesta…" className={field} />
              <Button type="submit">Enviar</Button>
            </form>
          </div>

          {/* Estado */}
          <aside>
            <form action={changeSupportStatus.bind(null, id)} className="rounded-2xl border border-surface-border/70 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">Gestión</h2>
              <label className="mb-1 block text-sm font-medium text-ink">Estado</label>
              <select name="status" defaultValue={ticket.status} className={field}>
                {SUPPORT_STATUSES.map((s) => (
                  <option key={s} value={s}>{SUPPORT_STATUS_LABEL[s]}</option>
                ))}
              </select>
              <label className="mb-1 mt-3 block text-sm font-medium text-ink">Asignado a</label>
              <input name="assigned_to" defaultValue={ticket.assigned_to ?? ""} className={field} />
              <div className="mt-4"><Button type="submit" variant="outline" className="w-full">Actualizar</Button></div>
            </form>
          </aside>
        </div>
      </main>
    </div>
  );
}
