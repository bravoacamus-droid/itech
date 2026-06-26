import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listProducts, formatPrice } from "@/lib/catalog";
import { AdminHeader } from "@/components/admin-header";
import { DeleteProductButton } from "@/components/delete-product-button";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const { user } = await requireAdmin();
  const products = await listProducts();

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Catálogo</h1>
            <p className="text-sm text-ink-soft">
              {products.length} productos
            </p>
          </div>
          <Link
            href="/catalogo/nuevo"
            className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600"
          >
            + Nuevo producto
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Precio</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-surface-border/50 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-surface-subtle">
                        {p.image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="max-h-10 w-auto object-contain"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-ink">{p.name}</div>
                        {p.brand && (
                          <div className="text-xs text-ink-muted">{p.brand}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {p.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">
                    {formatPrice(p.price, p.currency)}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{p.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.is_active
                            ? "bg-success/10 text-success"
                            : "bg-ink-muted/10 text-ink-muted"
                        }`}
                      >
                        {p.is_active ? "Activo" : "Inactivo"}
                      </span>
                      {p.is_featured && (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600">
                          Destacado
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/catalogo/${p.id}`}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50"
                      >
                        Editar
                      </Link>
                      <DeleteProductButton id={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-ink-muted">
                    No hay productos. Crea el primero.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
