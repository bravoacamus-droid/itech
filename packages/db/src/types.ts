/**
 * Tipos de la base de datos (mantenidos a mano por ahora).
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

/** Roles con acceso total al back-office ERP. */
export const ADMIN_ROLES: AppRole[] = ["super_admin", "org_admin"];

/** Roles que operan el back-office (acotados por sucursal vía RLS). */
export const STAFF_ROLES: AppRole[] = [
  "super_admin",
  "org_admin",
  "branch_manager",
  "cashier",
  "warehouse_clerk",
  "accountant",
  "technician",
];

// ---- Tipos de dominio del catálogo ----
export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  brand: string | null;
  description: string | null;
  category_id: string | null;
  price: number;
  compare_at_price: number | null;
  currency: string;
  stock: number;
  low_stock_threshold: number;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductWithCategory = Product & {
  category: Pick<Category, "name" | "slug"> | null;
};

type Empty = { [_ in never]: never };

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
        Update: Partial<{
          full_name: string | null;
          role: AppRole;
          company_id: string | null;
          branch_ids: string[];
        }>;
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at"> &
          Partial<Pick<Category, "id" | "created_at">>;
        Update: Partial<Omit<Category, "id" | "created_at">>;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at"> &
          Partial<Pick<Product, "id" | "created_at" | "updated_at">>;
        Update: Partial<Omit<Product, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Empty;
    Functions: Empty;
    Enums: { app_role: AppRole };
    CompositeTypes: Empty;
  };
};
