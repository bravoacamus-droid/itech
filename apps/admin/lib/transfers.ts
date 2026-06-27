import { createClient } from "@/lib/supabase/server";

export type Transfer = {
  id: string;
  transfer_number: string;
  product: string;
  from_branch: string;
  to_branch: string;
  quantity: number;
  note: string | null;
  created_at: string;
};

export async function listTransfers(limit = 50): Promise<Transfer[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stock_transfers")
    .select("id, transfer_number, product_id, from_branch, to_branch, quantity, note, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  const rows = (data ?? []) as unknown as {
    id: string;
    transfer_number: string;
    product_id: string;
    from_branch: string;
    to_branch: string;
    quantity: number;
    note: string | null;
    created_at: string;
  }[];
  if (!rows.length) return [];

  const productIds = Array.from(new Set(rows.map((r) => r.product_id)));
  const branchIds = Array.from(new Set(rows.flatMap((r) => [r.from_branch, r.to_branch])));
  const [{ data: prods }, { data: brs }] = await Promise.all([
    supabase.from("products").select("id, name").in("id", productIds),
    supabase.from("branches").select("id, name").in("id", branchIds),
  ]);
  const pName: Record<string, string> = {};
  ((prods ?? []) as { id: string; name: string }[]).forEach((p) => (pName[p.id] = p.name));
  const bName: Record<string, string> = {};
  ((brs ?? []) as { id: string; name: string }[]).forEach((b) => (bName[b.id] = b.name));

  return rows.map((r) => ({
    id: r.id,
    transfer_number: r.transfer_number,
    product: pName[r.product_id] ?? "—",
    from_branch: bName[r.from_branch] ?? "—",
    to_branch: bName[r.to_branch] ?? "—",
    quantity: r.quantity,
    note: r.note,
    created_at: r.created_at,
  }));
}

/** Productos para el selector de transferencia. */
export async function getTransferProducts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name")
    .eq("is_active", true)
    .order("name");
  return (data ?? []) as unknown as { id: string; name: string }[];
}
