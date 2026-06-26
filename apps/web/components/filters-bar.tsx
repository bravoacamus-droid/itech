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

const ctrl =
  "rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";

export function FiltersBar({
  categories,
  brands,
  current,
}: {
  categories: Category[];
  brands: string[];
  current: Current;
}) {
  return (
    <form
      method="get"
      action="/shop"
      className="rounded-2xl border border-surface-border/70 bg-white p-4"
    >
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          name="q"
          defaultValue={current.q ?? ""}
          placeholder="Buscar productos, marcas…"
          className={`${ctrl} w-full`}
        />
        <div className="flex flex-wrap gap-3">
          <select name="category" defaultValue={current.category ?? ""} className={ctrl}>
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select name="brand" defaultValue={current.brand ?? ""} className={ctrl}>
            <option value="">Todas las marcas</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <input
            name="min"
            type="number"
            min={0}
            defaultValue={current.min ?? ""}
            placeholder="Mín S/"
            className={`${ctrl} w-24`}
          />
          <input
            name="max"
            type="number"
            min={0}
            defaultValue={current.max ?? ""}
            placeholder="Máx S/"
            className={`${ctrl} w-24`}
          />
          <select name="sort" defaultValue={current.sort ?? "newest"} className={ctrl}>
            <option value="newest">Más recientes</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="name">Nombre (A-Z)</option>
          </select>
          <button
            type="submit"
            className="rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Filtrar
          </button>
          <Link
            href="/shop"
            className="rounded-xl border border-surface-border px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-brand-50"
          >
            Limpiar
          </Link>
        </div>
      </div>
    </form>
  );
}
