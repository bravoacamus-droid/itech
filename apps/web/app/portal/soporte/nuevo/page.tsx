import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SupportNewForm } from "@/components/portal/support-new-form";
import { getPortalUser } from "@/lib/portal";

export const dynamic = "force-dynamic";

export default async function NewSupportPage() {
  const pu = await getPortalUser();
  if (!pu) redirect("/cuenta/ingresar?next=/portal/soporte/nuevo");
  if (!pu.company) redirect("/portal");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/portal" className="hover:text-brand-600">Portal</Link> /{" "}
          <span className="text-ink">Nuevo ticket</span>
        </nav>
        <h1 className="mt-2 mb-6 text-2xl font-bold text-ink">Nuevo ticket de soporte</h1>
        <SupportNewForm />
      </main>
      <SiteFooter />
    </>
  );
}
