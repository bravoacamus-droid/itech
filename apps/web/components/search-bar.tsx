"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBar({
  className,
  autoFocus,
}: {
  className?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  }

  return (
    <form onSubmit={submit} className={className} role="search">
      <div className="flex items-center rounded-xl border border-surface-border bg-white focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-200">
        <input
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar productos, marcas…"
          className="w-full bg-transparent px-3 py-2 text-sm outline-none"
          aria-label="Buscar productos"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="m-1 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
