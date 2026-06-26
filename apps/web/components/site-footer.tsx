import Link from "next/link";
import { Logo } from "@itech/ui";

const COLS = [
  {
    title: "iTech Import Perú",
    links: [
      { label: "Sobre nosotros", href: "/nosotros" },
      { label: "Ubicación", href: "/contacto" },
      { label: "Métodos de pago", href: "/metodo-pago" },
      { label: "Envíos y garantía", href: "/envios-y-garantia" },
    ],
  },
  {
    title: "Tienda",
    links: [
      { label: "Laptops", href: "/shop" },
      { label: "Componentes", href: "/shop" },
      { label: "Repuestos", href: "/shop" },
      { label: "Periféricos", href: "/shop" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { label: "Seguimiento de reparación", href: "/mi-equipo" },
      { label: "Soporte para empresas", href: "/b2b" },
      { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
      { label: "Libro de reclamaciones", href: "/libro-reclamaciones" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-surface-border/70 bg-surface-subtle">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo height={36} />
          <p className="mt-4 max-w-xs text-sm text-ink-soft">
            Tecnología, repuestos y servicio técnico especializado. Soporte
            gestionado para empresas.
          </p>
        </div>
        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-ink">{col.title}</h4>
            <ul className="mt-4 space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink-soft transition hover:text-brand-600"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-surface-border/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-ink-muted sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} iTech Import Perú. Todos los derechos reservados.</p>
          <p>Hecho con Next.js · Supabase · Vercel</p>
        </div>
      </div>
    </footer>
  );
}
