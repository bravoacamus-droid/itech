"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { REPAIR_STATUSES } from "@/lib/repairs";

export async function reopenWarranty(ticketId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const note = String(formData.get("note") ?? "").trim();
  const { data, error } = await supabase.rpc("reopen_warranty" as never, {
    p_ticket: ticketId,
    p_note: note,
  } as never);
  if (error) throw new Error(error.message);
  const row = (Array.isArray(data) ? data[0] : data) as { ticket_id?: string } | null;
  revalidatePath("/reparaciones");
  redirect(row?.ticket_id ? `/reparaciones/${row.ticket_id}` : "/reparaciones");
}

export async function createTicket(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("customer_name") ?? "").trim();
  const phone = String(formData.get("customer_phone") ?? "").trim();
  if (!name || !phone) throw new Error("Nombre y teléfono son obligatorios");

  const payload = {
    customer_name: name,
    customer_phone: phone,
    customer_email: String(formData.get("customer_email") ?? "").trim(),
    device_type: String(formData.get("device_type") ?? "").trim(),
    brand: String(formData.get("brand") ?? "").trim(),
    model: String(formData.get("model") ?? "").trim(),
    imei_serial: String(formData.get("imei_serial") ?? "").trim(),
    reported_issue: String(formData.get("reported_issue") ?? "").trim(),
    technician_name: String(formData.get("technician_name") ?? "").trim(),
    estimated_cost: String(formData.get("estimated_cost") ?? "").trim(),
    warranty_days: String(formData.get("warranty_days") ?? "").trim(),
  };

  const { data, error } = await supabase.rpc("create_repair_ticket" as never, {
    p: payload,
  } as never);
  if (error) throw new Error(error.message);

  const row = (Array.isArray(data) ? data[0] : data) as { id?: string } | null;
  revalidatePath("/reparaciones");
  redirect(row?.id ? `/reparaciones/${row.id}` : "/reparaciones");
}

export async function updateTicket(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const status = String(formData.get("status") ?? "");
  if (!(REPAIR_STATUSES as readonly string[]).includes(status)) {
    throw new Error("Estado inválido");
  }
  const note = String(formData.get("note") ?? "").trim();
  const technician = String(formData.get("technician_name") ?? "").trim();
  const diagnosis = String(formData.get("diagnosis") ?? "").trim();
  const estRaw = String(formData.get("estimated_cost") ?? "").trim();
  const estimated = estRaw ? parseFloat(estRaw) : null;

  const companyId = String(formData.get("company_id") ?? "").trim();
  const patch: Record<string, unknown> = {
    status,
    technician_name: technician || null,
    diagnosis: diagnosis || null,
    estimated_cost: estimated,
    company_id: companyId || null,
  };
  if (status === "entregado") patch.delivered_at = new Date().toISOString();

  const { error: upErr } = await supabase
    .from("repair_tickets")
    .update(patch as never)
    .eq("id", id);
  if (upErr) throw new Error(upErr.message);

  const { error: insErr } = await supabase
    .from("repair_updates")
    .insert({ ticket_id: id, status, note: note || null } as never);
  if (insErr) throw new Error(insErr.message);

  revalidatePath(`/reparaciones/${id}`);
  revalidatePath("/reparaciones");
}
