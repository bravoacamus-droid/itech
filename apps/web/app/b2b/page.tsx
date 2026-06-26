import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const SERVICES = [
  {
    title: "Reparaciones gestionadas de flota",
    desc: "Mantenimiento y reparación de todo el parque de equipos de tu empresa, con SLA, repuestos, garantía y reportería.",
  },
  {
    title: "Helpdesk empresarial",
    desc: "Mesa de ayuda por WhatsApp, email y portal, con primera respuesta asistida por IA y escalamiento a técnico humano.",
  },
  {
    title: "Mantenimiento predictivo",
    desc: "Anticipamos fallas usando el historial de reparaciones y creamos tickets preventivos antes de que el equipo falle.",
  },
  {
    title: "Portal de activos + CIO virtual",
    desc: "Inventario de TI de tu empresa con un asistente que responde y cotiza con el branding de iTech.",
  },
];

const PLANS = [
  { name: "Esencial", desc: "Para equipos pequeños", price: "Mensual" },
  { name: "Pro", desc: "Flota mediana + SLA", price: "Mensual + paquete" },
  { name: "Enterprise", desc: "Multi-sede + predictivo", price: "A medida" },
];

export default function B2BPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-brand-gradient">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Soporte para empresas
            </span>
            <h1 className="mt-4 max-w-2xl text-4xl font-extrabold text-white">
              El departamento de soporte y reparaciones de tu empresa
            </h1>
            <p className="mt-4 max-w-xl text-white/85">
              Convierte el soporte de TI en un servicio recurrente, predictivo y
              gestionado. Reparaciones con SLA y mesa de ayuda con IA.
            </p>
            <Link
              href="/contacto"
              className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-600 transition hover:bg-brand-50"
            >
              Agenda un diagnóstico
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-ink">Qué incluye</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <div key={s.title} className="rounded-2xl border border-surface-border/70 bg-white p-6">
                <div className="mb-3 h-10 w-10 rounded-xl bg-brand-gradient" />
                <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-ink">Planes</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {PLANS.map((p) => (
              <div key={p.name} className="rounded-2xl border border-surface-border/70 bg-white p-6 text-center">
                <h3 className="text-xl font-bold text-brand-600">{p.name}</h3>
                <p className="mt-1 text-sm text-ink-soft">{p.desc}</p>
                <p className="mt-4 text-sm font-semibold text-ink">{p.price}</p>
                <Link href="/contacto" className="mt-6 inline-flex rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
                  Solicitar
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
