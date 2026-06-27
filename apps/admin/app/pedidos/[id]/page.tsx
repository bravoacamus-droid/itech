import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getOrder, formatPrice, ORDER_STATUSES } from "@/lib/orders";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@itech/ui";
import { updateOrderStatus } from "@/app/pedidos/actions";
import { emitFromOrder } from "@/app/facturacion/actions";

export const dynamic = "force-dynamic";

const PAYMENT_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  yape: "Yape",
  plin: "Plin",
  transferencia: "Transferencia",
  contra_entrega: "Contra entrega",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireAdmin();
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const action = updateOrderStatus.bind(null, id);

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/pedidos" className="hover:text-brand-600">
            Pedidos
          </Link>{" "}
          / <span className="text-ink">{order.order_number}</span>
        </nav>
        <h1 className="mt-2 text-2xl font-bold text-ink">
          Pedido {order.order_number}
        </h1>
        <p className="text-sm text-ink-muted">
          {new Date(order.created_at).toLocaleString("es-PE")}
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Items */}
          <div className="overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 font-semibold">P. unit.</th>
                  <th className="px-4 py-3 font-semibold">Cant.</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr
                    key={it.id}
                    className="border-b border-surface-border/50 last:border-0"
                  >
                    <td className="px-4 py-3 text-ink">{it.name}</td>
                    <td className="px-4 py-3 text-ink-soft">
                      {formatPrice(it.unit_price, order.currency)}
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{it.quantity}</td>
                    <td className="px-4 py-3 text-right font-medium text-ink">
                      {formatPrice(it.line_total, order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-subtle">
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold text-ink">
                    Total
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-brand-600">
                    {formatPrice(order.total, order.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Cliente + estado */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-surface-border/70 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                Cliente
              </h2>
              <p className="font-medium text-ink">{order.customer_name}</p>
              <p className="text-sm text-ink-soft">{order.customer_phone}</p>
              {order.customer_email && (
                <p className="text-sm text-ink-soft">{order.customer_email}</p>
              )}
              {order.address && (
                <p className="mt-2 text-sm text-ink-soft">{order.address}</p>
              )}
              <p className="mt-2 text-sm text-ink-muted">
                Pago: {PAYMENT_LABEL[order.payment_method] ?? order.payment_method}
              </p>
            </div>

            <form
              action={action}
              className="rounded-2xl border border-surface-border/70 bg-white p-5"
            >
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                Estado del pedido
              </h2>
              <select
                name="status"
                defaultValue={order.status}
                className="w-full rounded-xl border border-surface-border px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <div className="mt-4">
                <Button type="submit" className="w-full">
                  Actualizar estado
                </Button>
              </div>
            </form>

            <div className="rounded-2xl border border-surface-border/70 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                Comprobante (SUNAT)
              </h2>
              <form action={emitFromOrder.bind(null, order.id)} className="space-y-2">
                <input type="hidden" name="doc_type" value="03" />
                <Button type="submit" variant="outline" className="w-full">
                  Emitir boleta
                </Button>
              </form>
              <form action={emitFromOrder.bind(null, order.id)} className="mt-3 space-y-2 border-t border-surface-border/70 pt-3">
                <input type="hidden" name="doc_type" value="01" />
                <input
                  name="customer_doc"
                  placeholder="RUC (11 dígitos)"
                  className="w-full rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                />
                <input
                  name="customer_name"
                  placeholder="Razón social"
                  className="w-full rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                />
                <Button type="submit" variant="outline" className="w-full">
                  Emitir factura
                </Button>
              </form>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
