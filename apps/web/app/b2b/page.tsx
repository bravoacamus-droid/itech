import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Soporte para empresas — iTech Import Perú",
  description: "El departamento de soporte y reparaciones de tu empresa: SLA, mantenimiento predictivo de flota y mesa de ayuda con IA.",
};

const SERVICES = [
  { icon: "🛠️", title: "Reparaciones gestionadas de flota", desc: "Mantenimiento y reparación de todo el parque de equipos, con SLA, repuestos, garantía y reportería." },
  { icon: "💬", title: "Helpdesk empresarial", desc: "Mesa de ayuda por WhatsApp, email y portal, con primera respuesta asistida por IA y escalamiento a técnico humano." },
  { icon: "📈", title: "Mantenimiento predictivo", desc: "Anticipamos fallas usando el historial de reparaciones y creamos tickets preventivos antes de que el equipo falle." },
  { icon: "🗂️", title: "Portal de activos + CIO virtual", desc: "Inventario de TI de tu empresa con un asistente que responde y cotiza con el branding de iTech." },
];

const STEPS = [
  { n: "1", t: "Diagnóstico", d: "Evaluamos tu parque de equipos y tus necesidades." },
  { n: "2", t: "Plan a medida", d: "Definimos SLA, cobertura y alcance del servicio." },
  { n: "3", t: "Onboarding", d: "Registramos tus activos en el portal de empresa." },
  { n: "4", t: "Operación continua", d: "Soporte, mantenimiento y reportes mes a mes." },
];

const STATS = [
  { v: "SLA", l: "tiempos de respuesta garantizados" },
  { v: "24/7", l: "mesa de ayuda asistida por IA" },
  { v: "100%", l: "trazabilidad de tickets y activos" },
];

const PLANS = [
  { name: "Esencial", desc: "Para equipos pequeños", price: "Mensual", features: ["Helpdesk por WhatsApp y email", "Reparaciones con repuestos", "Reportes básicos"], popular: false },
  { name: "Pro", desc: "Flota mediana + SLA", price: "Mensual + paquete", features: ["Todo lo de Esencial", "SLA garantizado", "Mantenimiento predictivo", "Portal de activos"], popular: true },
  { name: "Enterprise", desc: "Multi-sede + predictivo", price: "A medida", features: ["Todo lo de Pro", "Multi-sede", "CIO virtual", "Reportería avanzada"], popular: false },
];

export default function B2BPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-brand-gradient">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                Soporte para empresas
              </span>
              <h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-tight text-white">
                El departamento de soporte y reparaciones de tu empresa
              </h1>
              <p className="mt-4 max-w-lg text-white/85">
                Convierte el soporte de TI en un servicio recurrente, predictivo y
                gestionado. Reparaciones con SLA y mesa de ayuda con IA.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/contacto" className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-600 transition hover:bg-brand-50">
                  Agenda un diagnóstico
                </Link>
                <Link href="/portal" className="rounded-xl border border-white/60 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                  Portal de empresas
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/soporte-pos.jpg" alt="Soporte gestionado para empresas" className="aspect-[4/3] w-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="border-b border-surface-border/70 bg-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
            {STATS.map((s) => (
              <div key={s.l} className="text-center">
                <p className="text-2xl font-extrabold text-brand-600">{s.v}</p>
                <p className="mt-1 text-sm text-ink-soft">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* QUÉ INCLUYE */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-ink">Qué incluye</h2>
          <p className="mt-1 text-ink-soft">Todo el soporte de tu operación, gestionado por un solo aliado.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <div key={s.title} className="flex gap-4 rounded-2xl border border-surface-border/70 bg-white p-6 transition hover:shadow-card">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-2xl">{s.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="bg-surface-subtle">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-ink">Cómo funciona</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s) => (
                <div key={s.n} className="rounded-2xl border border-surface-border/70 bg-white p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">{s.n}</span>
                  <h3 className="mt-3 font-semibold text-ink">{s.t}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLANES */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-ink">Planes</h2>
          <p className="mt-1 text-center text-ink-soft">Elige el nivel de soporte que tu empresa necesita.</p>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 ${p.popular ? "border-brand-500 shadow-soft lg:-translate-y-2" : "border-surface-border/70"}`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white">
                    Más popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-brand-600">{p.name}</h3>
                <p className="mt-1 text-sm text-ink-soft">{p.desc}</p>
                <p className="mt-3 text-sm font-semibold text-ink">{p.price}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-ink-soft">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-success">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contacto"
                  className={`mt-6 rounded-xl py-2.5 text-center text-sm font-semibold transition ${p.popular ? "bg-brand-500 text-white hover:bg-brand-600" : "border border-brand-200 text-brand-600 hover:bg-brand-50"}`}
                >
                  Solicitar
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-brand-gradient p-8 text-center sm:p-12">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Convierte tu soporte de TI en una ventaja</h2>
            <p className="mx-auto mt-2 max-w-xl text-white/85">Agenda un diagnóstico sin costo y te mostramos cómo gestionar tu flota.</p>
            <Link href="/contacto" className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-600 transition hover:bg-brand-50">
              Agenda un diagnóstico
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
