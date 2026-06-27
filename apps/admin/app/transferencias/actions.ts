"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";

export async function createTransfer(formData: FormData) {
  const { supabase } = await requireStaff();
  const product = String(formData.get("product_id") ?? "");
  const from = String(formData.get("from_branch") ?? "");
  const to = String(formData.get("to_branch") ?? "");
  const qty = parseInt(String(formData.get("quantity") ?? "0"), 10);
  const note = String(formData.get("note") ?? "").trim();

  if (!product || !from || !to) throw new Error("Completa producto y sucursales");
  if (from === to) throw new Error("Origen y destino deben ser distintos");
  if (!qty || qty <= 0) throw new Error("La cantidad debe ser mayor a 0");

  const { error } = await supabase.rpc("transfer_stock" as never, {
    p_product: product,
    p_from: from,
    p_to: to,
    p_qty: qty,
    p_note: note || null,
  } as never);
  if (error) throw new Error(error.message);
  revalidatePath("/transferencias");
  revalidatePath("/inventario");
}
