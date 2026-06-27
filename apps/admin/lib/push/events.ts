import { createAdminClient } from "@/lib/supabase/admin";
import { notifyRoles, OPS_NOTIFY_ROLES } from "./notify";

/**
 * Si un producto quedó en stock bajo/agotado en una sede, avisa a los roles
 * operativos. Usa admin client (bypass RLS, Bug #1). Nunca lanza.
 */
export async function notifyLowStock(productId: string, branchId: string) {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("branch_stock")
      .select("stock, low_stock_threshold, products(name), branches(name)")
      .eq("product_id", productId)
      .eq("branch_id", branchId)
      .single();
    const row = data as unknown as {
      stock: number;
      low_stock_threshold: number;
      products: { name: string } | null;
      branches: { name: string } | null;
    } | null;
    if (!row || row.stock > row.low_stock_threshold) return;
    const name = row.products?.name ?? "Producto";
    const branch = row.branches?.name ?? "sucursal";
    await notifyRoles(
      OPS_NOTIFY_ROLES,
      {
        title: row.stock <= 0 ? "Producto agotado" : "Stock bajo",
        body: `${name} en ${branch}: ${row.stock} u.`,
        url: `/inventario?branch=${branchId}`,
        tag: `low-${productId}-${branchId}`,
      },
      "stock-bajo",
    );
  } catch {
    // diagnóstico va por push_log; nunca rompe el flujo
  }
}
