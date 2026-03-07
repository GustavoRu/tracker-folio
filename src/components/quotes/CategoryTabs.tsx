"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { AssetCategory } from "@/types/quote";

const CATEGORIES: AssetCategory[] = ["crypto", "stock", "cedear", "dolar"];

const CATEGORY_KEYS: Record<AssetCategory, string> = {
  crypto: "crypto",
  stock: "stocks",
  cedear: "cedears",
  dolar: "dolar",
};

interface CategoryTabsProps {
  active: AssetCategory;
  onChange: (category: AssetCategory) => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  const t = useTranslations("categories");

  return (
    <div className="flex gap-1 rounded-xl bg-muted p-1">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-all",
            active === cat
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t(CATEGORY_KEYS[cat])}
        </button>
      ))}
    </div>
  );
}
