import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OrderSuccess } from "@/components/order-success";
import { getWhatsappNumber } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage() {
  const whatsapp = await getWhatsappNumber();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-center text-ink-muted">Cargando…</div>}>
          <OrderSuccess whatsappNumber={whatsapp} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
