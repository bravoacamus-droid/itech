import { createClient } from "@/lib/supabase/server";
import { WHATSAPP_NUMBER } from "@/lib/config";

type SettingRow = { key: string; value: string | null };

/** Devuelve un mapa con la configuración pública de la tienda. */
export async function getSettings(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .returns<SettingRow[]>();
  const map: Record<string, string> = {};
  (data ?? []).forEach((r) => {
    if (r.value != null) map[r.key] = r.value;
  });
  return map;
}

export async function getWhatsappNumber(): Promise<string> {
  const map = await getSettings();
  return map.whatsapp_number || WHATSAPP_NUMBER;
}
