import Link from "next/link";
import { Logo } from "@itech/ui";
import { SignOutButton } from "./signout-button";

export function AdminHeader({ email }: { email?: string }) {
  return (
    <header className="border-b border-surface-border/70 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <Logo height={28} />
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600">
              ERP
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-brand-50 hover:text-brand-600"
            >
              Inicio
            </Link>
            <Link
              href="/catalogo"
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-brand-50 hover:text-brand-600"
            >
              Catálogo
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {email && (
            <span className="hidden text-sm text-ink-soft sm:inline">
              {email}
            </span>
          )}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
