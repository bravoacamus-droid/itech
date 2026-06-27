"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

type Rec = { slug: string; name: string; price: number; image_url: string | null };

const SUGGESTIONS = [
  "Necesito una laptop para la oficina",
  "¿Qué SSD me recomiendas para acelerar mi PC?",
  "Busco una impresora económica",
];

export function ShoppingAssistant() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [products, setProducts] = useState<Rec[]>([]);
  const [error, setError] = useState("");
  const [asked, setAsked] = useState(false);

  async function ask(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    setAsked(true);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Error");
      setAnswer(d.answer ?? "");
      setProducts(d.products ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-surface-border/70 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-bold text-ink">Pregúntale al asistente</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Cuéntanos qué necesitas y te recomendamos productos de la tienda.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(query);
          }}
          className="mt-5 flex gap-2"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej. una laptop para diseño hasta S/3000"
            className="w-full rounded-xl border border-surface-border px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {loading ? "Pensando…" : "Preguntar"}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuery(s);
                ask(s);
              }}
              className="rounded-full bg-surface-subtle px-3 py-1 text-xs text-ink-soft transition hover:bg-brand-50 hover:text-brand-600"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-4 text-center text-sm text-danger">{error}</p>}

      {asked && !loading && !error && (
        <div className="mt-6 space-y-5">
          {answer && (
            <div className="rounded-2xl border border-surface-border/70 bg-white p-5 text-sm text-ink">
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-brand-600">
                Asistente iTech
              </div>
              <p className="whitespace-pre-wrap">{answer}</p>
            </div>
          )}
          {products.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {products.map((p) => (
                <Link
                  key={p.slug}
                  href={`/producto/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-surface-border/70 bg-white transition hover:shadow-soft"
                >
                  <div className="flex h-32 items-center justify-center bg-white p-3">
                    {p.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.name} className="max-h-28 w-auto object-contain" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-3">
                    <h3 className="line-clamp-2 text-xs font-medium text-ink">{p.name}</h3>
                    <span className="mt-auto text-sm font-bold text-brand-600">
                      {formatPrice(p.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
