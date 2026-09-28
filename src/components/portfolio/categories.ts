import type { AssetCategory } from "@/types/quote";

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  crypto: "Crypto",
  stock: "Stock",
  cedear: "CEDEAR",
  dolar: "Dolar",
};

export const CATEGORY_BADGE_STYLES: Record<AssetCategory, string> = {
  crypto: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  stock: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  cedear: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  dolar: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

// Chart fills share the badge hues, stepped per theme in globals.css
export const CATEGORY_COLORS: Record<AssetCategory, string> = {
  crypto: "var(--cat-crypto)",
  stock: "var(--cat-stock)",
  cedear: "var(--cat-cedear)",
  dolar: "var(--cat-dolar)",
};

// Keys into the "categories" message namespace
export const CATEGORY_MESSAGE_KEYS: Record<AssetCategory, string> = {
  crypto: "crypto",
  stock: "stocks",
  cedear: "cedears",
  dolar: "dolar",
};
