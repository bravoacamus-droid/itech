import { NextResponse } from "next/server";
import { ADMIN_ROLES, type AppRole } from "@itech/db";
import { createClient } from "@/lib/supabase/server";

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = (data as { role: AppRole } | null)?.role;
  const ok = role
    ? [...ADMIN_ROLES, "accountant", "branch_manager"].includes(role)
    : false;
  return ok ? { supabase } : null;
}

/**
 * Verifica la preparación para emitir a SUNAT. La firma UBL 2.1 y el envío SOAP
 * se realizan en el conector server-side cuando todo está configurado (certificado
 * cargado + credenciales SOL). Aquí devolvemos el checklist de preparación.
 */
export async function POST(request: Request) {
  const ctx = await requireStaff();
  if (!ctx) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let invoiceId = "";
  try {
    const b = await request.json();
    invoiceId = String(b.invoiceId ?? "");
  } catch {
    /* ignore */
  }

  const { data: cfg } = await ctx.supabase
    .from("fiscal_config")
    .select("ruc, razon_social, sol_user, cert_uploaded, environment")
    .eq("id", "default")
    .maybeSingle();
  const c = (cfg ?? {}) as {
    ruc?: string;
    razon_social?: string;
    sol_user?: string;
    cert_uploaded?: boolean;
    environment?: string;
  };

  const missing: string[] = [];
  if (!c.ruc) missing.push("RUC del emisor");
  if (!c.razon_social) missing.push("Razón social");
  if (!c.sol_user) missing.push("Usuario SOL");
  if (!c.cert_uploaded) missing.push("Certificado digital (.pfx)");
  if (!process.env.SUNAT_CERT_PASSWORD) missing.push("Clave del certificado (SUNAT_CERT_PASSWORD)");
  if (!process.env.SUNAT_SOL_PASSWORD) missing.push("Clave SOL (SUNAT_SOL_PASSWORD)");

  const ready = missing.length === 0;

  return NextResponse.json({
    ready,
    missing,
    environment: c.environment ?? "beta",
    invoiceId,
    message: ready
      ? "Configuración completa. El conector de firma (UBL 2.1) y envío a SUNAT está listo para activarse con el certificado cargado."
      : "Faltan datos para emitir a SUNAT.",
  });
}
