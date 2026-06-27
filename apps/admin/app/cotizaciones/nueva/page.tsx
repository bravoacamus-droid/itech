import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getCatalogForPicker } from "@/lib/quotes";
import { AdminHeader } from "@/components/admin-header";
import { QuoteBuilder } from "@/components/quote-builder";

export const dynamic = "force-dynamic";

export default async function NewQuotePage() {
  const { user } = await requireAdmin();
  const catalog = await getCatalogForPicker();

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/cotizaciones" className="hover:text-brand-600">Cotizaciones</Link> /{" "}
          <span className="text-ink">Nueva</span>
        </nav>
        <h1 className="mt-2 mb-6 text-2xl font-bold text-ink">Nueva cotización</h1>
        <QuoteBuilder catalog={catalog} />
      </main>
    </div>
  );
}
