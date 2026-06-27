import { NextResponse } from "next/server";
import { generateJson } from "@itech/ai";
import { createClient } from "@/lib/supabase/server";

type Product = {
  slug: string;
  name: string;
  brand: string | null;
  price: number;
  image_url: string | null;
  category: { name: string } | null;
};

export async function POST(request: Request) {
  let query = "";
  try {
    const b = await request.json();
    query = String(b.query ?? "").slice(0, 300);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  if (!query.trim()) {
    return NextResponse.json({ error: "Consulta vacía" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("slug, name, brand, price, image_url, category:categories(name)")
    .eq("is_active", true)
    .limit(100);
  const products = (data ?? []) as unknown as Product[];

  const catalog = products
    .map(
      (p) =>
        `${p.slug} | ${p.name} | ${p.brand ?? "-"} | S/ ${Number(p.price).toFixed(2)} | ${p.category?.name ?? "-"}`,
    )
    .join("\n");

  try {
    const result = await generateJson<{ answer: string; recommendations: string[] }>({
      system:
        "Eres el asistente de compras de iTech Import Perú. Ayudas a elegir productos del " +
        "catálogo. Responde SOLO JSON con: answer (respuesta breve y útil en español, Perú) y " +
        "recommendations (array con hasta 4 slugs EXACTOS del catálogo que mejor encajen). " +
        "Recomienda solo productos del catálogo provisto; si nada encaja, devuelve recommendations vacío " +
        "y sugiere consultar por WhatsApp.",
      prompt: `Catálogo (slug | nombre | marca | precio | categoría):\n${catalog}\n\nConsulta del cliente: "${query}"`,
      temperature: 0.3,
    });

    const bySlug = new Map(products.map((p) => [p.slug, p]));
    const recommended = (result.recommendations ?? [])
      .map((s) => bySlug.get(s))
      .filter(Boolean)
      .slice(0, 4)
      .map((p) => ({
        slug: p!.slug,
        name: p!.name,
        price: p!.price,
        image_url: p!.image_url,
      }));

    return NextResponse.json({ answer: result.answer ?? "", products: recommended });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error de IA" },
      { status: 500 },
    );
  }
}
