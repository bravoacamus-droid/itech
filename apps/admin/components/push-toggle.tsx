"use client";

import { useEffect, useState } from "react";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

type State = "loading" | "unsupported" | "off" | "on" | "denied" | "working";

export function PushToggle() {
  const [state, setState] = useState<State>("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !PUBLIC_KEY) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? "on" : "off"))
      .catch(() => setState("off"));
  }, []);

  async function enable() {
    setState("working");
    setMsg("");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState(perm === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY!),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      if (!res.ok) throw new Error("No se pudo guardar la suscripción");
      setState("on");
      setMsg("Avisos activados ✔");
    } catch (e) {
      setState("off");
      setMsg(e instanceof Error ? e.message : "Error al activar");
    }
  }

  async function disable() {
    setState("working");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
      setMsg("Avisos desactivados");
    } catch {
      setState("on");
    }
  }

  async function test() {
    setMsg("Enviando prueba…");
    const res = await fetch("/api/push/test");
    const j = await res.json().catch(() => ({}));
    setMsg(j?.enviadas ? `Prueba enviada (${j.enviadas})` : "No hay dispositivos suscritos");
  }

  if (state === "loading") return null;

  return (
    <div className="rounded-2xl border border-surface-border/70 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">Notificaciones push</h3>
          <p className="text-xs text-ink-muted">
            {state === "unsupported" && "Tu navegador no soporta push (o falta configurar VAPID)."}
            {state === "denied" && "Permiso bloqueado. Habilítalo en los ajustes del navegador."}
            {state === "off" && "Recibe avisos (transferencias, stock bajo) en este dispositivo."}
            {state === "on" && "Activadas en este dispositivo."}
            {state === "working" && "Procesando…"}
          </p>
          {msg && <p className="mt-1 text-xs text-brand-600">{msg}</p>}
        </div>
        <div className="flex gap-2">
          {state === "off" && (
            <button onClick={enable} className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
              Activar avisos
            </button>
          )}
          {state === "on" && (
            <>
              <button onClick={test} className="rounded-xl border border-brand-200 px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50">
                Probar
              </button>
              <button onClick={disable} className="rounded-xl border border-surface-border px-3 py-2 text-sm font-medium text-ink-soft hover:bg-surface-subtle">
                Desactivar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
