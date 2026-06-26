import Link from "next/link";
import { Logo } from "@itech/ui";
import { CartButton } from "./cart-button";
import { SearchBar } from "./search-bar";
import { MobileMenu } from "./mobile-menu";
import { createClient } from "@/lib/supabase/server";

const NAV = [
  { label: "Inicio", href: "/" },
  { label: "Tienda", href: "/shop" },
  { label: "Servicios", href: "/servicios" },
  { label: "Soporte Empresas", href: "/b2b" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
];

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border/70 bg-white/95 backdrop-blur">
      {/* Fila principal */}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center">
          <Logo height={32} />
        </Link>

        {/* Buscador (oculto en móvil, va en el menú) */}
        <SearchBar className="hidden flex-1 sm:block lg:max-w-xl" />

        <div className="ml-auto flex items-center gap-2">
          <Link
            href={isLoggedIn ? "/cuenta" : "/cuenta/ingresar"}
            className="hidden rounded-xl border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 lg:inline-flex"
          >
            {isLoggedIn ? "Mi cuenta" : "Ingresar"}
          </Link>
          <CartButton />
          <MobileMenu nav={NAV} isLoggedIn={isLoggedIn} />
        </div>
      </div>

      {/* Navegación (solo desktop) */}
      <nav className="hidden border-t border-surface-border/60 lg:block">
        <div className="mx-auto flex h-11 max-w-7xl items-center gap-1 px-4 sm:px-6 lg:px-8">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:bg-brand-50 hover:text-brand-600"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
