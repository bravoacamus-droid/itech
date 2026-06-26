import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@itech/db";

/** Cliente Supabase para Server Components / Server Actions (sujeto a RLS). */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: import("@supabase/ssr").CookieOptions;
          }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Llamado desde un Server Component: ignorar (lo maneja el middleware).
          }
        },
      },
    },
  );
}
