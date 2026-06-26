import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getProduct, listCategories } from "@/lib/catalog";
import { AdminHeader } from "@/components/admin-header";
import { ProductForm } from "@/components/product-form";
import { updateProduct } from "@/app/catalogo/actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireAdmin();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProduct(id),
    listCategories(),
  ]);

  if (!product) notFound();

  const action = updateProduct.bind(null, id);

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/catalogo" className="hover:text-brand-600">
            Catálogo
          </Link>{" "}
          / <span className="text-ink">{product.name}</span>
        </nav>
        <h1 className="mt-2 mb-6 text-2xl font-bold text-ink">
          Editar producto
        </h1>
        <ProductForm
          categories={categories}
          action={action}
          product={product}
        />
      </main>
    </div>
  );
}
