import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getInvoice, getInvoiceItems, DOC_LABEL, INVOICE_STATUS_LABEL, money } from "@/lib/fiscal";
import { AdminHeader } from "@/components/admin-header";
import { SunatSendButton } from "@/components/sunat-send-button";

export const dynamic = "force-dynamic";

const DOCTYPE_LABEL: Record<string, string> = { "6": "RUC", "1": "DNI", "0": "Sin documento" };

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireAdmin();
  const { id } = await params;
  const [inv, items] = await Promise.all([getInvoice(id), getInvoiceItems(id)]);
  if (!inv) notFound();

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/facturacion" className="hover:text-brand-600">Facturación</Link> /{" "}
          <span className="text-ink">{inv.full_number}</span>
        </nav>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink">
              {DOC_LABEL[inv.doc_type] ?? inv.doc_type} {inv.full_number}
            </h1>
            <p className="text-sm text-ink-soft">
              {new Date(inv.created_at).toLocaleString("es-PE")}
            </p>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-600">
            {INVOICE_STATUS_LABEL[inv.status] ?? inv.status}
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-3 font-semibold">Descripción</th>
                  <th className="px-4 py-3 font-semibold">Cant.</th>
                  <th className="px-4 py-3 text-right font-semibold">Importe</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-surface-border/50 last:border-0">
                    <td className="px-4 py-3 text-ink">{it.description}</td>
                    <td className="px-4 py-3 text-ink-soft">{it.quantity}</td>
                    <td className="px-4 py-3 text-right text-ink">{money(it.line_total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan={2} className="px-4 py-2 text-right text-ink-soft">Op. gravada</td><td className="px-4 py-2 text-right">{money(inv.op_gravada)}</td></tr>
                <tr><td colSpan={2} className="px-4 py-2 text-right text-ink-soft">IGV (18%)</td><td className="px-4 py-2 text-right">{money(inv.igv)}</td></tr>
                <tr className="bg-surface-subtle"><td colSpan={2} className="px-4 py-3 text-right font-semibold text-ink">Total</td><td className="px-4 py-3 text-right font-bold text-brand-600">{money(inv.total)}</td></tr>
              </tfoot>
            </table>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-surface-border/70 bg-white p-5 text-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">Cliente</h2>
              <p className="text-ink">{inv.customer_name}</p>
              <p className="text-ink-soft">
                {DOCTYPE_LABEL[inv.customer_doc_type ?? "0"] ?? ""} {inv.customer_doc ?? ""}
              </p>
            </div>
            <div className="rounded-2xl border border-surface-border/70 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">Emisión</h2>
              <SunatSendButton invoiceId={inv.id} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
