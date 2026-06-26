"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

function parse(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slug =
    String(formData.get("slug") ?? "").trim() ||
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  const sortRaw = parseInt(String(formData.get("sort_order") ?? "0"), 10);

  return {
    name,
    slug,
    image_url: String(formData.get("image_url") ?? "").trim() || null,
    sort_order: Number.isFinite(sortRaw) ? sortRaw : 0,
    is_active: formData.get("is_active") === "on",
  };
}

export async function createCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const values = parse(formData);
  if (!values.name) throw new Error("El nombre es obligatorio");
  const { error } = await supabase
    .from("categories")
    .insert(values as never);
  if (error) throw new Error(error.message);
  revalidatePath("/categorias");
  redirect("/categorias");
}

export async function updateCategory(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const values = parse(formData);
  if (!values.name) throw new Error("El nombre es obligatorio");
  const { error } = await supabase
    .from("categories")
    .update(values as never)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/categorias");
  redirect("/categorias");
}

export async function deleteCategory(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/categorias");
}
