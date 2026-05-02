import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/utils";

interface PriceChangeProps {
  value: number | null;
}

export function PriceChange({ value }: PriceChangeProps) {
  if (value === null) {
    return <span className="text-muted-foreground">-</span>;
  }

  const isPositive = value >= 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 font-mono text-sm font-medium",
        isPositive ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className={cn("h-3 w-3", !isPositive && "rotate-180")}
      >
        <path
          fillRule="evenodd"
          d="M8 3.293l4.354 4.354a.5.5 0 01-.708.708L8.5 5.207V12.5a.5.5 0 01-1 0V5.207L4.354 8.354a.5.5 0 11-.708-.708L8 3.293z"
          clipRule="evenodd"
        />
      </svg>
      {formatPercent(value)}
    </span>
  );
}
