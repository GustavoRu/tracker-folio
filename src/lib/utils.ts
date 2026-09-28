import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  currency: "USD" | "ARS" = "USD",
  locale = "en-US"
): string {
  // Sub-unit prices need extra decimals, but zero should never render as $0.0000
  const small = value !== 0 && Math.abs(value) < 1;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: small ? 4 : 2,
    maximumFractionDigits: small ? 6 : 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  }).format(value);
}

// "ARS 1,234,567.89" does not fit on mobile: shorten the prefix, go compact when huge
export function formatCurrencyCompact(value: number, currency: "USD" | "ARS"): string {
  const prefix = currency === "ARS" ? "AR$" : "$";

  if (Math.abs(value) >= 100_000) {
    return `${prefix}${formatCompact(value)}`;
  }

  const small = value !== 0 && Math.abs(value) < 1;
  return (
    prefix +
    value.toLocaleString("en-US", {
      minimumFractionDigits: small ? 4 : 2,
      maximumFractionDigits: small ? 6 : 2,
    })
  );
}
