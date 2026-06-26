"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

const KEYS = [
  "whatsapp_number",
  "store_name",
  "contact_phone",
  "contact_email",
] as const;

export async function updateSettings(formData: FormData) {
  const { supabase } = await requireAdmin();

  const rows = KEYS.map((key) => ({
    key,
    value: String(formData.get(key) ?? "").trim(),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("settings")
    .upsert(rows as never, { onConflict: "key" });
  if (error) throw new Error(error.message);

  revalidatePath("/configuracion");
}
