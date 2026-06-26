"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo, Button } from "@itech/ui";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "signing" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("signing");
    setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.replace("/");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error
          ? "Credenciales inválidas. Verifica tu correo y contraseña."
          : "Ocurrió un error.",
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-subtle p-4">
      <div className="w-full max-w-sm rounded-2xl border border-surface-border/70 bg-white p-8 shadow-card">
        <div className="mb-6 flex justify-center">
          <Logo height={40} />
        </div>
        <h1 className="text-center text-xl font-bold text-ink">
          Panel administrativo
        </h1>
        <p className="mt-1 text-center text-sm text-ink-muted">
          Ingresa con tu cuenta de administrador
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@itech.pe"
            className="w-full rounded-xl border border-surface-border px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full rounded-xl border border-surface-border px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          />
          <Button type="submit" className="w-full" disabled={status === "signing"}>
            {status === "signing" ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-danger">{message}</p>
        )}
      </div>
    </main>
  );
}
