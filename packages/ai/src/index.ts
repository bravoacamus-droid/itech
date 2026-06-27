/**
 * Gateway de IA (Gemini) — SOLO servidor.
 * Usa la REST API de Google Generative Language. La key vive en GEMINI_API_KEY
 * (variable de entorno del servidor; nunca exponer al cliente).
 */
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

type GenOptions = {
  system?: string;
  prompt: string;
  temperature?: number;
  json?: boolean;
};

export async function generateText(opts: GenOptions): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Falta GEMINI_API_KEY en el servidor");

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: opts.prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.4,
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
    },
  };
  if (opts.system) {
    body.systemInstruction = { parts: [{ text: opts.system }] };
  }

  const res = await fetch(`${ENDPOINT}/${MODEL}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gemini ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((p) => p.text ?? "")
    .join("")
    .trim();
}

/** Igual que generateText pero parsea JSON de la respuesta. */
export async function generateJson<T = unknown>(opts: GenOptions): Promise<T> {
  const text = await generateText({ ...opts, json: true });
  try {
    return JSON.parse(text) as T;
  } catch {
    // intenta extraer el primer bloque {...}
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]) as T;
    throw new Error("La IA no devolvió JSON válido");
  }
}
