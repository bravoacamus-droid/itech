import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listQuotes, QUOTE_STATUS_LABEL, money } from "@/lib/quotes";
import { AdminHeader } from "@/components/admin-header";

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const { user } = await requireAdmin();
  const quotes = await listQuotes();

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Cotizaciones</h1>
            <p className="text-sm text-ink-soft">{quotes.length} cotizaciones</p>
          </div>
          <Link
            href="/cotizaciones/nueva"
            className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600"
          >
            + Nueva cotización
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-semibold">Cotización</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Válida hasta</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id} className="border-b border-surface-border/50 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/cotizaciones/${q.id}`} className="font-medium text-brand-600 hover:underline">
                      {q.quote_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{q.customer_name}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {q.valid_until ? new Date(q.valid_until).toLocaleDateString("es-PE") : "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">{money(q.total)}</td>
                  <td className="px-4 py-3 text-ink-soft">{QUOTE_STATUS_LABEL[q.status] ?? q.status}</td>
                </tr>
              ))}
              {quotes.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-muted">Aún no hay cotizaciones.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
