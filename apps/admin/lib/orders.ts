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
