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

    let valueUSD: number;
    if (price.currency === "ARS" && dolarBlueVenta > 0) {
      valueUSD = (h.quantity * price.currentPrice) / dolarBlueVenta;
    } else {
      valueUSD = h.quantity * price.currentPrice;
    }
    totalValueUSD += valueUSD;

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

  const isGain = pnl >= 0;
  const pnlColor = isGain ? "text-gain" : "text-loss";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Total USD */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-muted-foreground">
            <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.18.168A9.448 9.448 0 008.33 8.62zm1.47 0l.003.001a.802.802 0 000-.001zm-.74-.34a3.13 3.13 0 00-.636.344c-.482.315-.612.648-.612.875 0 .227.13.56.612.875.194.127.412.24.636.344V8.28z" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v.26a3.72 3.72 0 00-1.534.499C7.027 7.937 6.5 8.712 6.5 9.625c0 .913.527 1.688 1.216 2.116.459.283.978.465 1.534.55v2.828a3.72 3.72 0 01-1.534-.499.75.75 0 00-.732 1.307 5.22 5.22 0 002.266.706v.087a.75.75 0 001.5 0v-.087a5.22 5.22 0 002.266-.706.75.75 0 10-.732-1.307 3.72 3.72 0 01-1.534.499V12.29c.556-.085 1.075-.267 1.534-.55.689-.428 1.216-1.203 1.216-2.116 0-.913-.527-1.688-1.216-2.116A5.22 5.22 0 0010.75 7.01v-.26z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("totalUSD")}</p>
        </div>
        <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-foreground">
          {formatCurrency(totalValueUSD, "USD")}
        </p>
      </div>

      {/* Total ARS */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-muted-foreground">
            <path fillRule="evenodd" d="M1 4a1 1 0 011-1h16a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4zm12 4a3 3 0 11-6 0 3 3 0 016 0zM4 9a1 1 0 100-2 1 1 0 000 2zm13-1a1 1 0 11-2 0 1 1 0 012 0zM1.75 14.5a.75.75 0 000 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 00-1.5 0v.784a.272.272 0 01-.35.25A49.043 49.043 0 001.75 14.5z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("totalARS")}</p>
        </div>
        <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-foreground">
          {formatCurrency(totalValueARS, "ARS")}
        </p>
        {dolarBlueVenta > 0 && (
          <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
            {t("blueRate")}: {formatCurrency(dolarBlueVenta, "ARS")}
          </p>
        )}
      </div>

      {/* P&L */}
      <div className={`rounded-xl border border-border bg-card p-5 border-l-4 ${isGain ? "border-l-gain bg-gain/5" : "border-l-loss bg-loss/5"}`}>
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 ${pnlColor} ${!isGain ? "rotate-180" : ""}`}>
            <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.918z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("profitLoss")}</p>
        </div>
        <p className={`mt-2 font-mono text-2xl font-bold tabular-nums ${pnlColor}`}>
          {formatPercent(pnl)}
        </p>
        <p className={`mt-1 font-mono text-sm tabular-nums ${pnlColor}`}>
          {pnlAbsolute >= 0 ? "+" : ""}
          {formatCurrency(Math.abs(pnlAbsolute), "USD")}
        </p>
      </div>
    </div>
  );
}
