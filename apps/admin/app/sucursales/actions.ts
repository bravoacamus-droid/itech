"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function createBranch(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre es obligatorio");
  const values = {
    name,
    address: String(formData.get("address") ?? "").trim() || null,
    is_online: formData.get("is_online") === "on",
    is_active: true,
  };
  const { error } = await supabase.from("branches").insert(values as never);
  if (error) throw new Error(error.message);
  revalidatePath("/sucursales");
}

export async function updateBranch(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim() || null,
    is_online: formData.get("is_online") === "on",
    is_active: formData.get("is_active") === "on",
  };
  const { error } = await supabase.from("branches").update(values as never).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/sucursales");
}
