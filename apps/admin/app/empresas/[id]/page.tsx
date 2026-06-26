import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCompany, getCompanyMembers } from "@/lib/b2b";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@itech/ui";
import { updateCompany, assignMember } from "@/app/empresas/actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";
const label = "block text-sm font-medium text-ink mb-1";
const ROLE_LABEL: Record<string, string> = { b2b_admin: "Admin empresa", b2b_member: "Miembro" };

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireAdmin();
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) notFound();

  const supabase = await createClient();
  const [members, repairs, support] = await Promise.all([
    getCompanyMembers(id),
    supabase
      .from("repair_tickets")
      .select("id, ticket_number, status, device_type, brand")
      .eq("company_id", id)
      .order("created_at", { ascending: false })
      .then((r) => (r.data ?? []) as { id: string; ticket_number: string; status: string; device_type: string | null; brand: string | null }[]),
    supabase
      .from("support_tickets")
      .select("id, ticket_number, subject, status, priority")
      .eq("company_id", id)
      .order("created_at", { ascending: false })
      .then((r) => (r.data ?? []) as { id: string; ticket_number: string; subject: string; status: string; priority: string }[]),
  ]);

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="text-sm text-ink-muted">
          <Link href="/empresas" className="hover:text-brand-600">Empresas</Link> /{" "}
          <span className="text-ink">{company.name}</span>
        </nav>
        <h1 className="mt-2 mb-6 text-2xl font-bold text-ink">{company.name}</h1>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Editar */}
          <form action={updateCompany.bind(null, id)} className="grid gap-4 rounded-2xl border border-surface-border/70 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Datos</h2>
            <div><label className={label}>Nombre</label><input name="name" defaultValue={company.name} className={field} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={label}>RUC</label><input name="ruc" defaultValue={company.ruc ?? ""} className={field} /></div>
              <div>
                <label className={label}>Plan</label>
                <select name="plan" defaultValue={company.plan} className={field}>
                  <option value="esencial">Esencial</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div><label className={label}>Contacto</label><input name="contact_name" defaultValue={company.contact_name ?? ""} className={field} /></div>
              <div><label className={label}>Teléfono</label><input name="contact_phone" defaultValue={company.contact_phone ?? ""} className={field} /></div>
              <div className="sm:col-span-2"><label className={label}>Correo</label><input name="contact_email" type="email" defaultValue={company.contact_email ?? ""} className={field} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" name="is_active" defaultChecked={company.is_active} /> Activa
            </label>
            <div><Button type="submit">Guardar</Button></div>
          </form>

          {/* Miembros */}
          <div className="grid gap-4 rounded-2xl border border-surface-border/70 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Miembros</h2>
            <ul className="space-y-2 text-sm">
              {members.map((m) => (
                <li key={m.id} className="flex justify-between">
                  <span className="text-ink">{m.full_name || "(sin nombre)"}</span>
                  <span className="text-ink-muted">{ROLE_LABEL[m.role] ?? m.role}</span>
                </li>
              ))}
              {members.length === 0 && <li className="text-ink-muted">Sin miembros aún.</li>}
            </ul>
            <form action={assignMember.bind(null, id)} className="mt-2 grid gap-2 border-t border-surface-border/70 pt-4">
              <label className={label}>Agregar miembro (por correo registrado)</label>
              <input name="email" type="email" required className={field} placeholder="correo@empresa.com" />
              <select name="role" className={field} defaultValue="b2b_member">
                <option value="b2b_member">Miembro</option>
                <option value="b2b_admin">Admin empresa</option>
              </select>
              <Button type="submit" variant="outline">Asignar</Button>
              <p className="text-xs text-ink-muted">El usuario debe registrarse primero en la tienda.</p>
            </form>
          </div>
        </div>

        {/* Flota de reparaciones + soporte */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-surface-border/70 bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">Reparaciones de la empresa</h2>
            <ul className="space-y-2 text-sm">
              {repairs.map((r) => (
                <li key={r.id} className="flex justify-between">
                  <Link href={`/reparaciones/${r.id}`} className="text-brand-600 hover:underline">{r.ticket_number}</Link>
                  <span className="text-ink-muted">{[r.device_type, r.brand].filter(Boolean).join(" ") || r.status}</span>
                </li>
              ))}
              {repairs.length === 0 && <li className="text-ink-muted">Sin reparaciones.</li>}
            </ul>
          </div>
          <div className="rounded-2xl border border-surface-border/70 bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">Tickets de soporte</h2>
            <ul className="space-y-2 text-sm">
              {support.map((s) => (
                <li key={s.id} className="flex justify-between">
                  <Link href={`/soporte/${s.id}`} className="text-brand-600 hover:underline">{s.ticket_number}</Link>
                  <span className="text-ink-muted">{s.subject}</span>
                </li>
              ))}
              {support.length === 0 && <li className="text-ink-muted">Sin tickets.</li>}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
