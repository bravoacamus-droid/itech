import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  getPortalUser,
  getMyRepairs,
  getMySupport,
  SUPPORT_STATUS_LABEL,
  REPAIR_STATUS_LABEL,
} from "@/lib/portal";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const pu = await getPortalUser();
  if (!pu) redirect("/cuenta/ingresar?next=/portal");

  if (!pu.company) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-ink">Portal de empresas</h1>
          <p className="mt-2 text-ink-soft">
            Tu cuenta no está asociada a una empresa. Si tu empresa tiene un
            contrato con iTech, pídele al administrador que te agregue, o{" "}
            <Link href="/b2b" className="font-semibold text-brand-600 hover:underline">
              conoce nuestros servicios B2B
            </Link>
            .
          </p>
        </main>
        <SiteFooter />
      </>
    );
  }

  const [repairs, support] = await Promise.all([getMyRepairs(), getMySupport()]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-ink">{pu.company.name}</h1>
            <p className="text-sm capitalize text-ink-soft">Plan {pu.company.plan}</p>
          </div>
          <Link
            href="/portal/soporte/nuevo"
            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            + Nuevo ticket de soporte
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Soporte */}
          <section className="rounded-2xl border border-surface-border/70 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-ink">Tickets de soporte</h2>
            {support.length === 0 ? (
              <p className="text-sm text-ink-muted">Aún no tienes tickets.</p>
            ) : (
              <ul className="space-y-2">
                {support.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/portal/soporte/${s.id}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-brand-50"
                    >
                      <span className="text-ink">{s.subject}</span>
                      <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-xs text-ink-soft">
                        {SUPPORT_STATUS_LABEL[s.status] ?? s.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Reparaciones (flota) */}
          <section className="rounded-2xl border border-surface-border/70 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-ink">Reparaciones de la flota</h2>
            {repairs.length === 0 ? (
              <p className="text-sm text-ink-muted">No hay reparaciones registradas.</p>
            ) : (
              <ul className="space-y-2">
                {repairs.map((r) => (
                  <li key={r.id} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm">
                    <span className="text-ink">
                      {r.ticket_number}
                      <span className="ml-2 text-ink-muted">
                        {[r.device_type, r.brand, r.model].filter(Boolean).join(" ")}
                      </span>
                    </span>
                    <span className="rounded-full bg-surface-subtle px-2 py-0.5 text-xs text-ink-soft">
                      {REPAIR_STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
