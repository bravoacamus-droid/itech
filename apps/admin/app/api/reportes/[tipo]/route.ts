import { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";
import { STAFF_ROLES, type AppRole } from "@itech/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// CSV con separador ; y BOM UTF-8 (compatible con Excel en español).
function toCsv(headers: string[], rows: (string | number | null)[][]): string {
  const esc = (v: string | number | null) => {
    const s = v == null ? "" : String(v);
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(";"), ...rows.map((r) => r.map(esc).join(";"))];
  return "﻿" + lines.join("\r\n");
}

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleString("es-PE", { timeZone: "America/Lima" }) : "";

const TITLES: Record<string, string> = {
  ventas: "Reporte de ventas",
  inventario: "Reporte de inventario",
  asistencia: "Reporte de asistencia",
  transferencias: "Reporte de transferencias",
};

async function toXlsx(tipo: string, headers: string[], rows: (string | number | null)[][]): Promise<ArrayBuffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "iTech ERP";
  const ws = wb.addWorksheet(TITLES[tipo] ?? "Reporte", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  ws.columns = headers.map((h) => ({ header: h, key: h, width: Math.max(14, Math.min(40, h.length + 6)) }));
  // Encabezado con estilo de marca
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: "FFFFFFFF" } };
  head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0EA5E9" } };
  head.alignment = { vertical: "middle" };
  head.height = 20;
  rows.forEach((r) => ws.addRow(r));
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };
  // Ajuste de ancho según contenido
  ws.columns.forEach((col) => {
    let max = String(col.header ?? "").length;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const len = String(cell.value ?? "").length;
      if (len > max) max = len;
    });
    col.width = Math.max(12, Math.min(48, max + 4));
  });
  return (await wb.xlsx.writeBuffer()) as unknown as ArrayBuffer;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tipo: string }> },
) {
  const { tipo } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("No autorizado", { status: 401 });
  const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = (prof as { role: AppRole } | null)?.role;
  if (!role || !STAFF_ROLES.includes(role)) return new Response("No autorizado", { status: 403 });

  const sp = req.nextUrl.searchParams;
  const from = sp.get("from");
  const to = sp.get("to");
  const fromTs = from ? `${from}T00:00:00` : null;
  const toTs = to ? `${to}T23:59:59` : null;

  let headers: string[] = [];
  let rows: (string | number | null)[][] = [];

  if (tipo === "ventas") {
    let q = supabase
      .from("orders")
      .select("order_number, created_at, channel, status, total, branches(name)")
      .order("created_at", { ascending: false });
    if (fromTs) q = q.gte("created_at", fromTs);
    if (toTs) q = q.lte("created_at", toTs);
    const { data } = await q;
    headers = ["N° Pedido", "Fecha", "Canal", "Sucursal", "Estado", "Total"];
    rows = ((data ?? []) as unknown as {
      order_number: string; created_at: string; channel: string | null;
      status: string; total: number | null; branches: { name: string } | null;
    }[]).map((o) => [o.order_number, fmt(o.created_at), o.channel ?? "", o.branches?.name ?? "", o.status, o.total ?? 0]);
  } else if (tipo === "inventario") {
    const { data } = await supabase
      .from("branch_stock")
      .select("stock, low_stock_threshold, products(name, brand), branches(name)");
    headers = ["Producto", "Marca", "Sucursal", "Stock", "Umbral bajo"];
    rows = ((data ?? []) as unknown as {
      stock: number; low_stock_threshold: number;
      products: { name: string; brand: string | null } | null; branches: { name: string } | null;
    }[])
      .filter((r) => r.products)
      .map((r) => [r.products!.name, r.products!.brand ?? "", r.branches?.name ?? "", r.stock, r.low_stock_threshold]);
  } else if (tipo === "asistencia") {
    let q = supabase
      .from("time_entries")
      .select("user_id, clock_in, clock_out, branches(name)")
      .order("clock_in", { ascending: false });
    if (fromTs) q = q.gte("clock_in", fromTs);
    if (toTs) q = q.lte("clock_in", toTs);
    const { data } = await q;
    const entries = (data ?? []) as unknown as {
      user_id: string; clock_in: string; clock_out: string | null; branches: { name: string } | null;
    }[];
    const ids = Array.from(new Set(entries.map((e) => e.user_id)));
    const names: Record<string, string> = {};
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      ((profs ?? []) as { id: string; full_name: string | null }[]).forEach((p) => (names[p.id] = p.full_name || "—"));
    }
    headers = ["Empleado", "Sucursal", "Entrada", "Salida", "Horas"];
    rows = entries.map((e) => {
      const hours = e.clock_out
        ? Math.round(((new Date(e.clock_out).getTime() - new Date(e.clock_in).getTime()) / 3600000) * 100) / 100
        : "";
      return [names[e.user_id] || "—", e.branches?.name ?? "", fmt(e.clock_in), fmt(e.clock_out), hours];
    });
  } else if (tipo === "transferencias") {
    let q = supabase
      .from("stock_transfers")
      .select("transfer_number, created_at, product_id, from_branch, to_branch, quantity, status")
      .order("created_at", { ascending: false });
    if (fromTs) q = q.gte("created_at", fromTs);
    if (toTs) q = q.lte("created_at", toTs);
    const { data } = await q;
    const ts = (data ?? []) as unknown as {
      transfer_number: string; created_at: string; product_id: string;
      from_branch: string; to_branch: string; quantity: number; status: string;
    }[];
    const pIds = Array.from(new Set(ts.map((t) => t.product_id)));
    const bIds = Array.from(new Set(ts.flatMap((t) => [t.from_branch, t.to_branch])));
    const [{ data: prods }, { data: brs }] = await Promise.all([
      supabase.from("products").select("id, name").in("id", pIds),
      supabase.from("branches").select("id, name").in("id", bIds),
    ]);
    const pName: Record<string, string> = {};
    ((prods ?? []) as { id: string; name: string }[]).forEach((p) => (pName[p.id] = p.name));
    const bName: Record<string, string> = {};
    ((brs ?? []) as { id: string; name: string }[]).forEach((b) => (bName[b.id] = b.name));
    headers = ["N°", "Fecha", "Producto", "Origen", "Destino", "Cantidad", "Estado"];
    rows = ts.map((t) => [t.transfer_number, fmt(t.created_at), pName[t.product_id] ?? "", bName[t.from_branch] ?? "", bName[t.to_branch] ?? "", t.quantity, t.status]);
  } else {
    return new Response("Reporte no válido", { status: 404 });
  }

  const stamp = new Date().toISOString().slice(0, 10);

  if (sp.get("format") === "xlsx") {
    const buf = await toXlsx(tipo, headers, rows);
    return new Response(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="itech-${tipo}-${stamp}.xlsx"`,
      },
    });
  }

  const csv = toCsv(headers, rows);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="itech-${tipo}-${stamp}.csv"`,
    },
  });
}
