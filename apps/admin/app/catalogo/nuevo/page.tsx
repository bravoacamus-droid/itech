import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listCategories } from "@/lib/catalog";
import { AdminHeader } from "@/components/admin-header";
import { ProductForm } from "@/components/product-form";
import { createProduct } from "@/app/catalogo/actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const { user } = await requireAdmin();
  const categories = await listCategories();

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/catalogo" className="hover:text-brand-600">
            Catálogo
          </Link>{" "}
          / <span className="text-ink">Nuevo producto</span>
        </nav>
        <h1 className="mt-2 mb-6 text-2xl font-bold text-ink">
          Nuevo producto
        </h1>
        <ProductForm categories={categories} action={createProduct} />
      </main>
    </div>
  );
}
