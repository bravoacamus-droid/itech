"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyUser } from "@/lib/push/notify";

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

export async function receiveTransfer(id: string) {
  const { supabase, user } = await requireStaff();
  const { error } = await supabase.rpc("receive_transfer" as never, { p_id: id } as never);
  if (error) throw new Error(error.message);

  // Avisar al creador del envío que ya fue recibido (admin client → Bug #1).
  const admin = createAdminClient();
  const { data } = await admin
    .from("stock_transfers")
    .select("transfer_number, created_by, to_branch")
    .eq("id", id)
    .single();
  const t = data as unknown as { transfer_number: string; created_by: string | null; to_branch: string } | null;
  if (t?.created_by && t.created_by !== user.id) {
    const { data: br } = await admin.from("branches").select("name").eq("id", t.to_branch).single();
    const branchName = (br as { name: string } | null)?.name ?? "destino";
    await notifyUser(
      t.created_by,
      {
        title: "Transferencia recibida",
        body: `${t.transfer_number} fue recibida en ${branchName}.`,
        url: "/transferencias",
        tag: `transfer-${id}`,
      },
      "transfer-recibida",
    );
  }

  revalidatePath("/transferencias");
  revalidatePath("/inventario");
}

export async function cancelTransfer(id: string) {
  const { supabase } = await requireStaff();
  const { error } = await supabase.rpc("cancel_transfer" as never, { p_id: id } as never);
  if (error) throw new Error(error.message);
  revalidatePath("/transferencias");
  revalidatePath("/inventario");
}
