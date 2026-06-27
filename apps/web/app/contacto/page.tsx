import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { ContactForm } from "@/components/contact-form";
import { getWhatsappNumber } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contacto — iTech Import Perú",
  description: "Escríbenos por WhatsApp o correo. Estamos para ayudarte con tu compra o reparación.",
};

export const dynamic = "force-dynamic";

export default async function ContactoPage() {
  const wa = (await getWhatsappNumber()).replace(/[^0-9]/g, "");
  const waLink = `https://wa.me/${wa}?text=${encodeURIComponent("Hola iTech, quiero más información.")}`;

  return (
    <PageShell
      eyebrow="Contacto"
      title="¿Conversamos?"
      subtitle="Estamos para ayudarte con tu compra, tu cotización o tu reparación."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <ContactForm wa={wa} />

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-surface-border/70 shadow-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/soporte-pos.jpg" alt="iTech soporte" className="aspect-[16/10] w-full object-cover" />
          </div>

          <a href={waLink} className="flex items-center gap-3 rounded-2xl border border-surface-border/70 bg-white p-4 transition hover:shadow-card">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-xl">💬</span>
            <div>
              <p className="font-semibold text-ink">WhatsApp</p>
              <p className="text-sm text-ink-muted">Respuesta rápida en horario de atención</p>
            </div>
          </a>
          <a href="mailto:ventas@itech.pe" className="flex items-center gap-3 rounded-2xl border border-surface-border/70 bg-white p-4 transition hover:shadow-card">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl">✉️</span>
            <div>
              <p className="font-semibold text-ink">Correo</p>
              <p className="text-sm text-ink-muted">ventas@itech.pe</p>
            </div>
          </a>

          <div className="rounded-2xl border border-surface-border/70 bg-white p-5">
            <h3 className="font-bold text-ink">Horario de atención</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li className="flex justify-between"><span>Lun – Vie</span><span className="font-medium text-ink">9:00 – 19:00</span></li>
              <li className="flex justify-between"><span>Sábados</span><span className="font-medium text-ink">9:00 – 14:00</span></li>
              <li className="flex justify-between"><span>Dom / feriados</span><span className="font-medium text-ink">Cerrado</span></li>
            </ul>
            <p className="mt-3 rounded-xl bg-surface-subtle p-3 text-sm text-ink-soft">📍 Lima, Perú — envíos a todo el país.</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
