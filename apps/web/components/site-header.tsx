import Link from "next/link";
import { Logo } from "@itech/ui";
import { CartButton } from "./cart-button";
import { SearchBar } from "./search-bar";
import { MobileMenu } from "./mobile-menu";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/catalog";

const NAV = [
  { label: "Inicio", href: "/" },
  { label: "Tienda", href: "/shop", mega: true },
  { label: "Asistente IA", href: "/asistente" },
  { label: "Servicios", href: "/servicios" },
  { label: "Soporte Empresas", href: "/b2b" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
];

export async function SiteHeader() {
  const supabase = await createClient();
  const [{ data: { user } }, categories] = await Promise.all([
    supabase.auth.getUser(),
    getCategories(),
  ]);
  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {/* Barra superior de marca */}
      <div className="bg-brand-gradient text-white">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 text-xs sm:px-6 lg:px-8">
          <p className="hidden font-medium sm:block">
            🚚 Envíos a todo el Perú · Garantía real · Servicio técnico especializado
          </p>
          <p className="font-medium sm:hidden">iTech Import Perú</p>
          <div className="flex items-center gap-4">
            <Link href="/seguimiento" className="font-medium transition hover:text-white/80">
              Seguir reparación
            </Link>
            <Link href="/contacto" className="hidden font-medium transition hover:text-white/80 sm:inline">
              Contacto
            </Link>
          </div>
        </div>
      </div>

      {/* Fila principal */}
      <div className="border-b border-surface-border/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center">
            <Logo height={32} />
          </Link>

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
      </div>

      {/* Navegación (solo desktop) */}
      <nav className="hidden border-b border-surface-border/60 bg-white lg:block">
        <div className="mx-auto flex h-12 max-w-7xl items-center gap-1 px-4 sm:px-6 lg:px-8">
          {NAV.map((item) =>
            item.mega ? (
              <div key={item.label} className="group/mega relative">
                <Link
                  href={item.href}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-brand-50 hover:text-brand-600"
                >
                  {item.label}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-60">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </Link>
                {/* Megamenú */}
                <div className="invisible absolute left-0 top-full z-50 w-[640px] translate-y-1 pt-2 opacity-0 transition-all duration-150 group-hover/mega:visible group-hover/mega:translate-y-0 group-hover/mega:opacity-100">
                  <div className="rounded-2xl border border-surface-border/70 bg-white p-5 shadow-soft">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                        Categorías
                      </span>
                      <Link href="/shop" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                        Ver toda la tienda →
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {categories.slice(0, 9).map((c) => (
                        <Link
                          key={c.id}
                          href={`/categoria/${c.slug}`}
                          className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-brand-50"
                        >
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-surface-border/60 bg-white">
                            {c.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={c.image_url} alt={c.name} className="max-h-9 w-auto object-contain" />
                            ) : (
                              <span className="text-base">🖥️</span>
                            )}
                          </span>
                          <span className="text-sm font-medium text-ink">{c.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-brand-50 hover:text-brand-600"
              >
                {item.label}
              </Link>
            ),
          )}
        </div>
      </nav>
    </header>
  );
}
