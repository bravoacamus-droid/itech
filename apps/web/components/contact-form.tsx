"use client";

import { useState } from "react";

const field =
  "w-full rounded-xl border border-surface-border px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200";
const label = "mb-1 block text-sm font-medium text-ink";

export function ContactForm({ wa }: { wa: string }) {
  const [sent, setSent] = useState(false);

  function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "");
    const email = String(fd.get("email") ?? "");
    const msg = String(fd.get("message") ?? "");
    const text = `Hola iTech, soy ${name}${email ? ` (${email})` : ""}.%0A${encodeURIComponent(msg)}`;
    setSent(true);
    window.open(`https://wa.me/${wa}?text=${text}`, "_blank");
  }

  return (
    <form onSubmit={handle} className="rounded-2xl border border-surface-border/70 bg-white p-6">
      <h2 className="text-lg font-bold text-ink">Escríbenos</h2>
      <p className="mt-1 text-sm text-ink-muted">Completa el formulario y continúa por WhatsApp.</p>
      <div className="mt-5 grid gap-4">
        <div>
          <label className={label}>Nombre *</label>
          <input name="name" required className={field} placeholder="Tu nombre" />
        </div>
        <div>
          <label className={label}>Correo (opcional)</label>
          <input name="email" type="email" className={field} placeholder="tucorreo@ejemplo.com" />
        </div>
        <div>
          <label className={label}>Mensaje *</label>
          <textarea name="message" required rows={4} className={field} placeholder="¿En qué te ayudamos?" />
        </div>
        <button type="submit" className="rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">
          Enviar por WhatsApp
        </button>
        {sent && <p className="text-xs text-success">Abrimos WhatsApp con tu mensaje ✓</p>}
      </div>
    </form>
  );
}
