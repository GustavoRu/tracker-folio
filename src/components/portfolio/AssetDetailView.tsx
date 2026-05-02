"use client";

import { useTranslations } from "next-intl";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { TransactionList } from "./TransactionList";
import type { Holding } from "@/lib/portfolio";
import type { PriceInfo } from "@/hooks/usePortfolioPrices";

interface TransactionRow {
  id: string;
  type: "buy" | "sell";
  quantity: number;
  price_per_unit: number;
  currency: string;
  notes: string | null;
  transacted_at: string;
  assets: {
    symbol: string;
    name: string;
  };
}

interface AssetDetailViewProps {
  holding: Holding;
  priceInfo: PriceInfo | undefined;
  dolarBlueVenta: number;
  transactions: TransactionRow[];
  onBack: () => void;
}

export function AssetDetailView({
  holding,
  priceInfo,
  dolarBlueVenta,
  transactions,
  onBack,
}: AssetDetailViewProps) {
  const t = useTranslations("holdings");

  const currentPrice = priceInfo?.currentPrice ?? 0;
  const priceCurrency = priceInfo?.currency ?? "USD";

  let valueUSD: number;
  if (priceCurrency === "ARS" && dolarBlueVenta > 0) {
    valueUSD = (holding.quantity * currentPrice) / dolarBlueVenta;
  } else {
    valueUSD = holding.quantity * currentPrice;
  }

  let costUSD: number;
  if (holding.costCurrency === "ARS" && dolarBlueVenta > 0) {
    costUSD = holding.totalCost / dolarBlueVenta;
  } else {
    costUSD = holding.totalCost;
  }

  const pnlUSD = valueUSD - costUSD;
  const pnlPct = costUSD > 0 ? ((valueUSD - costUSD) / costUSD) * 100 : 0;
  const isGain = pnlPct >= 0;
  const pnlColor = isGain ? "text-gain" : "text-loss";

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground">{holding.symbol}</h2>
          <p className="text-sm text-muted-foreground">{holding.name}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Current Price */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("currentPrice")}</p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
            {currentPrice > 0 ? formatCurrency(currentPrice, priceCurrency) : "-"}
          </p>
        </div>

        {/* Quantity */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("quantityLabel")}</p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
            {holding.quantity.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 8,
            })}
          </p>
        </div>

        {/* Current Value */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("currentValue")}</p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
            {formatCurrency(valueUSD, "USD")}
          </p>
        </div>

        {/* Total Cost */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("totalCost")}</p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
            {formatCurrency(costUSD, "USD")}
          </p>
        </div>

        {/* Avg Cost */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("avgCost")}</p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
            {formatCurrency(holding.avgCostPerUnit, holding.costCurrency)}
          </p>
        </div>

        {/* P&L */}
        <div className={`rounded-xl border border-border p-4 border-l-4 ${isGain ? "border-l-gain bg-gain/5" : "border-l-loss bg-loss/5"}`}>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("pnl")}</p>
          <p className={`mt-1 font-mono text-lg font-semibold tabular-nums ${pnlColor}`}>
            {formatPercent(pnlPct)}
          </p>
          <p className={`font-mono text-sm tabular-nums ${pnlColor}`}>
            {pnlUSD >= 0 ? "+" : "-"}{formatCurrency(Math.abs(pnlUSD), "USD")}
          </p>
        </div>
      </div>

      {/* Transactions for this asset */}
      <div>
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t("assetTransactions")}
        </h3>
        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
}
