import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AdminHeader } from "@/components/admin-header";
import { CategoryForm } from "@/components/category-form";
import { createCategory } from "@/app/categorias/actions";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const { user } = await requireAdmin();
  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/categorias" className="hover:text-brand-600">
            Categorías
          </Link>{" "}
          / <span className="text-ink">Nueva</span>
        </nav>
        <h1 className="mt-2 mb-6 text-2xl font-bold text-ink">Nueva categoría</h1>
        <CategoryForm action={createCategory} />
      </main>
    </div>
  );
}
