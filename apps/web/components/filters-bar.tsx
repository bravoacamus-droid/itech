import Link from "next/link";
import type { Category } from "@itech/db";

type Current = {
  q?: string;
  category?: string;
  brand?: string;
  min?: string;
  max?: string;
  sort?: string;
};

function buildHref(current: Current, over: Partial<Current>): string {
  const merged: Current = { ...current, ...over };
  const params = new URLSearchParams();
  (["q", "category", "brand", "min", "max", "sort"] as const).forEach((k) => {
    const v = merged[k];
    if (v) params.set(k, v);
  });
  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

const rowBase =
  "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition";

export function FiltersBar({
  categories,
  brands,
  current,
}: {
  categories: Category[];
  brands: string[];
  current: Current;
}) {
  const hasFilters =
    !!current.category || !!current.brand || !!current.min || !!current.max || !!current.q;

  return (
    <aside className="space-y-4 lg:sticky lg:top-44">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">Filtros</h2>
        {hasFilters && (
          <Link href="/shop" className="text-xs font-semibold text-brand-600 hover:underline">
            Limpiar
          </Link>
        )}
      </div>

      {/* Categorías */}
      <div className="rounded-2xl border border-surface-border/70 bg-white p-3">
        <p className="px-3 pb-1 pt-1 text-xs font-bold uppercase tracking-wide text-ink-muted">Categorías</p>
        <Link
          href={buildHref(current, { category: undefined })}
          className={`${rowBase} ${!current.category ? "bg-brand-50 font-semibold text-brand-600" : "text-ink-soft hover:bg-surface-subtle"}`}
        >
          Todas
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={buildHref(current, { category: c.slug })}
            className={`${rowBase} ${current.category === c.slug ? "bg-brand-50 font-semibold text-brand-600" : "text-ink-soft hover:bg-surface-subtle"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* Marcas */}
      {brands.length > 0 && (
        <div className="rounded-2xl border border-surface-border/70 bg-white p-3">
          <p className="px-3 pb-1 pt-1 text-xs font-bold uppercase tracking-wide text-ink-muted">Marcas</p>
          <div className="max-h-60 overflow-y-auto">
            <Link
              href={buildHref(current, { brand: undefined })}
              className={`${rowBase} ${!current.brand ? "bg-brand-50 font-semibold text-brand-600" : "text-ink-soft hover:bg-surface-subtle"}`}
            >
              Todas
            </Link>
            {brands.map((b) => (
              <Link
                key={b}
                href={buildHref(current, { brand: b })}
                className={`${rowBase} ${current.brand === b ? "bg-brand-50 font-semibold text-brand-600" : "text-ink-soft hover:bg-surface-subtle"}`}
              >
                {b}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Precio */}
      <form method="get" action="/shop" className="rounded-2xl border border-surface-border/70 bg-white p-4">
        <p className="pb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Precio (S/)</p>
        {current.q && <input type="hidden" name="q" value={current.q} />}
        {current.category && <input type="hidden" name="category" value={current.category} />}
        {current.brand && <input type="hidden" name="brand" value={current.brand} />}
        {current.sort && <input type="hidden" name="sort" value={current.sort} />}
        <div className="flex items-center gap-2">
          <input
            name="min"
            type="number"
            min={0}
            defaultValue={current.min ?? ""}
            placeholder="Mín"
            className="w-full rounded-lg border border-surface-border px-2.5 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          />
          <span className="text-ink-muted">—</span>
          <input
            name="max"
            type="number"
            min={0}
            defaultValue={current.max ?? ""}
            placeholder="Máx"
            className="w-full rounded-lg border border-surface-border px-2.5 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <button type="submit" className="mt-3 w-full rounded-lg bg-brand-500 py-2 text-sm font-semibold text-white transition hover:bg-brand-600">
          Aplicar
        </button>
      </form>
    </aside>
  );
}
