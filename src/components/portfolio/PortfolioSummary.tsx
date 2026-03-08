"use client";

import { useTranslations } from "next-intl";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { Holding } from "@/lib/portfolio";
import type { PriceInfo } from "@/hooks/usePortfolioPrices";

interface PortfolioSummaryProps {
  holdings: Holding[];
  priceMap: Map<string, PriceInfo>;
  dolarBlueVenta: number;
  isLoading: boolean;
}

function computeTotals(
  holdings: Holding[],
  priceMap: Map<string, PriceInfo>,
  dolarBlueVenta: number
) {
  let totalValueUSD = 0;
  let totalCostUSD = 0;

  for (const h of holdings) {
    const price = priceMap.get(h.symbol);
    if (!price) continue;

    // Current value in USD
    let valueUSD: number;
    if (price.currency === "ARS" && dolarBlueVenta > 0) {
      valueUSD = (h.quantity * price.currentPrice) / dolarBlueVenta;
    } else {
      valueUSD = h.quantity * price.currentPrice;
    }
    totalValueUSD += valueUSD;

    // Cost in USD
    let costUSD: number;
    if (h.costCurrency === "ARS" && dolarBlueVenta > 0) {
      costUSD = h.totalCost / dolarBlueVenta;
    } else {
      costUSD = h.totalCost;
    }
    totalCostUSD += costUSD;
  }

  const totalValueARS = totalValueUSD * dolarBlueVenta;
  const pnl = totalCostUSD > 0 ? ((totalValueUSD - totalCostUSD) / totalCostUSD) * 100 : 0;
  const pnlAbsolute = totalValueUSD - totalCostUSD;

  return { totalValueUSD, totalValueARS, totalCostUSD, pnl, pnlAbsolute };
}

export function PortfolioSummary({
  holdings,
  priceMap,
  dolarBlueVenta,
  isLoading,
}: PortfolioSummaryProps) {
  const t = useTranslations("holdings");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </div>
    );
  }

  const { totalValueUSD, totalValueARS, pnl, pnlAbsolute } = computeTotals(
    holdings,
    priceMap,
    dolarBlueVenta
  );

  const pnlColor = pnl >= 0 ? "text-gain" : "text-loss";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Total USD */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">{t("totalUSD")}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
          {formatCurrency(totalValueUSD, "USD")}
        </p>
      </div>

      {/* Total ARS */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">{t("totalARS")}</p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
          {formatCurrency(totalValueARS, "ARS")}
        </p>
        {dolarBlueVenta > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {t("blueRate")}: {formatCurrency(dolarBlueVenta, "ARS")}
          </p>
        )}
      </div>

      {/* P&L */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">{t("profitLoss")}</p>
        <p className={`mt-1 text-2xl font-bold tabular-nums ${pnlColor}`}>
          {formatPercent(pnl)}
        </p>
        <p className={`mt-1 text-sm tabular-nums ${pnlColor}`}>
          {pnlAbsolute >= 0 ? "+" : ""}
          {formatCurrency(Math.abs(pnlAbsolute), "USD")}
        </p>
      </div>
    </div>
  );
}
