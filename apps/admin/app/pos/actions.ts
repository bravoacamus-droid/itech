"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function openCash(formData: FormData) {
  const { supabase } = await requireAdmin();
  const opening = parseFloat(String(formData.get("opening") ?? "0")) || 0;
  const branch = String(formData.get("branch_id") ?? "").trim() || null;
  const { error } = await supabase.rpc("open_cash_session" as never, {
    p_opening: opening,
    p_branch: branch,
  } as never);
  if (error) throw new Error(error.message);
  revalidatePath("/pos");
}

export async function closeCash(sessionId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const counted = parseFloat(String(formData.get("counted") ?? "0")) || 0;
  const note = String(formData.get("note") ?? "").trim();
  const { error } = await supabase.rpc("close_cash_session" as never, {
    p_session: sessionId,
    p_counted: counted,
    p_note: note,
  } as never);
  if (error) throw new Error(error.message);
  revalidatePath("/pos");
}
