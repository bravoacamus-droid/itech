"use client";

import { useState } from "react";
import { Button } from "@itech/ui";

type Result = { ready: boolean; missing: string[]; message: string; environment: string };

export function SunatSendButton({ invoiceId }: { invoiceId: string }) {
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<Result | null>(null);

  async function check() {
    setLoading(true);
    try {
      const r = await fetch("/api/sunat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      setRes(await r.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={check} disabled={loading}>
        {loading ? "Verificando…" : "Enviar a SUNAT"}
      </Button>
      {res && (
        <div className="mt-3 rounded-xl bg-surface-subtle p-3 text-xs">
          <p className={res.ready ? "font-semibold text-success" : "font-semibold text-[#9a6a00]"}>
            {res.message} (ambiente: {res.environment})
          </p>
          {!res.ready && res.missing?.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-ink-soft">
              {res.missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
