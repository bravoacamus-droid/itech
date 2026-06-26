"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function replySupport(ticketId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  const { error } = await supabase.rpc("add_support_message" as never, {
    p_ticket: ticketId,
    p_body: body,
  } as never);
  if (error) throw new Error(error.message);
  revalidatePath(`/soporte/${ticketId}`);
}

export async function changeSupportStatus(ticketId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const status = String(formData.get("status") ?? "");
  const assigned = String(formData.get("assigned_to") ?? "").trim();
  const { error } = await supabase.rpc("set_support_status" as never, {
    p_ticket: ticketId,
    p_status: status,
    p_assigned: assigned,
  } as never);
  if (error) throw new Error(error.message);
  revalidatePath(`/soporte/${ticketId}`);
}
