import { createClient } from "@/lib/supabase/server";

export type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  payment_method: string;
  status: string;
  total: number;
  currency: string;
  created_at: string;
};

export type OrderItemRow = {
  id: string;
  name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type OrderDetail = OrderRow & {
  address: string | null;
  subtotal: number;
  items: OrderItemRow[];
};

export const ORDER_STATUSES = [
  "pendiente",
  "pagado",
  "enviado",
  "entregado",
  "anulado",
] as const;

export async function getOrder(id: string): Promise<OrderDetail | null> {
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle<OrderDetail>();
  if (!order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("id, name, unit_price, quantity, line_total")
    .eq("order_id", id)
    .returns<OrderItemRow[]>();

  return { ...order, items: items ?? [] };
}

export async function listOrders(): Promise<OrderRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, customer_email, payment_method, status, total, currency, created_at",
    )
    .order("created_at", { ascending: false })
    .returns<OrderRow[]>();
  return data ?? [];
}

export function formatPrice(value: number, currency = "PEN"): string {
  const symbol = currency === "PEN" ? "S/" : currency + " ";
  return `${symbol} ${value.toFixed(2)}`;
}
