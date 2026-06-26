import Link from "next/link";
import { Logo } from "@itech/ui";
import { CartButton } from "./cart-button";

const NAV = [
  { label: "Inicio", href: "/" },
  { label: "Tienda", href: "/shop" },
  { label: "Categorías", href: "/shop" },
  { label: "Servicios", href: "/servicios" },
  { label: "Soporte Empresas", href: "/b2b" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-surface-border/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Logo height={34} />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-brand-50 hover:text-brand-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/contacto"
            className="hidden rounded-xl border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 sm:inline-flex"
          >
            Cotizar
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
