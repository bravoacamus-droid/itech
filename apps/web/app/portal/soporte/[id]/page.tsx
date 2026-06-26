import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SupportReplyForm } from "@/components/portal/support-reply-form";
import { getPortalUser, getSupportThread, SUPPORT_STATUS_LABEL } from "@/lib/portal";

export const dynamic = "force-dynamic";

export default async function PortalSupportDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const pu = await getPortalUser();
  if (!pu) redirect("/cuenta/ingresar");
  if (!pu.company) redirect("/portal");

  const { id } = await params;
  const thread = await getSupportThread(id);
  if (!thread) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/portal" className="hover:text-brand-600">Portal</Link> /{" "}
          <span className="text-ink">{thread.ticket.ticket_number}</span>
        </nav>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-ink">{thread.ticket.subject}</h1>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-600">
            {SUPPORT_STATUS_LABEL[thread.ticket.status] ?? thread.ticket.status}
          </span>
        </div>

        <div className="mt-6 rounded-2xl border border-surface-border/70 bg-white p-5">
          <div className="space-y-4">
            {thread.messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                  m.author_type === "soporte"
                    ? "bg-surface-subtle text-ink"
                    : "ml-auto bg-brand-50 text-ink"
                }`}
              >
                <div className="mb-1 text-[11px] font-semibold uppercase text-ink-muted">
                  {m.author_type === "soporte" ? "Soporte iTech" : "Tú"}
                </div>
                <p>{m.body}</p>
                <div className="mt-1 text-[10px] text-ink-muted">
                  {new Date(m.created_at).toLocaleString("es-PE")}
                </div>
              </div>
            ))}
            {thread.messages.length === 0 && (
              <p className="text-sm text-ink-muted">Sin mensajes aún.</p>
            )}
          </div>
          <SupportReplyForm ticketId={thread.ticket.id} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
