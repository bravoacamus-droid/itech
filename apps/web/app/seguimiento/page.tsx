import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RepairTracker } from "@/components/repair-tracker";

export const metadata = {
  title: "Seguimiento de reparación — iTech",
};

export default function SeguimientoPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <RepairTracker />
      </main>
      <SiteFooter />
    </>
  );
}
