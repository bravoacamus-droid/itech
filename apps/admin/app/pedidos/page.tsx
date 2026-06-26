import { requireAdmin } from "@/lib/auth";
import { listOrders, formatPrice } from "@/lib/orders";
import { AdminHeader } from "@/components/admin-header";

export const dynamic = "force-dynamic";

const PAYMENT_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  yape: "Yape",
  plin: "Plin",
  transferencia: "Transferencia",
  contra_entrega: "Contra entrega",
};

export default async function OrdersPage() {
  const { user } = await requireAdmin();
  const orders = await listOrders();

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">Pedidos</h1>
          <p className="text-sm text-ink-soft">{orders.length} pedidos</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-semibold">Pedido</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Contacto</th>
                <th className="px-4 py-3 font-semibold">Pago</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-surface-border/50 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-ink">{o.order_number}</div>
                    <div className="text-xs text-ink-muted">
                      {new Date(o.created_at).toLocaleString("es-PE")}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink">{o.customer_name}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    <div>{o.customer_phone}</div>
                    {o.customer_email && (
                      <div className="text-xs text-ink-muted">
                        {o.customer_email}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {PAYMENT_LABEL[o.payment_method] ?? o.payment_method}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-[#9a6a00]">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-ink">
                    {formatPrice(o.total, o.currency)}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-ink-muted">
                    Aún no hay pedidos.
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
