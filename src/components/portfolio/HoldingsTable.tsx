"use client";

import { useTranslations } from "next-intl";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { Holding } from "@/lib/portfolio";
import type { PriceInfo } from "@/hooks/usePortfolioPrices";

const CATEGORY_LABELS: Record<string, string> = {
  crypto: "Crypto",
  stock: "Stock",
  cedear: "CEDEAR",
  dolar: "Dolar",
};

const CATEGORY_BADGE_STYLES: Record<string, string> = {
  crypto: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  stock: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  cedear: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  dolar: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

interface HoldingsTableProps {
  holdings: Holding[];
  priceMap: Map<string, PriceInfo>;
  dolarBlueVenta: number;
  isLoading: boolean;
  onSelectAsset?: (symbol: string) => void;
}

export function HoldingsTable({
  holdings,
  priceMap,
  dolarBlueVenta,
  isLoading,
  onSelectAsset,
}: HoldingsTableProps) {
  const t = useTranslations("holdings");

  if (isLoading) {
    return (
      <div className="h-48 animate-pulse rounded-xl border border-border bg-card" />
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-muted-foreground">{t("noHoldings")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-3">{t("asset")}</th>
            <th className="px-6 py-3">{t("category")}</th>
            <th className="px-6 py-3 text-right">{t("quantity")}</th>
            <th className="px-6 py-3 text-right">{t("avgCost")}</th>
            <th className="px-6 py-3 text-right">{t("currentPrice")}</th>
            <th className="px-6 py-3 text-right">{t("valueUSD")}</th>
            <th className="px-6 py-3 text-right">{t("valueARS")}</th>
            <th className="px-6 py-3 text-right">{t("pnl")}</th>
            <th className="px-6 py-3 text-right">{t("pnlUSD")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {holdings.map((h) => {
            const price = priceMap.get(h.symbol);
            const currentPrice = price?.currentPrice ?? 0;
            const priceCurrency = price?.currency ?? "USD";

            let valueUSD: number;
            if (priceCurrency === "ARS" && dolarBlueVenta > 0) {
              valueUSD = (h.quantity * currentPrice) / dolarBlueVenta;
            } else {
              valueUSD = h.quantity * currentPrice;
            }

            const valueARS = valueUSD * dolarBlueVenta;

            let costUSD: number;
            if (h.costCurrency === "ARS" && dolarBlueVenta > 0) {
              costUSD = h.totalCost / dolarBlueVenta;
            } else {
              costUSD = h.totalCost;
            }

            const pnlPct = costUSD > 0 ? ((valueUSD - costUSD) / costUSD) * 100 : 0;
            const isGain = pnlPct >= 0;
            const pnlColor = isGain ? "text-gain" : "text-loss";
            const pnlAbsolute = valueUSD - costUSD;
            const badgeStyle = CATEGORY_BADGE_STYLES[h.category] ?? "bg-muted text-muted-foreground";

            return (
              <tr
                key={h.symbol}
                onClick={() => onSelectAsset?.(h.symbol)}
                className={`transition-colors hover:bg-card-hover ${onSelectAsset ? "cursor-pointer" : ""}`}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-foreground">{h.symbol}</p>
                    <p className="text-xs text-muted-foreground">{h.name}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${badgeStyle}`}>
                    {CATEGORY_LABELS[h.category] ?? h.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono font-medium tabular-nums text-foreground">
                  {h.quantity.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 8,
                  })}
                </td>
                <td className="px-6 py-4 text-right font-mono text-sm tabular-nums text-muted-foreground">
                  {formatCurrency(h.avgCostPerUnit, h.costCurrency)}
                </td>
                <td className="px-6 py-4 text-right font-mono text-sm tabular-nums text-foreground">
                  {currentPrice > 0
                    ? formatCurrency(currentPrice, priceCurrency)
                    : "-"}
                </td>
                <td className="px-6 py-4 text-right font-mono font-medium tabular-nums text-foreground">
                  {formatCurrency(valueUSD, "USD")}
                </td>
                <td className="px-6 py-4 text-right font-mono text-sm tabular-nums text-muted-foreground">
                  {dolarBlueVenta > 0 ? formatCurrency(valueARS, "ARS") : "-"}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-sm font-medium tabular-nums ${isGain ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"}`}>
                    {formatPercent(pnlPct)}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-mono font-medium tabular-nums ${pnlColor}`}>
                  {pnlAbsolute >= 0 ? "+" : "-"}
                  {formatCurrency(Math.abs(pnlAbsolute), "USD")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
