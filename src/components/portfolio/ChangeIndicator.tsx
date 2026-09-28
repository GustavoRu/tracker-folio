import { cn, formatCurrency, formatPercent } from "@/lib/utils";

interface ChangeIndicatorProps {
  // Percent change; null when there is no data
  value: number | null;
  // When set, renders "$178.70 (+1.08%)" instead of the bare percent
  amount?: number;
  className?: string;
}

// CoinGecko-style caret + magnitude, colored by direction
export function ChangeIndicator({ value, amount, className }: ChangeIndicatorProps) {
  if (value === null) {
    return <span className={cn("text-muted-foreground", className)}>—</span>;
  }

  const isFlat = Math.abs(value) < 0.005;
  const isUp = value > 0;

  const text =
    amount === undefined
      ? `${Math.abs(value).toFixed(2)}%`
      : `${formatCurrency(Math.abs(amount), "USD")} (${formatPercent(value)})`;

  if (isFlat) {
    return (
      <span className={cn("font-mono tabular-nums text-muted-foreground", className)}>
        {amount === undefined ? "0.00%" : text}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono tabular-nums",
        isUp ? "text-gain" : "text-loss",
        className
      )}
    >
      <svg
        viewBox="0 0 10 10"
        fill="currentColor"
        aria-hidden="true"
        className={cn("h-2 w-2 shrink-0", !isUp && "rotate-180")}
      >
        <path d="M5 1.5 9.5 8.5h-9z" />
      </svg>
      <span className="sr-only">{isUp ? "+" : "-"}</span>
      {text}
    </span>
  );
}
