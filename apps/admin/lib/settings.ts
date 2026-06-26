import { createClient } from "@/lib/supabase/server";

type SettingRow = { key: string; value: string | null };

export async function getSettingsMap(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .returns<SettingRow[]>();
  const map: Record<string, string> = {};
  (data ?? []).forEach((r) => {
    map[r.key] = r.value ?? "";
  });
  return map;
}
