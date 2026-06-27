import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getQuote, getQuoteItems, QUOTE_STATUS_LABEL, money } from "@/lib/quotes";
import { AdminHeader } from "@/components/admin-header";

export const dynamic = "force-dynamic";

const STORE_URL = "https://itech-web-woad.vercel.app";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireAdmin();
  const { id } = await params;
  const [q, items] = await Promise.all([getQuote(id), getQuoteItems(id)]);
  if (!q) notFound();

  const publicUrl = `${STORE_URL}/cotizacion/${q.token}`;
  const waMsg = encodeURIComponent(
    `Hola ${q.customer_name}, aquí tu cotización ${q.quote_number}: ${publicUrl}`,
  );
  const waPhone = (q.customer_phone ?? "").replace(/\D/g, "");
  const waLink = waPhone
    ? `https://wa.me/${waPhone.startsWith("51") ? waPhone : "51" + waPhone}?text=${waMsg}`
    : null;

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/cotizaciones" className="hover:text-brand-600">Cotizaciones</Link> /{" "}
          <span className="text-ink">{q.quote_number}</span>
        </nav>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-ink">{q.quote_number}</h1>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-600">
            {QUOTE_STATUS_LABEL[q.status] ?? q.status}
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-3 font-semibold">Descripción</th>
                  <th className="px-4 py-3 font-semibold">Cant.</th>
                  <th className="px-4 py-3 font-semibold">P. unit.</th>
                  <th className="px-4 py-3 text-right font-semibold">Importe</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-surface-border/50 last:border-0">
                    <td className="px-4 py-3 text-ink">{it.description}</td>
                    <td className="px-4 py-3 text-ink-soft">{it.quantity}</td>
                    <td className="px-4 py-3 text-ink-soft">{money(it.unit_price)}</td>
                    <td className="px-4 py-3 text-right text-ink">{money(it.line_total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-subtle">
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold text-ink">Total</td>
                  <td className="px-4 py-3 text-right font-bold text-brand-600">{money(q.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-surface-border/70 bg-white p-5 text-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">Cliente</h2>
              <p className="text-ink">{q.customer_name}</p>
              {q.customer_doc && <p className="text-ink-soft">{q.customer_doc}</p>}
              {q.customer_email && <p className="text-ink-soft">{q.customer_email}</p>}
              {q.valid_until && (
                <p className="mt-2 text-ink-muted">Válida hasta {new Date(q.valid_until).toLocaleDateString("es-PE")}</p>
              )}
            </div>

            <div className="rounded-2xl border border-surface-border/70 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">Compartir</h2>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl bg-brand-500 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                Ver / descargar PDF
              </a>
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block rounded-xl bg-success px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Enviar por WhatsApp
                </a>
              )}
              <p className="mt-3 break-all rounded-lg bg-surface-subtle p-2 text-xs text-ink-soft">
                {publicUrl}
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
