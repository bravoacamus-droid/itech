"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

function parse(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    ruc: String(formData.get("ruc") ?? "").trim() || null,
    contact_name: String(formData.get("contact_name") ?? "").trim() || null,
    contact_phone: String(formData.get("contact_phone") ?? "").trim() || null,
    contact_email: String(formData.get("contact_email") ?? "").trim() || null,
    plan: String(formData.get("plan") ?? "esencial").trim(),
    is_active: formData.get("is_active") === "on",
  };
}

export async function createCompany(formData: FormData) {
  const { supabase } = await requireAdmin();
  const values = parse(formData);
  if (!values.name) throw new Error("El nombre es obligatorio");
  const { data, error } = await supabase
    .from("companies")
    .insert(values as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/empresas");
  redirect(`/empresas/${(data as { id: string }).id}`);
}

export async function updateCompany(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const values = parse(formData);
  if (!values.name) throw new Error("El nombre es obligatorio");
  const { error } = await supabase.from("companies").update(values as never).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/empresas/${id}`);
}

export async function assignMember(companyId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "b2b_member").trim();
  const { error } = await supabase.rpc("assign_company_member" as never, {
    p_email: email,
    p_company: companyId,
    p_role: role,
  } as never);
  if (error) throw new Error(error.message);
  revalidatePath(`/empresas/${companyId}`);
}
