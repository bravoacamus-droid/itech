"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export async function updateFiscalConfig(formData: FormData) {
  const { supabase } = await requireAdmin();
  const patch = {
    ruc: String(formData.get("ruc") ?? "").trim() || null,
    razon_social: String(formData.get("razon_social") ?? "").trim() || null,
    direccion: String(formData.get("direccion") ?? "").trim() || null,
    ubigeo: String(formData.get("ubigeo") ?? "").trim() || null,
    factura_serie: String(formData.get("factura_serie") ?? "F001").trim() || "F001",
    boleta_serie: String(formData.get("boleta_serie") ?? "B001").trim() || "B001",
    environment: String(formData.get("environment") ?? "beta").trim(),
    sol_user: String(formData.get("sol_user") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("fiscal_config").update(patch as never).eq("id", "default");
  if (error) throw new Error(error.message);
  revalidatePath("/facturacion");
}

export async function markCertUploaded() {
  const { supabase } = await requireAdmin();
  await supabase.from("fiscal_config").update({ cert_uploaded: true } as never).eq("id", "default");
  revalidatePath("/facturacion");
}

export async function emitFromOrder(orderId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const docType = String(formData.get("doc_type") ?? "03"); // 01 factura, 03 boleta
  const customer = {
    doc_type: docType === "01" ? "6" : String(formData.get("customer_doc_type") ?? "1"),
    doc: String(formData.get("customer_doc") ?? "").trim(),
    name: String(formData.get("customer_name") ?? "").trim(),
  };
  if (docType === "01" && customer.doc.replace(/\D/g, "").length !== 11) {
    throw new Error("Para factura, el RUC debe tener 11 dígitos");
  }
  const { data, error } = await supabase.rpc("create_invoice_from_order" as never, {
    p_order: orderId,
    p_doc_type: docType,
    p_customer: customer,
  } as never);
  if (error) throw new Error(error.message);
  const row = (Array.isArray(data) ? data[0] : data) as { invoice_id?: string } | null;
  revalidatePath("/facturacion");
  redirect(row?.invoice_id ? `/facturacion/${row.invoice_id}` : "/facturacion");
}
