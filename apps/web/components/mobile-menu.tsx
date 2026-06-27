"use client";

import { useState } from "react";
import Link from "next/link";
import { SearchBar } from "./search-bar";

type NavItem = { label: string; href: string; mega?: boolean };

export function MobileMenu({
  nav,
  isLoggedIn,
}: {
  nav: NavItem[];
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menú"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-surface-border text-ink-soft"
      >
        <div className="space-y-1.5">
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
          <span className="block h-0.5 w-5 bg-current" />
        </div>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 top-16 z-50 border-b border-surface-border/70 bg-white p-4 shadow-soft">
            <SearchBar className="mb-4" />
            <nav className="flex flex-col">
              {nav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-brand-50 hover:text-brand-600"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={isLoggedIn ? "/cuenta" : "/cuenta/ingresar"}
                onClick={() => setOpen(false)}
                className="mt-2 rounded-lg bg-brand-50 px-3 py-2.5 text-sm font-semibold text-brand-600"
              >
                {isLoggedIn ? "Mi cuenta" : "Ingresar"}
              </Link>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
