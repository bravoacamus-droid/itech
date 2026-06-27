import { createClient } from "@/lib/supabase/server";

export type TimeEntry = {
  id: string;
  user_id: string;
  clock_in: string;
  clock_out: string | null;
  employee: string;
  branch: string;
  hours: number | null;
};

export async function listTimeEntries(limit = 100): Promise<TimeEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("time_entries")
    .select("id, user_id, clock_in, clock_out, branches(name)")
    .order("clock_in", { ascending: false })
    .limit(limit);
  const rows = (data ?? []) as unknown as {
    id: string;
    user_id: string;
    clock_in: string;
    clock_out: string | null;
    branches: { name: string } | null;
  }[];

  const ids = Array.from(new Set(rows.map((r) => r.user_id)));
  const names: Record<string, string> = {};
  if (ids.length) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", ids);
    ((profs ?? []) as { id: string; full_name: string | null }[]).forEach((p) => {
      names[p.id] = p.full_name || "—";
    });
  }

  return rows.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    clock_in: r.clock_in,
    clock_out: r.clock_out,
    employee: names[r.user_id] || "—",
    branch: r.branches?.name ?? "—",
    hours: r.clock_out
      ? Math.round(((new Date(r.clock_out).getTime() - new Date(r.clock_in).getTime()) / 3600000) * 100) / 100
      : null,
  }));
}
