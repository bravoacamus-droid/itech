import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartView } from "@/components/cart-view";

export default function CartPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-ink">Tu carrito</h1>
        <CartView />
      </main>
      <SiteFooter />
    </>
  );
}
