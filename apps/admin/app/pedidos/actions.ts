"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/orders";

export async function updateOrderStatus(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const status = String(formData.get("status") ?? "");
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
    throw new Error("Estado inválido");
  }
  const { error } = await supabase
    .from("orders")
    .update({ status } as never)
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/pedidos/${id}`);
  revalidatePath("/pedidos");
}
