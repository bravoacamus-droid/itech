"use client";

import Link from "next/link";
import { useCart } from "./cart/cart-context";

export function CartButton() {
  const { count } = useCart();
  return (
    <Link
      href="/carrito"
      className="relative inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-600"
    >
      Carrito
      {count > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-brand-600">
          {count}
        </span>
      )}
    </Link>
  );
}
