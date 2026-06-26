import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const CATEGORIES = [
  { name: "Laptops", img: "/images/cat-laptops.jpg" },
  { name: "Impresoras", img: "/images/cat-impresoras.jpg" },
  { name: "Monitores", img: "/images/cat-monitores.webp" },
  { name: "Placa madre", img: "/images/cat-placa.png" },
  { name: "Fuente de poder", img: "/images/cat-fuente.png" },
  { name: "Disco duro", img: "/images/cat-disco.png" },
];

const PRODUCTS = [
  { name: "Placa ASUS TUF Gaming B850-PLUS WiFi", price: "S/ 899.00", img: "/images/cat-placa.png", tag: "Nuevo" },
  { name: "Fuente de Poder 450W 80 Plus Bronze", price: "S/ 145.00", img: "/images/cat-fuente.png" },
  { name: "Disco Sólido SSD HP S650 240GB", price: "S/ 95.00", img: "/images/cat-disco.png", tag: "Oferta" },
  { name: 'Monitor Samsung 24" FHD', price: "S/ 449.00", img: "/images/cat-monitores.webp" },
  { name: "Impresora Multifuncional", price: "S/ 320.00", img: "/images/cat-impresoras.jpg" },
  { name: "Laptop Lenovo IdeaPad 5", price: "S/ 2,499.00", img: "/images/cat-laptops.jpg", tag: "Destacado" },
];

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

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="bg-surface-subtle">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-3 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl shadow-card lg:col-span-2">
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
            {CATEGORIES.map((c) => (
              <Link key={c.name} href="/shop" className="group rounded-2xl border border-surface-border/70 bg-white p-4 text-center transition hover:-translate-y-1 hover:shadow-soft">
                <div className="mx-auto mb-3 flex h-24 items-center justify-center">
                  <img src={c.img} alt={c.name} className="max-h-24 w-auto object-contain" />
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
            {PRODUCTS.map((p) => (
              <div key={p.name} className="group flex flex-col overflow-hidden rounded-2xl border border-surface-border/70 bg-white transition hover:shadow-soft">
                <div className="relative flex h-40 items-center justify-center bg-surface-subtle p-4">
                  {p.tag && (
                    <span className="absolute left-2 top-2 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">{p.tag}</span>
                  )}
                  <img src={p.img} alt={p.name} className="max-h-32 w-auto object-contain transition group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="line-clamp-2 text-sm font-medium text-ink">{p.name}</h3>
                  <p className="mt-auto text-lg font-bold text-brand-600">{p.price}</p>
                  <button className="rounded-xl bg-brand-50 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-500 hover:text-white">
                    Agregar al carrito
                  </button>
                </div>
              </div>
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
              <img src="/images/tech-laptops.jpg" alt="Laptops" className="h-32 w-40 rounded-xl object-cover" />
            </div>
            <div className="flex items-center gap-6 rounded-2xl border border-surface-border/70 bg-white p-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-brand-600">Soporte, aliados de tu negocio</h3>
                <p className="mt-2 text-sm text-ink-soft">Mantenemos tus sistemas funcionando, dándote la tranquilidad que tu empresa merece.</p>
                <Link href="/b2b" className="mt-4 inline-flex rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">Conocer más</Link>
              </div>
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
              <img key={src} src={src} alt="Aliado" className="h-10 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
