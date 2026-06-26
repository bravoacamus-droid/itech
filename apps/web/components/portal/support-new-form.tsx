"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const field =
  "w-full rounded-xl border border-surface-border px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";

export function SupportNewForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      const supabase = createClient();
      const { data, error } = await supabase.rpc("create_support_ticket" as never, {
        p_subject: String(fd.get("subject") ?? ""),
        p_priority: String(fd.get("priority") ?? "media"),
        p_body: String(fd.get("body") ?? ""),
      } as never);
      if (error) throw error;
      const row = (Array.isArray(data) ? data[0] : data) as { id?: string } | null;
      router.push(row?.id ? `/portal/soporte/${row.id}` : "/portal");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el ticket");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-surface-border/70 bg-white p-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Asunto *</label>
        <input name="subject" required className={field} placeholder="Ej. Laptop de contabilidad no enciende" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Prioridad</label>
        <select name="priority" defaultValue="media" className={field}>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="urgente">Urgente</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Descripción</label>
        <textarea name="body" rows={4} className={field} placeholder="Describe el problema…" />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
        >
          {loading ? "Creando…" : "Crear ticket"}
        </button>
      </div>
    </form>
  );
}
