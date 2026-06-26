import { redirect } from "next/navigation";
import { Logo } from "@itech/ui";
import { ADMIN_ROLES, type AppRole } from "@itech/db";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/signout-button";

const MODULES = [
  { name: "Catálogo", desc: "Productos, imágenes, precios y descuentos", phase: "Fase 1" },
  { name: "Inventario", desc: "Almacén inteligente y alarmas de stock", phase: "Fase 2" },
  { name: "POS / Caja", desc: "Ventas, arqueo, apartados y retomas", phase: "Fase 2" },
  { name: "Reparaciones", desc: "Soporte técnico en 7 fases", phase: "Fase 3" },
  { name: "Contabilidad", desc: "Facturación electrónica SUNAT", phase: "Fase 4" },
  { name: "CRM + IA", desc: "Pipeline automático con Gemini y RAG", phase: "Fase 5" },
  { name: "B2B", desc: "Reparaciones gestionadas y helpdesk", phase: "Fase 6" },
  { name: "Multi-sucursal", desc: "Dashboards y empleados", phase: "Fase 7" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profileRow as { role: AppRole } | null)?.role;
  const isAuthorized = !!role && ADMIN_ROLES.includes(role);

  if (!isAuthorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-subtle p-4">
        <div className="w-full max-w-md rounded-2xl border border-surface-border/70 bg-white p-8 text-center shadow-card">
          <div className="mb-6 flex justify-center">
            <Logo height={36} />
          </div>
          <h1 className="text-xl font-bold text-ink">Acceso no autorizado</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Tu cuenta <span className="font-medium">{user.email}</span> no tiene
            permisos para el panel administrativo. Si crees que es un error,
            contacta a un administrador.
          </p>
          <div className="mt-6 flex justify-center">
            <SignOutButton />
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-border/70 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Logo height={30} />
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600">
              ERP
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-ink-soft sm:inline">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-ink">Panel de control</h1>
        <p className="mt-1 text-ink-soft">
          Bienvenido al back-office de iTech. Los módulos se habilitan por fases.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <div
              key={m.name}
              className="rounded-2xl border border-surface-border/70 bg-white p-5 transition hover:shadow-card"
            >
              <div className="mb-3 h-10 w-10 rounded-xl bg-brand-gradient" />
              <h3 className="text-base font-semibold text-ink">{m.name}</h3>
              <p className="mt-1 text-sm text-ink-muted">{m.desc}</p>
              <span className="mt-3 inline-block rounded-full bg-surface-subtle px-2.5 py-1 text-xs font-medium text-ink-soft">
                {m.phase}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
