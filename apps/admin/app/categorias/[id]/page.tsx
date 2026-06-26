import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCategory } from "@/lib/catalog";
import { AdminHeader } from "@/components/admin-header";
import { CategoryForm } from "@/components/category-form";
import { updateCategory } from "@/app/categorias/actions";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireAdmin();
  const { id } = await params;
  const category = await getCategory(id);
  if (!category) notFound();

  const action = updateCategory.bind(null, id);

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/categorias" className="hover:text-brand-600">
            Categorías
          </Link>{" "}
          / <span className="text-ink">{category.name}</span>
        </nav>
        <h1 className="mt-2 mb-6 text-2xl font-bold text-ink">Editar categoría</h1>
        <CategoryForm action={action} category={category} />
      </main>
    </div>
  );
}
