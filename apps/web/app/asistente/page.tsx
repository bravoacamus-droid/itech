import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShoppingAssistant } from "@/components/shopping-assistant";

export const metadata: Metadata = {
  title: "Asistente de compra con IA — iTech",
  description: "Dinos qué necesitas y te recomendamos los productos correctos de la tienda.",
};

const HOW = [
  { icon: "💬", t: "Cuéntanos qué buscas", d: "Describe tu uso y presupuesto en lenguaje natural." },
  { icon: "🧠", t: "La IA analiza el catálogo", d: "Compara productos reales de la tienda iTech." },
  { icon: "🛒", t: "Recibe recomendaciones", d: "Con enlaces directos para comprar al instante." },
];

export default function AsistentePage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-brand-gradient">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Asistente con IA
            </span>
            <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              ¿No sabes qué comprar? Te ayudamos a elegir
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-white/85">
              Cuéntanos tu necesidad y presupuesto; nuestra IA recomienda los
              productos correctos del catálogo de iTech.
            </p>
          </div>
        </section>

        {/* ASISTENTE */}
        <section className="mx-auto -mt-8 max-w-3xl px-4 sm:px-6 lg:px-8">
          <ShoppingAssistant />
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-ink">Cómo funciona</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {HOW.map((h) => (
              <div key={h.t} className="rounded-2xl border border-surface-border/70 bg-white p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">{h.icon}</div>
                <h3 className="font-semibold text-ink">{h.t}</h3>
                <p className="mt-1 text-sm text-ink-soft">{h.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
