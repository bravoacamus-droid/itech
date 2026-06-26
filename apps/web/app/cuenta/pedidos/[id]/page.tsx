import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { getWhatsappNumber } from "@/lib/settings";

export const dynamic = "force-dynamic";

type Order = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  subtotal: number;
  currency: string;
  payment_method: string;
  address: string | null;
  customer_name: string;
  customer_phone: string;
  created_at: string;
};

type Item = {
  id: string;
  name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  enviado: "Enviado",
  entregado: "Entregado",
  anulado: "Anulado",
};

const PAYMENT_LABEL: Record<string, string> = {
  whatsapp: "Coordinar por WhatsApp",
  yape: "Yape",
  plin: "Plin",
  transferencia: "Transferencia bancaria",
  contra_entrega: "Pago contra entrega",
};

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/cuenta/ingresar?next=/cuenta/pedidos");

  const { id } = await params;

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, total, subtotal, currency, payment_method, address, customer_name, customer_phone, created_at",
    )
    .eq("id", id)
    .maybeSingle<Order>();
  if (!order) notFound();

  const { data: itemsData } = await supabase
    .from("order_items")
    .select("id, name, unit_price, quantity, line_total")
    .eq("order_id", id)
    .returns<Item[]>();
  const items = itemsData ?? [];

  const whatsapp = await getWhatsappNumber();
  const waMsg = encodeURIComponent(
    `Hola, consulto por mi pedido ${order.order_number}.`,
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/cuenta" className="hover:text-brand-600">
            Mi cuenta
          </Link>{" "}
          /{" "}
          <Link href="/cuenta/pedidos" className="hover:text-brand-600">
            Mis pedidos
          </Link>{" "}
          / <span className="text-ink">{order.order_number}</span>
        </nav>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-ink">{order.order_number}</h1>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-600">
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          {new Date(order.created_at).toLocaleString("es-PE")}
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
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
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-surface-border/50 last:border-0">
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

          <aside className="space-y-6">
            <div className="rounded-2xl border border-surface-border/70 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
                Datos
              </h2>
              <p className="text-sm text-ink">{order.customer_name}</p>
              <p className="text-sm text-ink-soft">{order.customer_phone}</p>
              {order.address && (
                <p className="mt-2 text-sm text-ink-soft">{order.address}</p>
              )}
              <p className="mt-2 text-sm text-ink-muted">
                Pago: {PAYMENT_LABEL[order.payment_method] ?? order.payment_method}
              </p>
            </div>

            <a
              href={`https://wa.me/${whatsapp}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl bg-success px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
            >
              Consultar por WhatsApp
            </a>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
