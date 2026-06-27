import { createClient } from "@/lib/supabase/server";

export type ReturnableItem = {
  order_item_id: string;
  name: string;
  unit_price: number;
  purchased: number;
  returned: number;
  available: number;
};

export type OrderReturn = {
  id: string;
  return_number: string;
  reason: string | null;
  total_refund: number;
  created_at: string;
};

export async function getReturnableItems(orderId: string): Promise<ReturnableItem[]> {
  const supabase = await createClient();
  const { data: itemsData } = await supabase
    .from("order_items")
    .select("id, name, unit_price, quantity")
    .eq("order_id", orderId);
  const items = (itemsData ?? []) as {
    id: string;
    name: string;
    unit_price: number;
    quantity: number;
  }[];
  if (items.length === 0) return [];

  const { data: retData } = await supabase
    .from("return_items")
    .select("order_item_id, quantity")
    .in(
      "order_item_id",
      items.map((i) => i.id),
    );
  const returnedMap: Record<string, number> = {};
  ((retData ?? []) as { order_item_id: string; quantity: number }[]).forEach((r) => {
    returnedMap[r.order_item_id] = (returnedMap[r.order_item_id] ?? 0) + r.quantity;
  });

  return items.map((i) => {
    const returned = returnedMap[i.id] ?? 0;
    return {
      order_item_id: i.id,
      name: i.name,
      unit_price: Number(i.unit_price),
      purchased: i.quantity,
      returned,
      available: i.quantity - returned,
    };
  });
}

export async function getOrderReturns(orderId: string): Promise<OrderReturn[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("returns")
    .select("id, return_number, reason, total_refund, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .returns<OrderReturn[]>();
  return data ?? [];
}
