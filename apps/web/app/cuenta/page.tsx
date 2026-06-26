import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SignOutButton } from "@/components/auth/signout-button";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/cuenta/ingresar?next=/cuenta");

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const name = (profileRow as { full_name?: string } | null)?.full_name;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-ink">Mi cuenta</h1>
        <p className="mt-1 text-ink-soft">
          {name ? `Hola, ${name}` : "Bienvenido"} · {user.email}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/cuenta/pedidos"
            className="rounded-2xl border border-surface-border/70 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <div className="mb-3 h-10 w-10 rounded-xl bg-brand-gradient" />
            <h2 className="text-lg font-semibold text-ink">Mis pedidos</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Revisa el estado de tus compras.
            </p>
          </Link>
          <Link
            href="/shop"
            className="rounded-2xl border border-surface-border/70 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <div className="mb-3 h-10 w-10 rounded-xl bg-brand-gradient" />
            <h2 className="text-lg font-semibold text-ink">Seguir comprando</h2>
            <p className="mt-1 text-sm text-ink-muted">Explora el catálogo.</p>
          </Link>
        </div>

        <div className="mt-8">
          <SignOutButton />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
