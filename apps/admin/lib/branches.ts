import { ADMIN_ROLES, type AppRole } from "@itech/db";
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

/**
 * Sucursales que el usuario actual puede operar y si es admin (ve todas).
 * Un no-admin solo ve las sedes asignadas en profiles.branch_ids.
 */
export async function getBranchScope(): Promise<{ branches: Branch[]; isAdmin: boolean }> {
  const supabase = await createClient();
  const all = await listBranches();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { branches: all, isAdmin: false };
  const { data } = await supabase
    .from("profiles")
    .select("role, branch_ids")
    .eq("id", user.id)
    .single();
  const prof = data as { role: AppRole; branch_ids: string[] | null } | null;
  if (!prof) return { branches: all, isAdmin: false };
  const isAdmin = ADMIN_ROLES.includes(prof.role);
  if (isAdmin) return { branches: all, isAdmin: true };
  const allowed = new Set(prof.branch_ids ?? []);
  return { branches: all.filter((b) => allowed.has(b.id)), isAdmin: false };
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
