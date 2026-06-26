import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

type MyOrder = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  currency: string;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  enviado: "Enviado",
  entregado: "Entregado",
  anulado: "Anulado",
};

export default async function MyOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/cuenta/ingresar?next=/cuenta/pedidos");

  const { data } = await supabase
    .from("orders")
    .select("id, order_number, status, total, currency, created_at")
    .order("created_at", { ascending: false })
    .returns<MyOrder[]>();
  const orders = data ?? [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/cuenta" className="hover:text-brand-600">
            Mi cuenta
          </Link>{" "}
          / <span className="text-ink">Mis pedidos</span>
        </nav>
        <h1 className="mt-2 mb-6 text-3xl font-bold text-ink">Mis pedidos</h1>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-border p-12 text-center">
            <p className="text-ink-soft">Todavía no tienes pedidos.</p>
            <Link
              href="/shop"
              className="mt-4 inline-flex rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-3 font-semibold">Pedido</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-surface-border/50 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/cuenta/pedidos/${o.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {new Date(o.created_at).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600">
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">
                      {formatPrice(o.total, o.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
