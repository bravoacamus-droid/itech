"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { markCertUploaded } from "@/app/facturacion/actions";

export function CertUpload({ uploaded }: { uploaded: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const supabase = createClient();
      // se guarda con nombre fijo en bucket privado (solo staff / server)
      const { error } = await supabase.storage
        .from("sunat-certs")
        .upload("certificado.pfx", file, { upsert: true, contentType: "application/x-pkcs12" });
      if (error) throw error;
      await markCertUploaded();
      setMsg("Certificado cargado de forma segura.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo subir el certificado");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-surface-border/70 bg-white p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
        Certificado digital
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        Sube tu certificado <strong>.pfx / .p12</strong>. Se guarda en un bucket
        privado (no accesible públicamente) y solo se usa en el servidor para firmar.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            uploaded ? "bg-success/10 text-success" : "bg-warning/15 text-[#9a6a00]"
          }`}
        >
          {uploaded ? "Certificado cargado" : "Sin certificado"}
        </span>
      </div>
      <input
        type="file"
        accept=".pfx,.p12,application/x-pkcs12"
        onChange={onFile}
        disabled={busy}
        className="mt-4 block w-full text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-600 hover:file:bg-brand-100"
      />
      {busy && <p className="mt-2 text-xs text-brand-600">Subiendo…</p>}
      {msg && <p className="mt-2 text-xs text-success">{msg}</p>}
      {err && <p className="mt-2 text-xs text-danger">{err}</p>}
      <p className="mt-3 text-xs text-ink-muted">
        La <strong>clave del certificado</strong> y la <strong>clave SOL</strong> se
        configuran como variables de servidor (<code>SUNAT_CERT_PASSWORD</code>,{" "}
        <code>SUNAT_SOL_PASSWORD</code>), nunca en la base de datos.
      </p>
    </div>
  );
}
