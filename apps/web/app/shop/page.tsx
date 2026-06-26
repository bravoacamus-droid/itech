import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function ShopPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-ink">Tienda</h1>
        <p className="mt-2 max-w-xl text-ink-soft">
          El catálogo completo (productos, filtros, búsqueda y carrito) se conecta
          en la Fase 1. Aquí vivirá la grilla de productos servida desde Supabase.
        </p>
        <div className="mt-10 rounded-2xl border border-dashed border-surface-border p-10 text-center text-ink-muted">
          Catálogo en construcción — Fase 1
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
