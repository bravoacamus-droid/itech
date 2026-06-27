import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { getWhatsappNumber } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Libro de reclamaciones — iTech Import Perú",
};

export const dynamic = "force-dynamic";

export default async function LibroReclamacionesPage() {
  const wa = (await getWhatsappNumber()).replace(/[^0-9]/g, "");
  return (
    <PageShell
      eyebrow="Libro de reclamaciones"
      title="Tu opinión nos importa"
      subtitle="Conforme al Código de Protección y Defensa del Consumidor, ponemos a tu disposición nuestro libro de reclamaciones."
    >
      <div className="mx-auto max-w-2xl rounded-2xl border border-surface-border/70 bg-white p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">📕</span>
          <div>
            <h2 className="text-lg font-bold text-ink">Registra tu reclamo o queja</h2>
            <p className="text-sm text-ink-muted">Te responderemos en el plazo de ley.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-sm text-ink-soft">
          <p>Para registrar un reclamo (disconformidad con el producto o servicio) o una queja (malestar con la atención), envíanos los siguientes datos:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Nombre completo y documento de identidad</li>
            <li>Teléfono y correo de contacto</li>
            <li>Detalle del bien o servicio contratado</li>
            <li>Descripción del reclamo o queja y tu pedido</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href={`https://wa.me/${wa}?text=${encodeURIComponent("Hola, deseo registrar un reclamo/queja en el libro de reclamaciones.")}`} className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">Enviar por WhatsApp</a>
          <a href="mailto:reclamos@itech.pe?subject=Libro%20de%20reclamaciones" className="rounded-xl border border-brand-200 px-5 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50">Enviar por correo</a>
        </div>

        <p className="mt-6 text-xs text-ink-muted">
          La presentación del reclamo no impide acudir a otras vías de solución de
          controversias ni constituye requisito previo para una denuncia ante el
          Indecopi.
        </p>
      </div>
    </PageShell>
  );
}
