import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@itech/ui";
import { ADMIN_ROLES, STAFF_ROLES, type AppRole } from "@itech/db";
import { createClient } from "@/lib/supabase/server";
import { getMetrics, money } from "@/lib/metrics";
import { SalesChart } from "@/components/sales-chart";
import { SignOutButton } from "@/components/signout-button";
import { PushToggle } from "@/components/push-toggle";
import { NotificationBell } from "@/components/notification-bell";

const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  enviado: "Enviado",
  entregado: "Entregado",
  anulado: "Anulado",
};

const MODULES: {
  name: string;
  desc: string;
  phase: string;
  href?: string;
  staff?: boolean; // visible para staff no-admin
}[] = [
  { name: "Catálogo", desc: "Productos, imágenes, precios y descuentos", phase: "Disponible", href: "/catalogo" },
  { name: "Categorías", desc: "Organiza el catálogo por categorías", phase: "Disponible", href: "/categorias" },
  { name: "Pedidos", desc: "Pedidos de la tienda y su estado", phase: "Disponible", href: "/pedidos" },
  { name: "Inventario", desc: "Stock, alarmas y movimientos", phase: "Disponible", href: "/inventario", staff: true },
  { name: "Reposición", desc: "Predicción de compra según ventas", phase: "Disponible", href: "/reposicion", staff: true },
  { name: "Transferencias", desc: "Mover stock entre sucursales", phase: "Disponible", href: "/transferencias", staff: true },
  { name: "Configuración", desc: "WhatsApp y datos de la tienda", phase: "Disponible", href: "/configuracion" },
  { name: "POS / Caja", desc: "Venta presencial y arqueo de caja", phase: "Disponible", href: "/pos", staff: true },
  { name: "Cotizaciones", desc: "Cotizador con branding (PDF/enlace)", phase: "Disponible", href: "/cotizaciones" },
  { name: "Reparaciones", desc: "Tickets, estados, técnico y seguimiento", phase: "Disponible", href: "/reparaciones", staff: true },
  { name: "Facturación SUNAT", desc: "Comprobantes electrónicos y certificado", phase: "Disponible", href: "/facturacion" },
  { name: "CRM + IA", desc: "Pipeline automático con Gemini y RAG", phase: "Fase 5" },
  { name: "Empresas (B2B)", desc: "Empresas, flota y miembros", phase: "Disponible", href: "/empresas" },
  { name: "Soporte (Helpdesk)", desc: "Tickets B2B con SLA", phase: "Disponible", href: "/soporte" },
  { name: "Panel B2B", desc: "SLA y tickets por empresa", phase: "Disponible", href: "/panel-b2b" },
  { name: "Notificaciones", desc: "Avisos automáticos (WhatsApp/email)", phase: "Disponible", href: "/notificaciones" },
  { name: "Sucursales", desc: "Stock y ventas por sede (comparativo)", phase: "Disponible", href: "/sucursales" },
  { name: "Empleados", desc: "Asistencia / control de horario", phase: "Disponible", href: "/empleados", staff: true },
  { name: "Accesos", desc: "Roles y sucursales por usuario", phase: "Disponible", href: "/accesos" },
  { name: "Reportes", desc: "Exporta CSV: ventas, inventario, asistencia", phase: "Disponible", href: "/reportes", staff: true },
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
  const isAuthorized = !!role && STAFF_ROLES.includes(role);
  const isAdmin = !!role && ADMIN_ROLES.includes(role);

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

  const metrics = isAdmin ? await getMetrics() : null;
  const lowStockCount = metrics?.low_stock_count ?? 0;
  const modules = MODULES.filter((m) => isAdmin || m.staff);

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
          <div className="flex items-center gap-3">
            <NotificationBell />
            <span className="hidden text-sm text-ink-soft sm:inline">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-ink">Panel de control</h1>
        <p className="mt-1 text-ink-soft">
          Bienvenido al back-office de iTech.
        </p>

        <div className="mt-6">
          <PushToggle />
        </div>

        {metrics && (
          <>
            {/* KPIs */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Ventas totales", value: money(metrics.total_sales) },
                { label: "Ventas (30 días)", value: money(metrics.sales_30d) },
                { label: "Pedidos", value: String(metrics.orders_count) },
                { label: "Ticket promedio", value: money(metrics.avg_ticket) },
              ].map((k) => (
                <div
                  key={k.label}
                  className="rounded-2xl border border-surface-border/70 bg-white p-5"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                    {k.label}
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-brand-600">
                    {k.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Ventas por día */}
            <div className="mt-4">
              <SalesChart data={metrics.sales_by_day} />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {/* Pedidos por estado */}
              <div className="rounded-2xl border border-surface-border/70 bg-white p-5">
                <h2 className="mb-4 text-sm font-semibold text-ink">
                  Pedidos por estado
                </h2>
                {metrics.by_status.length === 0 ? (
                  <p className="text-sm text-ink-muted">Aún no hay pedidos.</p>
                ) : (
                  <ul className="space-y-2">
                    {metrics.by_status.map((s) => (
                      <li
                        key={s.status}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-ink-soft">
                          {STATUS_LABEL[s.status] ?? s.status}
                        </span>
                        <span className="font-medium text-ink">
                          {s.count}{" "}
                          <span className="text-ink-muted">
                            · {money(s.total)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Top productos */}
              <div className="rounded-2xl border border-surface-border/70 bg-white p-5">
                <h2 className="mb-4 text-sm font-semibold text-ink">
                  Top productos
                </h2>
                {metrics.top_products.length === 0 ? (
                  <p className="text-sm text-ink-muted">
                    Sin ventas registradas todavía.
                  </p>
                ) : (
                  <ol className="space-y-2">
                    {metrics.top_products.map((p, i) => (
                      <li
                        key={p.name}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="flex items-center gap-2 text-ink">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                            {i + 1}
                          </span>
                          <span className="line-clamp-1">{p.name}</span>
                        </span>
                        <span className="whitespace-nowrap font-medium text-ink-soft">
                          {p.qty} u · {money(p.revenue)}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </>
        )}

        <h2 className="mt-10 mb-4 text-lg font-bold text-ink">Módulos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m) => {
            const inner = (
              <>
                <div className="mb-3 h-10 w-10 rounded-xl bg-brand-gradient" />
                <h3 className="text-base font-semibold text-ink">{m.name}</h3>
                <p className="mt-1 text-sm text-ink-muted">{m.desc}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                      m.href
                        ? "bg-success/10 text-success"
                        : "bg-surface-subtle text-ink-soft"
                    }`}
                  >
                    {m.phase}
                  </span>
                  {m.name === "Inventario" && lowStockCount > 0 && (
                    <span className="inline-block rounded-full bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger">
                      ⚠ {lowStockCount} stock bajo
                    </span>
                  )}
                </div>
              </>
            );
            return m.href ? (
              <Link
                key={m.name}
                href={m.href}
                className="rounded-2xl border border-surface-border/70 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                {inner}
              </Link>
            ) : (
              <div
                key={m.name}
                className="rounded-2xl border border-surface-border/70 bg-white p-5 opacity-80"
              >
                {inner}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
