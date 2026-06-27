"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export async function convertQuote(quoteId: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.rpc("convert_quote_to_order" as never, {
    p_quote: quoteId,
  } as never);
  if (error) throw new Error(error.message);
  const row = (Array.isArray(data) ? data[0] : data) as { order_id?: string } | null;
  revalidatePath(`/cotizaciones/${quoteId}`);
  redirect(row?.order_id ? `/pedidos/${row.order_id}` : "/cotizaciones");
}

export async function setQuoteStatus(quoteId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const status = String(formData.get("status") ?? "");
  const allowed = ["borrador", "enviada", "aceptada", "rechazada", "vencida"];
  if (!allowed.includes(status)) throw new Error("Estado inválido");
  const { error } = await supabase.from("quotes").update({ status } as never).eq("id", quoteId);
  if (error) throw new Error(error.message);
  revalidatePath(`/cotizaciones/${quoteId}`);
}
