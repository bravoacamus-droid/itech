import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { getWhatsappNumber } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contacto — iTech Import Perú",
  description: "Escríbenos por WhatsApp o correo. Estamos para ayudarte con tu compra o reparación.",
};

export const dynamic = "force-dynamic";

export default async function ContactoPage() {
  const wa = (await getWhatsappNumber()).replace(/[^0-9]/g, "");
  const waLink = `https://wa.me/${wa}?text=${encodeURIComponent("Hola iTech, quiero más información.")}`;

  const CARDS = [
    { icon: "💬", t: "WhatsApp", d: "Respuesta rápida en horario de atención", action: { label: "Escribir por WhatsApp", href: waLink } },
    { icon: "✉️", t: "Correo", d: "ventas@itech.pe", action: { label: "Enviar correo", href: "mailto:ventas@itech.pe" } },
    { icon: "🏢", t: "Empresas", d: "Soporte gestionado con SLA", action: { label: "Ver soluciones B2B", href: "/b2b" } },
  ];

  return (
    <PageShell
      eyebrow="Contacto"
      title="¿Conversamos?"
      subtitle="Estamos para ayudarte con tu compra, tu cotización o tu reparación."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {CARDS.map((c) => (
          <div key={c.t} className="flex flex-col rounded-2xl border border-surface-border/70 bg-white p-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">{c.icon}</div>
            <h3 className="text-lg font-bold text-ink">{c.t}</h3>
            <p className="mt-1 flex-1 text-sm text-ink-soft">{c.d}</p>
            <a
              href={c.action.href}
              className="mt-4 inline-flex w-fit rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              {c.action.label}
            </a>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-surface-border/70 bg-white p-6">
          <h3 className="text-lg font-bold text-ink">Horario de atención</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li className="flex justify-between"><span>Lunes a viernes</span><span className="font-medium text-ink">9:00 – 19:00</span></li>
            <li className="flex justify-between"><span>Sábados</span><span className="font-medium text-ink">9:00 – 14:00</span></li>
            <li className="flex justify-between"><span>Domingos y feriados</span><span className="font-medium text-ink">Cerrado</span></li>
          </ul>
          <div className="mt-4 rounded-xl bg-surface-subtle p-4 text-sm text-ink-soft">
            📍 Lima, Perú — atención presencial y envíos a todo el país.
          </div>
        </div>
        <div className="rounded-2xl border border-surface-border/70 bg-white p-6">
          <h3 className="text-lg font-bold text-ink">¿Dejaste tu equipo en reparación?</h3>
          <p className="mt-2 text-sm text-ink-soft">
            Consulta el estado de tu orden en línea con tu número de ticket.
          </p>
          <a href="/seguimiento" className="mt-4 inline-flex rounded-xl border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50">
            Seguir mi reparación
          </a>
        </div>
      </div>
    </PageShell>
  );
}
