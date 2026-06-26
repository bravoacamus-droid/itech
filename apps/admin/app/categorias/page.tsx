import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listCategories } from "@/lib/catalog";
import { AdminHeader } from "@/components/admin-header";
import { DeleteCategoryButton } from "@/components/delete-category-button";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const { user } = await requireAdmin();
  const categories = await listCategories();

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ink">Categorías</h1>
            <p className="text-sm text-ink-soft">{categories.length} categorías</p>
          </div>
          <Link
            href="/categorias/nueva"
            className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600"
          >
            + Nueva categoría
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Orden</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-surface-border/50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-surface-subtle">
                        {c.image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.image_url} alt={c.name} className="max-h-10 w-auto object-contain" />
                        )}
                      </div>
                      <span className="font-medium text-ink">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{c.slug}</td>
                  <td className="px-4 py-3 text-ink-soft">{c.sort_order}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.is_active
                          ? "bg-success/10 text-success"
                          : "bg-ink-muted/10 text-ink-muted"
                      }`}
                    >
                      {c.is_active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/categorias/${c.id}`}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50"
                      >
                        Editar
                      </Link>
                      <DeleteCategoryButton id={c.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                    No hay categorías. Crea la primera.
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
