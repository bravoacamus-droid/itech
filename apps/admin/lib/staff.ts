import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@itech/db";

export type StaffMember = {
  id: string;
  full_name: string;
  role: AppRole;
  branches: string[];
};

export async function listStaff(): Promise<StaffMember[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, branch_ids")
    .neq("role", "customer")
    .order("role");
  const rows = (data ?? []) as unknown as {
    id: string;
    full_name: string | null;
    role: AppRole;
    branch_ids: string[] | null;
  }[];

  const { data: brs } = await supabase.from("branches").select("id, name");
  const bName: Record<string, string> = {};
  ((brs ?? []) as { id: string; name: string }[]).forEach((b) => (bName[b.id] = b.name));

  return rows.map((r) => ({
    id: r.id,
    full_name: r.full_name || "—",
    role: r.role,
    branches: (r.branch_ids ?? []).map((id) => bName[id] ?? id),
  }));
}

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super admin",
  org_admin: "Administrador",
  branch_manager: "Jefe de sede",
  cashier: "Cajero",
  warehouse_clerk: "Almacén",
  accountant: "Contador",
  technician: "Técnico",
  b2b_admin: "Admin B2B",
  b2b_member: "Miembro B2B",
  customer: "Cliente",
};

export const ASSIGNABLE_ROLES: AppRole[] = [
  "org_admin",
  "branch_manager",
  "cashier",
  "warehouse_clerk",
  "accountant",
  "technician",
];
