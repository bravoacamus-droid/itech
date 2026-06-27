import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getOrder } from "@/lib/orders";
import { getReturnableItems } from "@/lib/returns";
import { AdminHeader } from "@/components/admin-header";
import { ReturnForm } from "@/components/return-form";

export const dynamic = "force-dynamic";

export default async function ReturnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireAdmin();
  const { id } = await params;
  const [order, items] = await Promise.all([getOrder(id), getReturnableItems(id)]);
  if (!order) notFound();

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/pedidos" className="hover:text-brand-600">Pedidos</Link> /{" "}
          <Link href={`/pedidos/${id}`} className="hover:text-brand-600">{order.order_number}</Link> /{" "}
          <span className="text-ink">Devolución</span>
        </nav>
        <h1 className="mt-2 mb-6 text-2xl font-bold text-ink">Devolución parcial</h1>
        <ReturnForm orderId={id} items={items} />
      </main>
    </div>
  );
}
