import { createClient } from "@/lib/supabase/server";

export type Branch = {
  id: string;
  name: string;
  address: string | null;
  is_default: boolean;
  is_online: boolean;
  is_active: boolean;
};

export type BranchMetric = {
  name: string;
  is_default: boolean;
  is_online: boolean;
  sales: number;
  orders: number;
  stock: number;
};

export async function listBranches(): Promise<Branch[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("branches")
    .select("id, name, address, is_default, is_online, is_active")
    .order("created_at", { ascending: true })
    .returns<Branch[]>();
  return data ?? [];
}

export async function getBranchMetrics(): Promise<BranchMetric[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("branch_metrics" as never);
  if (error || !data) return [];
  return data as unknown as BranchMetric[];
}

/** Stock por sucursal de un producto. */
export async function getProductBranchStock(productId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("branch_stock")
    .select("branch_id, stock, branches(name)")
    .eq("product_id", productId);
  return (data ?? []) as unknown as {
    branch_id: string;
    stock: number;
    branches: { name: string } | null;
  }[];
}
