import Link from "next/link";
import { Logo } from "@itech/ui";

const COLS = [
  {
    title: "Empresa",
    links: [
      { label: "Sobre nosotros", href: "/nosotros" },
      { label: "Servicios", href: "/servicios" },
      { label: "Soporte para empresas", href: "/b2b" },
      { label: "Contacto y ubicación", href: "/contacto" },
    ],
  },
  {
    title: "Tienda",
    links: [
      { label: "Catálogo completo", href: "/shop" },
      { label: "Asistente de compra IA", href: "/asistente" },
      { label: "Métodos de pago", href: "/metodo-pago" },
      { label: "Envíos y garantía", href: "/envios-y-garantia" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { label: "Seguimiento de reparación", href: "/seguimiento" },
      { label: "Portal de empresas", href: "/portal" },
      { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
      { label: "Libro de reclamaciones", href: "/libro-reclamaciones" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-surface-border/70 bg-ink text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="rounded-xl bg-white p-2 w-fit">
            <Logo height={34} />
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/70">
            Tecnología, repuestos y servicio técnico especializado. Soporte
            gestionado para empresas en todo el Perú.
          </p>
          <div className="mt-4 space-y-1 text-sm text-white/70">
            <p>📍 Lima, Perú</p>
            <p>✉️ ventas@itech.pe</p>
          </div>
        </div>
        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-bold uppercase tracking-wide text-white">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/70 transition hover:text-celeste"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-white/60 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} iTech Import Perú. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
