import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format";
import { PrintButton } from "@/components/print-button";

export const dynamic = "force-dynamic";

type QuoteData = {
  found: boolean;
  quote?: {
    number: string;
    customer_name: string;
    customer_doc: string | null;
    currency: string;
    total: number;
    notes: string | null;
    valid_until: string | null;
    created_at: string;
  };
  items?: { description: string; quantity: number; unit_price: number; line_total: number }[];
};

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_quote_public" as never, { p_token: token } as never);
  const res = (data as unknown as QuoteData) ?? { found: false };
  if (!res.found || !res.quote) notFound();

  const settings = await getSettings();
  const q = res.quote;
  const items = res.items ?? [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 print:py-0">
      <div className="mb-4 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="rounded-2xl border border-surface-border/70 bg-white p-8 shadow-card print:border-0 print:shadow-none">
        {/* Encabezado con marca */}
        <div className="flex items-start justify-between gap-4 border-b border-surface-border/70 pb-6">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.webp" alt={settings.store_name || "iTech"} className="h-10 w-auto" />
            <p className="mt-2 text-sm font-semibold text-ink">{settings.store_name || "iTech Import Perú"}</p>
            {settings.contact_phone && <p className="text-xs text-ink-soft">Tel: {settings.contact_phone}</p>}
            {settings.contact_email && <p className="text-xs text-ink-soft">{settings.contact_email}</p>}
          </div>
          <div className="text-right">
            <div className="rounded-xl bg-brand-gradient px-4 py-2 text-white">
              <div className="text-[11px] uppercase tracking-wide opacity-90">Cotización</div>
              <div className="text-lg font-extrabold">{q.number}</div>
            </div>
            <p className="mt-2 text-xs text-ink-muted">
              {new Date(q.created_at).toLocaleDateString("es-PE")}
            </p>
          </div>
        </div>

        {/* Cliente */}
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Para</p>
          <p className="text-base font-medium text-ink">{q.customer_name}</p>
          {q.customer_doc && <p className="text-sm text-ink-soft">{q.customer_doc}</p>}
        </div>

        {/* Ítems */}
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="py-2 font-semibold">Descripción</th>
              <th className="py-2 font-semibold">Cant.</th>
              <th className="py-2 font-semibold">P. unit.</th>
              <th className="py-2 text-right font-semibold">Importe</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i} className="border-b border-surface-border/60">
                <td className="py-2 text-ink">{it.description}</td>
                <td className="py-2 text-ink-soft">{it.quantity}</td>
                <td className="py-2 text-ink-soft">{formatPrice(it.unit_price, q.currency)}</td>
                <td className="py-2 text-right text-ink">{formatPrice(it.line_total, q.currency)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="pt-4 text-right text-base font-semibold text-ink">Total</td>
              <td className="pt-4 text-right text-xl font-extrabold text-brand-600">
                {formatPrice(q.total, q.currency)}
              </td>
            </tr>
          </tfoot>
        </table>

        {q.notes && (
          <div className="mt-6 rounded-xl bg-surface-subtle p-4 text-sm text-ink-soft">
            {q.notes}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-surface-border/70 pt-4 text-xs text-ink-muted">
          <span>
            {q.valid_until ? `Válida hasta ${new Date(q.valid_until).toLocaleDateString("es-PE")}` : ""}
          </span>
          <span>Gracias por su preferencia — {settings.store_name || "iTech Import Perú"}</span>
        </div>
      </div>
    </main>
  );
}
