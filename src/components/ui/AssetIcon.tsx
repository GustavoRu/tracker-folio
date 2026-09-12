import { cn } from "@/lib/utils";

interface AssetIconProps {
  iconUrl?: string | null;
  symbol: string;
  name?: string;
  className?: string;
}

// Shared asset avatar: remote icon when available, symbol initials otherwise.
export function AssetIcon({ iconUrl, symbol, name, className }: AssetIconProps) {
  const size = cn("h-8 w-8 shrink-0 rounded-full", className);

  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={name ?? symbol}
        className={cn(size, "object-contain")}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={cn(
        size,
        "flex items-center justify-center bg-muted text-xs font-bold uppercase text-muted-foreground"
      )}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}
