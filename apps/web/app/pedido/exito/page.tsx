import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OrderSuccess } from "@/components/order-success";

export default function OrderSuccessPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-center text-ink-muted">Cargando…</div>}>
          <OrderSuccess />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
