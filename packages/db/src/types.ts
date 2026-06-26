/**
 * Tipos de la base de datos (mínimos, mantenidos a mano por ahora).
 * Cuando el esquema crezca, regenerar con: `supabase gen types typescript`.
 */
export type AppRole =
  | "customer"
  | "b2b_member"
  | "b2b_admin"
  | "technician"
  | "cashier"
  | "warehouse_clerk"
  | "accountant"
  | "branch_manager"
  | "org_admin"
  | "super_admin";

/** Roles con acceso al back-office ERP. */
export const ADMIN_ROLES: AppRole[] = ["super_admin", "org_admin"];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: AppRole;
          company_id: string | null;
          branch_ids: string[];
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: AppRole;
          company_id?: string | null;
          branch_ids?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: AppRole;
          company_id?: string | null;
          branch_ids?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { app_role: AppRole };
  };
};
