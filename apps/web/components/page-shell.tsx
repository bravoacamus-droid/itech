import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function PageShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-brand-gradient">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
            {eyebrow && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                {eyebrow}
              </span>
            )}
            <h1 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              {title}
            </h1>
            {subtitle && <p className="mt-3 max-w-2xl text-white/85">{subtitle}</p>}
          </div>
        </section>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
