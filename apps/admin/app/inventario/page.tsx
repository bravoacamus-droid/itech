import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { listInventory, listInventoryByBranch, isLow } from "@/lib/inventory";
import { getBranchScope } from "@/lib/branches";
import { AdminHeader } from "@/components/admin-header";

export const dynamic = "force-dynamic";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string }>;
}) {
  const { user } = await requireStaff();
  const sp = await searchParams;
  const { branches, isAdmin } = await getBranchScope();
  // Un no-admin no ve el total global: se fuerza a una de sus sedes.
  const allowedIds = new Set(branches.map((b) => b.id));
  let branchId = sp.branch && allowedIds.has(sp.branch) ? sp.branch : undefined;
  if (!isAdmin && !branchId) branchId = branches[0]?.id;
  const items = branchId ? await listInventoryByBranch(branchId) : await listInventory();
  const low = items.filter(isLow);
  const scope = branchId ? branches.find((b) => b.id === branchId)?.name ?? "Sede" : "Total (todas las sedes)";

  return (
    <div className="min-h-screen">
      <AdminHeader email={user.email} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink">Inventario</h1>
            <p className="text-sm text-ink-soft">{items.length} productos · {scope}</p>
          </div>
          <Link
            href={branchId ? `/reposicion?branch=${branchId}` : "/reposicion"}
            className="rounded-xl border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
          >
            Proyección de reposición →
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {isAdmin && (
            <Link
              href="/inventario"
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${!branchId ? "bg-brand-500 text-white" : "bg-surface-subtle text-ink-soft hover:bg-brand-50"}`}
            >
              Total
            </Link>
          )}
          {branches.map((b) => (
            <Link
              key={b.id}
              href={`/inventario?branch=${b.id}`}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${branchId === b.id ? "bg-brand-500 text-white" : "bg-surface-subtle text-ink-soft hover:bg-brand-50"}`}
            >
              {b.name}
            </Link>
          ))}
        </div>

        {low.length > 0 && (
          <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/5 p-4">
            <p className="text-sm font-semibold text-danger">
              ⚠ {low.length} producto(s) en stock bajo o agotado
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              {low.map((l) => l.name).slice(0, 6).join(" · ")}
              {low.length > 6 ? "…" : ""}
            </p>
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-surface-border/70 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border/70 bg-surface-subtle text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Umbral</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const lowItem = isLow(it);
                const out = it.stock <= 0;
                return (
                  <tr
                    key={it.id}
                    className="border-b border-surface-border/50 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-surface-subtle">
                          {it.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={it.image_url}
                              alt={it.name}
                              className="max-h-10 w-auto object-contain"
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-ink">{it.name}</div>
                          {it.brand && (
                            <div className="text-xs text-ink-muted">{it.brand}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink">{it.stock}</td>
                    <td className="px-4 py-3 text-ink-soft">{it.low_stock_threshold}</td>
                    <td className="px-4 py-3">
                      {out ? (
                        <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger">
                          Agotado
                        </span>
                      ) : lowItem ? (
                        <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-[#9a6a00]">
                          Stock bajo
                        </span>
                      ) : (
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/inventario/${it.id}`}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50"
                      >
                        Ajustar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
