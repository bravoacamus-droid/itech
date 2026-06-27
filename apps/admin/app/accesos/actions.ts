"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function assignStaff(formData: FormData) {
  const { supabase } = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const branches = formData.getAll("branches").map((b) => String(b));
  if (!email || !role) throw new Error("Correo y rol son obligatorios");

  const { error } = await supabase.rpc("assign_staff" as never, {
    p_email: email,
    p_role: role,
    p_branches: branches,
  } as never);
  if (error) throw new Error(error.message);
  revalidatePath("/accesos");
}
