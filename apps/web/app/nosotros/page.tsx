import Link from "next/link";
import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Nosotros — iTech Import Perú",
  description: "Conoce iTech Import Perú: tecnología, servicio técnico y soporte gestionado para empresas.",
};

const STATS = [
  { v: "+10", l: "años en el rubro" },
  { v: "+5 000", l: "equipos atendidos" },
  { v: "24/7", l: "soporte con IA" },
  { v: "100%", l: "garantía real" },
];

const VALUES = [
  { icon: "🤝", t: "Cercanía", d: "Te hablamos claro y te acompañamos antes, durante y después de la compra." },
  { icon: "⚡", t: "Rapidez", d: "Diagnósticos y respuestas ágiles; tu tiempo y tu operación importan." },
  { icon: "🛡️", t: "Confianza", d: "Productos originales, garantía real y precios transparentes." },
  { icon: "📈", t: "Mejora continua", d: "Procesos y tecnología propia para darte un mejor servicio cada día." },
];

export default function NosotrosPage() {
  return (
    <PageShell
      eyebrow="Nosotros"
      title="Tecnología con respaldo humano"
      subtitle="En iTech combinamos venta de tecnología, servicio técnico especializado y soporte gestionado para empresas."
    >
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-2xl font-bold text-ink">Quiénes somos</h2>
          <p className="mt-4 text-ink-soft">
            iTech Import Perú nació para resolver un problema real: comprar
            tecnología y conseguir un buen servicio técnico no debería ser
            complicado. Importamos y vendemos equipos, componentes y repuestos
            originales, y mantenemos un taller propio para reparaciones con
            seguimiento en línea.
          </p>
          <p className="mt-4 text-ink-soft">
            Hoy también somos el área de soporte de muchas empresas: gestionamos
            su flota de equipos con SLA, mantenimiento predictivo y una mesa de
            ayuda asistida por inteligencia artificial.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/shop" className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">Ver tienda</Link>
            <Link href="/contacto" className="rounded-xl border border-brand-200 px-5 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50">Contáctanos</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {STATS.map((s) => (
            <div key={s.l} className="rounded-2xl border border-surface-border/70 bg-white p-6 text-center">
              <p className="text-3xl font-extrabold text-brand-600">{s.v}</p>
              <p className="mt-1 text-sm text-ink-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-2xl font-bold text-ink">Nuestros valores</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.t} className="rounded-2xl border border-surface-border/70 bg-white p-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl">{v.icon}</div>
              <h3 className="font-semibold text-ink">{v.t}</h3>
              <p className="mt-1 text-sm text-ink-soft">{v.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 grid gap-6 rounded-3xl border border-surface-border/70 bg-surface-subtle p-8 sm:grid-cols-2 sm:p-10">
        <div>
          <h3 className="text-xl font-bold text-ink">Misión</h3>
          <p className="mt-2 text-ink-soft">Acercar la mejor tecnología y un servicio técnico confiable a personas y empresas del Perú, con honestidad y cercanía.</p>
        </div>
        <div>
          <h3 className="text-xl font-bold text-ink">Visión</h3>
          <p className="mt-2 text-ink-soft">Ser el aliado tecnológico de referencia: la tienda y el soporte en el que la gente confía sus equipos sin pensarlo dos veces.</p>
        </div>
      </div>
    </PageShell>
  );
}
