import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Preguntas frecuentes — iTech Import Perú",
};

const FAQS = [
  { q: "¿Hacen envíos a todo el Perú?", a: "Sí. Despachamos a todo el país mediante agencias de confianza. El costo y tiempo dependen del destino y se confirman al momento de la compra." },
  { q: "¿Los productos tienen garantía?", a: "Todos nuestros productos cuentan con garantía. El periodo depende de cada producto y marca; lo indicamos en la ficha y en tu comprobante." },
  { q: "¿Qué métodos de pago aceptan?", a: "Yape, Plin, transferencia bancaria, tarjetas de crédito/débito y pago contra entrega en zonas habilitadas. Más detalles en la sección Métodos de pago." },
  { q: "¿Puedo seguir el estado de mi reparación?", a: "Sí. Con tu número de ticket puedes ver el estado en línea desde la sección Seguir reparación." },
  { q: "¿Emiten factura?", a: "Sí, emitimos boleta y factura electrónica. Indícanos tus datos de facturación al realizar la compra." },
  { q: "¿Atienden a empresas?", a: "Sí. Ofrecemos soporte gestionado con SLA, mantenimiento de flota y mesa de ayuda. Conoce los planes en Soporte para empresas." },
];

export default function FaqPage() {
  return (
    <PageShell eyebrow="Ayuda" title="Preguntas frecuentes" subtitle="Resolvemos las dudas más comunes sobre compras, envíos, garantía y soporte.">
      <div className="mx-auto max-w-3xl space-y-3">
        {FAQS.map((f) => (
          <details key={f.q} className="group rounded-2xl border border-surface-border/70 bg-white p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
              {f.q}
              <span className="text-brand-500 transition group-open:rotate-45">＋</span>
            </summary>
            <p className="mt-3 text-sm text-ink-soft">{f.a}</p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}
