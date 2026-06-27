import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShoppingAssistant } from "@/components/shopping-assistant";

export const metadata = {
  title: "Asistente de compra — iTech",
};

export default function AsistentePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ShoppingAssistant />
      </main>
      <SiteFooter />
    </>
  );
}
