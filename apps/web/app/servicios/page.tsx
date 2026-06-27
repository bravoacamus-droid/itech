import Link from "next/link";
import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Servicios — iTech Import Perú",
  description: "Venta de tecnología, servicio técnico, soporte para empresas y cotizaciones a medida.",
};

const SERVICES = [
  {
    icon: "🛒",
    title: "Venta de tecnología",
    desc: "Laptops, componentes, periféricos y repuestos originales con garantía y envío a todo el Perú.",
    href: "/shop",
    cta: "Ver tienda",
  },
  {
    icon: "🔧",
    title: "Servicio técnico especializado",
    desc: "Diagnóstico, reparación y mantenimiento de equipos con seguimiento en línea y repuestos garantizados.",
    href: "/seguimiento",
    cta: "Seguir mi reparación",
  },
  {
    icon: "🏢",
    title: "Soporte gestionado para empresas",
    desc: "Somos el departamento de soporte de tu empresa: SLA, mantenimiento predictivo de flota y helpdesk con IA.",
    href: "/b2b",
    cta: "Conocer planes",
  },
  {
    icon: "🧾",
    title: "Cotizaciones a medida",
    desc: "Armamos tu equipo o proyecto con la mejor relación precio-rendimiento. Cotización con branding en minutos.",
    href: "/asistente",
    cta: "Pedir cotización",
  },
  {
    icon: "🤖",
    title: "Asistente de compra con IA",
    desc: "Te ayudamos a elegir el producto correcto según tu uso y presupuesto, 24/7.",
    href: "/asistente",
    cta: "Probar asistente",
  },
  {
    icon: "🛡️",
    title: "Garantía y postventa",
    desc: "Acompañamiento real después de la compra: garantías, RMA y soporte cuando lo necesites.",
    href: "/envios-y-garantia",
    cta: "Ver garantía",
  },
];

const STEPS = [
  { n: "1", t: "Cuéntanos qué necesitas", d: "Por la web, WhatsApp o el asistente IA." },
  { n: "2", t: "Recibe diagnóstico o propuesta", d: "Con precios claros y tiempos definidos." },
  { n: "3", t: "Aprobamos y ejecutamos", d: "Con seguimiento en línea de cada etapa." },
  { n: "4", t: "Entrega y postventa", d: "Garantía real y soporte continuo." },
];

export default function ServiciosPage() {
  return (
    <PageShell
      eyebrow="Servicios"
      title="Todo lo que tu tecnología necesita, en un solo lugar"
      subtitle="Desde la compra del equipo correcto hasta el soporte que mantiene tu operación funcionando."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <div key={s.title} className="flex flex-col rounded-2xl border border-surface-border/70 bg-white p-6 transition hover:-translate-y-1 hover:shadow-soft">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">{s.icon}</div>
            <h3 className="text-lg font-bold text-ink">{s.title}</h3>
            <p className="mt-2 flex-1 text-sm text-ink-soft">{s.desc}</p>
            <Link href={s.href} className="mt-4 inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              {s.cta} →
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-14">
        <h2 className="text-2xl font-bold text-ink">¿Cómo trabajamos?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-surface-border/70 bg-white p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">{s.n}</span>
              <h3 className="mt-3 font-semibold text-ink">{s.t}</h3>
              <p className="mt-1 text-sm text-ink-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 overflow-hidden rounded-3xl bg-brand-gradient p-8 text-center sm:p-12">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">¿Hablamos de tu proyecto?</h2>
        <p className="mx-auto mt-2 max-w-xl text-white/85">Cuéntanos qué necesitas y te respondemos con una propuesta clara.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/contacto" className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-600 transition hover:bg-brand-50">Contáctanos</Link>
          <Link href="/b2b" className="rounded-xl border border-white/60 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">Soluciones para empresas</Link>
        </div>
      </div>
    </PageShell>
  );
}
