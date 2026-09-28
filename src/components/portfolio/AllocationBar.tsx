import { formatCurrency } from "@/lib/utils";

export interface AllocationItem {
  key: string;
  label: string;
  valueUSD: number;
  percent: number;
  color: string;
}

interface AllocationBarProps {
  // Marks drawn in the bar
  segments: AllocationItem[];
  // Legend rows; may list more entries than the bar draws (e.g. folded "Other")
  legend?: AllocationItem[];
}

// Stacked bar + legend; the legend doubles as the table view of the chart
export function AllocationBar({ segments, legend = segments }: AllocationBarProps) {
  return (
    <div>
      {/* flex-grow keeps proportions exact after the 2px surface gaps */}
      <div className="mb-4 flex h-2.5 gap-0.5 overflow-hidden rounded-full">
        {segments.map((s) => (
          <div
            key={s.key}
            title={`${s.label} · ${s.percent.toFixed(1)}%`}
            style={{ flex: `${s.percent} 1 0%`, backgroundColor: s.color }}
          />
        ))}
      </div>

      <ul className="space-y-2">
        {legend.map((item) => (
          <li key={item.key} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-sm font-medium text-foreground">
                {item.label}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="font-mono text-sm tabular-nums text-foreground">
                {formatCurrency(item.valueUSD, "USD")}
              </span>
              <span className="w-12 text-right font-mono text-xs tabular-nums text-muted-foreground">
                {item.percent.toFixed(1)}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
