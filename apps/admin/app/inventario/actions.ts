"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function adjustStock(productId: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  const type = String(formData.get("type") ?? "entrada"); // entrada | salida | ajuste
  const qtyRaw = Math.abs(parseInt(String(formData.get("quantity") ?? "0"), 10));
  const qty = Number.isFinite(qtyRaw) ? qtyRaw : 0;
  if (qty <= 0) throw new Error("Cantidad inválida");

  const note = String(formData.get("note") ?? "").trim();
  const delta = type === "salida" ? -qty : qty;
  const reason = type === "ajuste" ? "ajuste" : type;
  const branch = String(formData.get("branch_id") ?? "").trim() || null;

  const { error } = await supabase.rpc("adjust_stock" as never, {
    p_product_id: productId,
    p_delta: delta,
    p_reason: reason,
    p_note: note,
    p_branch: branch,
  } as never);
  if (error) throw new Error(error.message);

  revalidatePath(`/inventario/${productId}`);
  revalidatePath("/inventario");
}
