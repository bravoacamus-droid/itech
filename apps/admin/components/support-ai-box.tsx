"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@itech/ui";
import { createClient } from "@/lib/supabase/client";

type Triage = { priority: string; category: string; summary: string };

export function SupportAiBox({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [triaging, setTriaging] = useState(false);
  const [triage, setTriage] = useState<Triage | null>(null);
  const [error, setError] = useState("");

  async function callAi(action: string) {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ticketId }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || "Error de IA");
    }
    return res.json();
  }

  async function suggest() {
    setSuggesting(true);
    setError("");
    try {
      const d = await callAi("suggest_reply");
      setBody(d.text ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSuggesting(false);
    }
  }

  async function runTriage() {
    setTriaging(true);
    setError("");
    try {
      const d = await callAi("triage");
      setTriage(d.triage ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setTriaging(false);
    }
  }

  async function send() {
    if (!body.trim()) return;
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("add_support_message" as never, {
        p_ticket: ticketId,
        p_body: body.trim(),
      } as never);
      if (error) throw error;
      setBody("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 border-t border-surface-border/70 pt-4">
      <div className="mb-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={suggest}
          disabled={suggesting}
          className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-100 disabled:opacity-60"
        >
          {suggesting ? "Generando…" : "✦ Sugerir respuesta (IA)"}
        </button>
        <button
          type="button"
          onClick={runTriage}
          disabled={triaging}
          className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-100 disabled:opacity-60"
        >
          {triaging ? "Analizando…" : "✦ Triage IA"}
        </button>
      </div>

      {triage && (
        <div className="mb-3 rounded-xl bg-surface-subtle p-3 text-xs">
          <p><span className="font-semibold">Prioridad sugerida:</span> {triage.priority}</p>
          <p><span className="font-semibold">Categoría:</span> {triage.category}</p>
          <p><span className="font-semibold">Resumen:</span> {triage.summary}</p>
        </div>
      )}

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Escribe una respuesta o genera una con IA…"
        className="w-full rounded-xl border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      <div className="mt-2">
        <Button onClick={send} disabled={loading || !body.trim()}>
          {loading ? "Enviando…" : "Enviar respuesta"}
        </Button>
      </div>
    </div>
  );
}
