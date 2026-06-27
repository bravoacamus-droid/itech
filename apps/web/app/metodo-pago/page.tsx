import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Métodos de pago — iTech Import Perú",
};

const METHODS = [
  { icon: "📱", t: "Yape / Plin", d: "Pago inmediato desde tu celular." },
  { icon: "🏦", t: "Transferencia bancaria", d: "BCP, BBVA, Interbank y más." },
  { icon: "💳", t: "Tarjetas", d: "Crédito y débito (Visa, Mastercard)." },
  { icon: "📦", t: "Contra entrega", d: "En zonas habilitadas de Lima." },
];

export default function MetodoPagoPage() {
  return (
    <PageShell eyebrow="Pagos" title="Métodos de pago" subtitle="Elige la forma de pago que más te convenga. Compra fácil y segura.">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {METHODS.map((m) => (
          <div key={m.t} className="rounded-2xl border border-surface-border/70 bg-white p-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">{m.icon}</div>
            <h3 className="font-bold text-ink">{m.t}</h3>
            <p className="mt-1 text-sm text-ink-soft">{m.d}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-surface-border/70 bg-surface-subtle p-6 text-sm text-ink-soft">
        <p className="font-semibold text-ink">Comprobantes</p>
        <p className="mt-1">Emitimos boleta y factura electrónica. Indícanos tus datos de facturación al realizar la compra.</p>
      </div>
    </PageShell>
  );
}
