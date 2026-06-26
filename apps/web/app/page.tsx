import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { getCategories, getFeaturedProducts } from "@/lib/catalog";

const FEATURES = [
  { title: "Envío a todo el Perú", desc: "Despachos rápidos y seguros" },
  { title: "Garantía real", desc: "Respaldo en cada producto" },
  { title: "Servicio técnico", desc: "Reparación especializada" },
  { title: "Pago fácil", desc: "Yape, Plin, tarjeta y más" },
];

const PARTNERS = [
  "/images/partner-granotec.webp",
  "/images/partner-02.png",
  "/images/partner-03.png",
  "/images/partner-04.png",
  "/images/partner-05.png",
  "/images/partner-06.png",
];

export const revalidate = 60;

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getFeaturedProducts(6),
  ]);

  return (
    <>
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="bg-surface-subtle">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-3 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl shadow-card lg:col-span-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/banner-1.jpg" alt="Lenovo IdeaPad 5" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex flex-col justify-center gap-4 bg-gradient-to-r from-brand-900/70 via-brand-700/30 to-transparent p-8 sm:p-12">
                <span className="w-fit rounded-full bg-celeste/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-900">
                  Nueva generación
                </span>
                <h1 className="max-w-md text-3xl font-extrabold leading-tight text-white sm:text-5xl">
                  Lenovo IdeaPad 5 <span className="text-celeste">2en1</span>
                </h1>
                <p className="max-w-sm text-sm text-white/85 sm:text-base">
                  9na Gen · 14&quot; AMD. Potencia y portabilidad para tu día a día.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/shop" className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50">
                    Comprar ahora
                  </Link>
                  <Link href="/shop" className="rounded-xl border border-white/60 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                    Ver catálogo
                  </Link>
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              {[
                { img: "/images/banner-2.jpg", t: "Teclado Gamer" },
                { img: "/images/banner-3.jpg", t: "Fuente de Poder" },
                { img: "/images/banner-4.jpg", t: "Disco SSD" },
              ].map((b) => (
                <Link key={b.t} href="/shop" className="group relative overflow-hidden rounded-2xl shadow-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.img} alt={b.t} className="h-32 w-full object-cover transition group-hover:scale-105" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-surface-border/70 bg-white p-5">
                <div className="mb-2 h-9 w-9 rounded-xl bg-brand-gradient" />
                <h3 className="text-sm font-semibold text-ink">{f.title}</h3>
                <p className="text-xs text-ink-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORÍAS */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-ink">Categorías</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((c) => (
              <Link key={c.id} href={`/categoria/${c.slug}`} className="group rounded-2xl border border-surface-border/70 bg-white p-4 text-center transition hover:-translate-y-1 hover:shadow-soft">
                <div className="mx-auto mb-3 flex h-24 items-center justify-center">
                  {c.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image_url} alt={c.name} className="max-h-24 w-auto object-contain" />
                  )}
                </div>
                <span className="text-sm font-semibold text-brand-600">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* PRODUCTOS DESTACADOS */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-ink">Productos destacados</h2>
            <Link href="/shop" className="text-sm font-semibold text-brand-600 hover:text-brand-700">Ver todo →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* TECNOLOGÍA / SOPORTE */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex items-center gap-6 rounded-2xl border border-surface-border/70 bg-white p-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-brand-600">Tecnología, Laptops y Repuestos</h3>
                <p className="mt-2 text-sm text-ink-soft">Equipos potentes y piezas originales para que tu computadora nunca te falle.</p>
                <Link href="/shop" className="mt-4 inline-flex rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">Descúbrelo</Link>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/tech-laptops.jpg" alt="Laptops" className="h-32 w-40 rounded-xl object-cover" />
            </div>
            <div className="flex items-center gap-6 rounded-2xl border border-surface-border/70 bg-white p-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-brand-600">Soporte, aliados de tu negocio</h3>
                <p className="mt-2 text-sm text-ink-soft">Mantenemos tus sistemas funcionando, dándote la tranquilidad que tu empresa merece.</p>
                <Link href="/b2b" className="mt-4 inline-flex rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">Conocer más</Link>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/soporte-pos.jpg" alt="Soporte" className="h-32 w-40 rounded-xl object-cover" />
            </div>
          </div>
        </section>

        {/* B2B */}
        <section className="bg-brand-gradient">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">Para empresas</span>
              <h2 className="mt-4 text-3xl font-extrabold text-white">Reparaciones gestionadas + Helpdesk empresarial</h2>
              <p className="mt-3 max-w-md text-white/85">
                Somos el departamento de soporte y reparaciones de tu empresa: SLA garantizado, mantenimiento predictivo de flota y mesa de ayuda con IA.
              </p>
              <Link href="/b2b" className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-600 transition hover:bg-brand-50">
                Agenda un diagnóstico
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { t: "SLA garantizado", d: "Tiempos de respuesta medidos" },
                { t: "Flota predictiva", d: "Anticipamos las fallas" },
                { t: "Helpdesk con IA", d: "Atención 24/7 asistida" },
                { t: "Portal de empresa", d: "Tickets, activos y reportes" },
              ].map((c) => (
                <div key={c.t} className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                  <h4 className="font-bold text-white">{c.t}</h4>
                  <p className="text-sm text-white/80">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PARTNERS */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-lg font-semibold text-ink-soft">Nuestros aliados</h2>
          <div className="grid grid-cols-3 items-center justify-items-center gap-8 sm:grid-cols-6">
            {PARTNERS.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="Aliado" className="h-10 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
