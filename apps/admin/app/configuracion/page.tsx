import { requireAdmin } from "@/lib/auth";
import { getSettingsMap } from "@/lib/settings";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@itech/ui";
import { updateSettings } from "@/app/configuracion/actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-xl border border-surface-border px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";
const label = "block text-sm font-medium text-ink mb-1";

export default async function ConfigPage() {
  const { user } = await requireAdmin();
  const s = await getSettingsMap();

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-1 text-2xl font-bold text-ink">Configuración</h1>
        <p className="mb-6 text-sm text-ink-soft">
          Datos de la tienda usados en el sitio público.
        </p>

        <form
          action={updateSettings}
          className="grid gap-5 rounded-2xl border border-surface-border/70 bg-white p-6"
        >
          <div>
            <label className={label}>WhatsApp (formato internacional)</label>
            <input
              name="whatsapp_number"
              defaultValue={s.whatsapp_number ?? ""}
              className={field}
              placeholder="51916854842"
            />
            <p className="mt-1 text-xs text-ink-muted">
              Sin el signo +. Ej: 51916854842 (51 = Perú).
            </p>
          </div>
          <div>
            <label className={label}>Nombre de la tienda</label>
            <input
              name="store_name"
              defaultValue={s.store_name ?? ""}
              className={field}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label}>Teléfono de contacto</label>
              <input
                name="contact_phone"
                defaultValue={s.contact_phone ?? ""}
                className={field}
              />
            </div>
            <div>
              <label className={label}>Correo de contacto</label>
              <input
                name="contact_email"
                type="email"
                defaultValue={s.contact_email ?? ""}
                className={field}
              />
            </div>
          </div>
          <div>
            <Button type="submit">Guardar cambios</Button>
          </div>
        </form>
      </main>
    </div>
  );
}
