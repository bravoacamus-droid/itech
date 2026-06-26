"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

function parseForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slug =
    String(formData.get("slug") ?? "").trim() ||
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const num = (v: FormDataEntryValue | null) => {
    const n = parseFloat(String(v ?? ""));
    return Number.isFinite(n) ? n : 0;
  };
  const optNum = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    if (!s) return null;
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : null;
  };

  return {
    name,
    slug,
    sku: String(formData.get("sku") ?? "").trim() || null,
    brand: String(formData.get("brand") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    category_id: String(formData.get("category_id") ?? "").trim() || null,
    price: num(formData.get("price")),
    compare_at_price: optNum(formData.get("compare_at_price")),
    stock: Math.trunc(num(formData.get("stock"))),
    image_url: String(formData.get("image_url") ?? "").trim() || null,
    is_active: formData.get("is_active") === "on",
    is_featured: formData.get("is_featured") === "on",
  };
}

export async function createProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const values = parseForm(formData);
  if (!values.name) throw new Error("El nombre es obligatorio");

  const { error } = await supabase
    .from("products")
    .insert(values as never);
  if (error) throw new Error(error.message);

  revalidatePath("/catalogo");
  redirect("/catalogo");
}

export async function updateProduct(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const values = parseForm(formData);
  if (!values.name) throw new Error("El nombre es obligatorio");

  const { error } = await supabase
    .from("products")
    .update(values as never)
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/catalogo");
  redirect("/catalogo");
}

export async function deleteProduct(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/catalogo");
}
