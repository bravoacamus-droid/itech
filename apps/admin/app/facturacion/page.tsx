import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getFiscalConfig, listInvoices, DOC_LABEL, INVOICE_STATUS_LABEL, money } from "@/lib/fiscal";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@itech/ui";
import { CertUpload } from "@/components/cert-upload";
import { updateFiscalConfig } from "@/app/facturacion/actions";

export const dynamic = "force-dynamic";

const field =
  "w-full rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";
const label = "block text-sm font-medium text-ink mb-1";

const STATUS_STYLE: Record<string, string> = {
  borrador: "bg-surface-subtle text-ink-soft",
  firmado: "bg-brand-50 text-brand-600",
  enviado: "bg-brand-50 text-brand-600",
  aceptado: "bg-success/10 text-success",
  rechazado: "bg-danger/10 text-danger",
  anulado: "bg-ink-muted/10 text-ink-muted",
};

export default async function FacturacionPage() {
  const { user } = await requireAdmin();
  const [cfg, invoices] = await Promise.all([getFiscalConfig(), listInvoices()]);

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-ink">Facturación electrónica (SUNAT)</h1>
        <p className="text-sm text-ink-soft">Configura el emisor, el certificado y emite comprobantes.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Config fiscal */}
          <form action={updateFiscalConfig} className="grid gap-4 rounded-2xl border border-surface-border/70 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Datos del emisor</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={label}>RUC</label><input name="ruc" defaultValue={cfg?.ruc ?? ""} className={field} placeholder="20XXXXXXXXX" /></div>
              <div><label className={label}>Ubigeo</label><input name="ubigeo" defaultValue={cfg?.ubigeo ?? ""} className={field} placeholder="150101" /></div>
              <div className="sm:col-span-2"><label className={label}>Razón social</label><input name="razon_social" defaultValue={cfg?.razon_social ?? ""} className={field} /></div>
              <div className="sm:col-span-2"><label className={label}>Dirección fiscal</label><input name="direccion" defaultValue={cfg?.direccion ?? ""} className={field} /></div>
              <div><label className={label}>Serie factura</label><input name="factura_serie" defaultValue={cfg?.factura_serie ?? "F001"} className={field} /></div>
              <div><label className={label}>Serie boleta</label><input name="boleta_serie" defaultValue={cfg?.boleta_serie ?? "B001"} className={field} /></div>
              <div><label className={label}>Usuario SOL</label><input name="sol_user" defaultValue={cfg?.sol_user ?? ""} className={field} /></div>
              <div>
                <label className={label}>Ambiente</label>
                <select name="environment" defaultValue={cfg?.environment ?? "beta"} className={field}>
                  <option value="beta">Beta (pruebas)</option>
                  <option value="produccion">Producción</option>
                </select>
              </div>
            </div>
            <div><Button type="submit">Guardar configuración</Button></div>
          </form>

          {/* Certificado */}
          <CertUpload uploaded={!!cfg?.cert_uploaded} />
        </div>

        {/* Comprobantes */}
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-ink">Comprobantes</h2>
          <div className="overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-3 font-semibold">Comprobante</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id} className="border-b border-surface-border/50 last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/facturacion/${i.id}`} className="font-medium text-brand-600 hover:underline">
                        {i.full_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{DOC_LABEL[i.doc_type] ?? i.doc_type}</td>
                    <td className="px-4 py-3 text-ink-soft">{i.customer_name}</td>
                    <td className="px-4 py-3 font-medium text-ink">{money(i.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[i.status] ?? ""}`}>
                        {INVOICE_STATUS_LABEL[i.status] ?? i.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                    Aún no hay comprobantes. Emítelos desde el detalle de un pedido.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
