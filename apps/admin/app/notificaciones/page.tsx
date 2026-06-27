import { requireAdmin } from "@/lib/auth";
import { listNotifications, waLink } from "@/lib/notifications";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@itech/ui";
import { markSent, discard, sendPendingEmails } from "@/app/notificaciones/actions";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  pendiente: "bg-warning/15 text-[#9a6a00]",
  enviado: "bg-success/10 text-success",
  error: "bg-danger/10 text-danger",
  descartado: "bg-ink-muted/10 text-ink-muted",
};

export default async function NotificationsPage() {
  const { user } = await requireAdmin();
  const items = await listNotifications();
  const pendingEmails = items.filter((n) => n.channel === "email" && n.status === "pendiente").length;

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink">Notificaciones</h1>
            <p className="text-sm text-ink-soft">
              Se generan automáticamente al cambiar estados de reparación o soporte.
            </p>
          </div>
          {pendingEmails > 0 && (
            <form action={sendPendingEmails}>
              <Button type="submit">Enviar emails pendientes ({pendingEmails})</Button>
            </form>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-semibold">Canal</th>
                <th className="px-4 py-3 font-semibold">Destinatario</th>
                <th className="px-4 py-3 font-semibold">Mensaje</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr key={n.id} className="border-b border-surface-border/50 align-top last:border-0">
                  <td className="px-4 py-3">
                    <span className="capitalize">{n.channel}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{n.recipient}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    <div className="line-clamp-2 max-w-md">{n.body}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[n.status] ?? ""}`}>
                      {n.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {n.channel === "whatsapp" && n.status === "pendiente" && (
                        <a
                          href={waLink(n.recipient, n.body)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-success px-2.5 py-1.5 text-xs font-semibold text-white"
                        >
                          Enviar WhatsApp
                        </a>
                      )}
                      {n.status === "pendiente" && (
                        <>
                          <form action={markSent.bind(null, n.id)}>
                            <button className="rounded-lg px-2 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50">
                              Marcar enviado
                            </button>
                          </form>
                          <form action={discard.bind(null, n.id)}>
                            <button className="rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-muted hover:bg-surface-subtle">
                              Descartar
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-muted">Sin notificaciones.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-ink-muted">
          WhatsApp: clic en “Enviar WhatsApp” abre el chat con el mensaje listo. Email:
          se envía automáticamente si configuras <code>RESEND_API_KEY</code> en el servidor.
        </p>
      </main>
    </div>
  );
}
