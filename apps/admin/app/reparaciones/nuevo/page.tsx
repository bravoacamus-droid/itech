import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@itech/ui";
import { createTicket } from "@/app/reparaciones/actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";
const label = "block text-sm font-medium text-ink mb-1";

export default async function NewTicketPage() {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/reparaciones" className="hover:text-brand-600">
            Reparaciones
          </Link>{" "}
          / <span className="text-ink">Nuevo ticket</span>
        </nav>
        <h1 className="mt-2 mb-6 text-2xl font-bold text-ink">
          Recepción de equipo
        </h1>

        <form action={createTicket} className="grid gap-5">
          <div className="rounded-2xl border border-surface-border/70 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Cliente
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Nombre *</label>
                <input name="customer_name" required className={field} />
              </div>
              <div>
                <label className={label}>Teléfono *</label>
                <input name="customer_phone" required className={field} placeholder="9XX XXX XXX" />
              </div>
              <div className="sm:col-span-2">
                <label className={label}>Correo (opcional)</label>
                <input name="customer_email" type="email" className={field} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-surface-border/70 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Equipo
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Tipo de equipo</label>
                <select name="device_type" className={field} defaultValue="">
                  <option value="">— Selecciona —</option>
                  <option>Celular</option>
                  <option>Laptop</option>
                  <option>PC</option>
                  <option>Consola</option>
                  <option>Impresora</option>
                  <option>Otro</option>
                </select>
              </div>
              <div>
                <label className={label}>Marca</label>
                <input name="brand" className={field} />
              </div>
              <div>
                <label className={label}>Modelo</label>
                <input name="model" className={field} />
              </div>
              <div>
                <label className={label}>IMEI / N° de serie</label>
                <input name="imei_serial" className={field} />
              </div>
              <div className="sm:col-span-2">
                <label className={label}>Falla reportada</label>
                <textarea name="reported_issue" rows={3} className={field} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-surface-border/70 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Asignación
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Técnico asignado</label>
                <input name="technician_name" className={field} placeholder="Nombre del técnico" />
              </div>
              <div>
                <label className={label}>Costo estimado (S/)</label>
                <input name="estimated_cost" type="number" step="0.01" min={0} className={field} />
              </div>
              <div>
                <label className={label}>Garantía (días)</label>
                <input name="warranty_days" type="number" min={0} defaultValue={90} className={field} />
              </div>
            </div>
          </div>

          <div>
            <Button type="submit">Crear ticket</Button>
          </div>
        </form>
      </main>
    </div>
  );
}
