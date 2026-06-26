import { money } from "@/lib/metrics";

export function SalesChart({
  data,
}: {
  data: { day: string; total: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => Number(d.total)));
  const totalRange = data.reduce((s, d) => s + Number(d.total), 0);

  return (
    <div className="rounded-2xl border border-surface-border/70 bg-white p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-ink">
          Ventas por día (14 días)
        </h2>
        <span className="text-xs text-ink-muted">
          Total: {money(totalRange)}
        </span>
      </div>

      {totalRange === 0 ? (
        <p className="py-8 text-center text-sm text-ink-muted">
          Aún no hay ventas en este período.
        </p>
      ) : (
        <div className="flex h-40 items-stretch gap-1.5">
          {data.map((d) => {
            const v = Number(d.total);
            const h = Math.round((v / max) * 100);
            const date = new Date(d.day + "T00:00:00");
            const label = date.toLocaleDateString("es-PE", {
              day: "2-digit",
              month: "2-digit",
            });
            return (
              <div
                key={d.day}
                className="group flex h-full flex-1 flex-col items-center justify-end"
                title={`${label}: ${money(v)}`}
              >
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-brand-gradient transition-all group-hover:opacity-80"
                    style={{ height: `${v > 0 ? Math.max(3, h) : 0}%` }}
                  />
                </div>
                <span className="mt-1 text-[9px] text-ink-muted">
                  {label.slice(0, 5)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
