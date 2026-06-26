"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }
  return (
    <button
      onClick={signOut}
      className={
        className ??
        "rounded-xl border border-surface-border px-4 py-2 text-sm font-semibold text-ink-soft transition hover:bg-brand-50 hover:text-brand-600"
      }
    >
      Cerrar sesión
    </button>
  );
}
