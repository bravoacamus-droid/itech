import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@itech/ui";
import { createCompany } from "@/app/empresas/actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";
const label = "block text-sm font-medium text-ink mb-1";

export default async function NewCompanyPage() {
  const { user } = await requireAdmin();
  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/empresas" className="hover:text-brand-600">Empresas</Link> /{" "}
          <span className="text-ink">Nueva</span>
        </nav>
        <h1 className="mt-2 mb-6 text-2xl font-bold text-ink">Nueva empresa</h1>
        <form action={createCompany} className="grid gap-4 rounded-2xl border border-surface-border/70 bg-white p-6">
          <div>
            <label className={label}>Nombre *</label>
            <input name="name" required className={field} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={label}>RUC</label><input name="ruc" className={field} /></div>
            <div>
              <label className={label}>Plan</label>
              <select name="plan" className={field} defaultValue="esencial">
                <option value="esencial">Esencial</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div><label className={label}>Contacto</label><input name="contact_name" className={field} /></div>
            <div><label className={label}>Teléfono</label><input name="contact_phone" className={field} /></div>
            <div className="sm:col-span-2"><label className={label}>Correo</label><input name="contact_email" type="email" className={field} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="is_active" defaultChecked /> Activa
          </label>
          <div><Button type="submit">Crear empresa</Button></div>
        </form>
      </main>
    </div>
  );
}
