"use client";

import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { computePortfolioTotals, type Holding } from "@/lib/portfolio";
import type { PriceInfo } from "@/hooks/usePortfolioPrices";
import { ChangeIndicator } from "./ChangeIndicator";

interface PortfolioSummaryProps {
  holdings: Holding[];
  priceMap: Map<string, PriceInfo>;
  dolarBlueVenta: number;
  isLoading: boolean;
}

export function PortfolioSummary({
  holdings,
  priceMap,
  dolarBlueVenta,
  isLoading,
}: PortfolioSummaryProps) {
  const t = useTranslations("holdings");

  if (isLoading) {
    // Same footprint as the loaded header so the list below does not jump
    return (
      <div className="mt-1 space-y-2" aria-hidden="true">
        <div className="h-9 w-48 animate-pulse rounded-md bg-muted sm:h-10 sm:w-56" />
        <div className="h-4 w-44 animate-pulse rounded bg-muted" />
        <div className="h-4 w-52 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  const totals = computePortfolioTotals(holdings, priceMap, dolarBlueVenta);

  return (
    <div className="mt-1">
      <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {formatCurrency(totals.totalValueUSD, "USD")}
      </p>
      <div className="mt-2 space-y-1 text-[13px] sm:text-sm">
        <p className="flex flex-wrap items-center gap-x-2">
          <ChangeIndicator value={totals.change24hPct} amount={totals.change24hUSD} />
          <span className="text-muted-foreground">{t("change24hLabel")}</span>
        </p>
        <p className="flex flex-wrap items-center gap-x-2">
          <ChangeIndicator value={totals.pnlPct} amount={totals.pnlAbsolute} />
          <span className="text-muted-foreground">{t("totalPnl")}</span>
        </p>
      </div>
    </div>
  );
}
