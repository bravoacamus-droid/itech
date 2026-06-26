"use client";

import { useState } from "react";
import { useCart, type CartItem } from "./cart/cart-context";

type Props = {
  product: Omit<CartItem, "quantity">;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
};

export function AddToCart({ product, disabled, className, compact }: Props) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const base = compact
    ? "w-full rounded-xl bg-brand-50 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-500 hover:text-white disabled:opacity-50"
    : "rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50";

  return (
    <button
      type="button"
      onClick={handle}
      disabled={disabled}
      className={className ?? base}
    >
      {disabled ? "Sin stock" : added ? "Agregado ✓" : "Agregar al carrito"}
    </button>
  );
}
