import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Envíos y garantía — iTech Import Perú",
};

export default function EnviosGarantiaPage() {
  return (
    <PageShell eyebrow="Información" title="Envíos y garantía" subtitle="Compra con tranquilidad: despachos seguros y respaldo real en cada producto.">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-surface-border/70 bg-white p-6">
          <h2 className="text-xl font-bold text-ink">🚚 Envíos</h2>
          <ul className="mt-4 space-y-3 text-sm text-ink-soft">
            <li>• Despachamos a todo el Perú mediante agencias de confianza.</li>
            <li>• El costo y el tiempo de entrega se calculan según el destino.</li>
            <li>• Recibirás el número de seguimiento de tu pedido.</li>
            <li>• En Lima ofrecemos entregas más rápidas en zonas habilitadas.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-surface-border/70 bg-white p-6">
          <h2 className="text-xl font-bold text-ink">🛡️ Garantía</h2>
          <ul className="mt-4 space-y-3 text-sm text-ink-soft">
            <li>• Todos los productos cuentan con garantía contra defectos de fábrica.</li>
            <li>• El periodo depende del producto y la marca (indicado en tu comprobante).</li>
            <li>• Para hacer válida la garantía, conserva tu boleta o factura.</li>
            <li>• Gestionamos cambios y RMA de forma ágil y transparente.</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-surface-border/70 bg-surface-subtle p-6">
        <h3 className="font-bold text-ink">¿Cómo solicito la garantía?</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-soft">
          <li>Escríbenos por WhatsApp o correo con tu número de comprobante.</li>
          <li>Te indicamos el procedimiento y, de ser necesario, recepcionamos el equipo.</li>
          <li>Diagnosticamos y resolvemos según la cobertura de garantía.</li>
        </ol>
        <a href="/contacto" className="mt-4 inline-flex rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">Contactar soporte</a>
      </div>
    </PageShell>
  );
}
