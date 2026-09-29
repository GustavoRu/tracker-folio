"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import { TransactionList } from "./TransactionList";
import { breakEvenPrice, computeHoldingPnl, isCashLike, type Holding } from "@/lib/portfolio";
import { AssetIcon } from "@/components/ui/AssetIcon";
import { ChangeIndicator } from "./ChangeIndicator";
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
  iconUrl?: string | null;
  dolarBlueVenta: number;
  transactions: TransactionRow[];
  onBack: () => void;
}

const SELL_FRACTIONS = [0.25, 0.5, 0.75, 1] as const;

function formatQuantity(quantity: number): string {
  return quantity.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
}

function formatSigned(value: number): string {
  return `${value >= 0 ? "+" : "-"}${formatCurrency(Math.abs(value), "USD")}`;
}

function pnlColor(value: number): string {
  return value >= 0 ? "text-gain" : "text-loss";
}

function Stat({ label, children, sub }: { label: string; children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 truncate font-mono text-[15px] font-semibold tabular-nums text-foreground">
        {children}
      </p>
      {sub && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function AssetDetailView({
  holding,
  priceInfo,
  iconUrl,
  dolarBlueVenta,
  transactions,
  onBack,
}: AssetDetailViewProps) {
  const t = useTranslations("holdings");
  const [sellFraction, setSellFraction] = useState<number>(1);

  const currentPrice = priceInfo?.currentPrice ?? 0;
  const priceCurrency = priceInfo?.currency ?? "USD";

  const pnl = computeHoldingPnl(holding, priceInfo, dolarBlueVenta);
  const unrealizedPct =
    pnl.costBasisUSD > 0 && !pnl.isClosed ? (pnl.unrealizedPnl / pnl.costBasisUSD) * 100 : 0;
  const breakEven = breakEvenPrice(holding);
  const showBreakEven = !pnl.isClosed && pnl.realizedPnl !== 0;

  // Selling at the current price turns that share of unrealized P&L into realized
  const canSimulate = !pnl.isClosed && currentPrice > 0 && !isCashLike(holding);
  const simGain = pnl.unrealizedPnl * sellFraction;

  return (
    <div className="space-y-6">
      {/* Header: back, asset, live price */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("back")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </button>
        <AssetIcon
          iconUrl={iconUrl}
          symbol={holding.symbol}
          name={holding.name}
          className="h-9 w-9"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold text-foreground">{holding.symbol}</h2>
          <p className="truncate text-xs text-muted-foreground">{holding.name}</p>
        </div>
        {currentPrice > 0 && (
          <div className="shrink-0 text-right">
            <p className="font-mono text-base font-semibold tabular-nums text-foreground">
              {formatCurrency(currentPrice, priceCurrency)}
            </p>
            <p className="text-xs">
              <ChangeIndicator value={priceInfo?.change24h ?? null} />{" "}
              <span className="text-muted-foreground">{t("change24h")}</span>
            </p>
          </div>
        )}
      </div>

      {/* One CoinGecko-style position card instead of a grid of boxes */}
      <section className="rounded-xl border border-border bg-card">
        <h3 className="px-4 pt-4 text-sm font-medium text-muted-foreground">{t("myPosition")}</h3>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 sm:grid-cols-3">
          <Stat label={t("currentValue")}>
            {pnl.isClosed ? "—" : formatCurrency(pnl.valueUSD, "USD")}
          </Stat>
          <Stat label={t("quantityLabel")}>
            {formatQuantity(holding.quantity)} {holding.symbol}
          </Stat>
          <Stat label={t("totalCost")}>
            {pnl.isClosed ? "—" : formatCurrency(pnl.costBasisUSD, "USD")}
          </Stat>
          <Stat
            label={t("avgCost")}
            sub={
              showBreakEven && (
                <span title={t("breakEvenHint")}>
                  {t("breakEven")}{" "}
                  <span className="font-mono tabular-nums text-foreground/80">
                    {formatCurrency(breakEven, holding.costCurrency)}
                  </span>
                </span>
              )
            }
          >
            {formatCurrency(holding.avgCostPerUnit, holding.costCurrency)}
          </Stat>
          <Stat
            label={t("unrealizedPnl")}
            sub={!pnl.isClosed && <span className="font-mono tabular-nums">{formatPercent(unrealizedPct)}</span>}
          >
            {pnl.isClosed ? (
              "—"
            ) : (
              <span className={pnlColor(pnl.unrealizedPnl)}>{formatSigned(pnl.unrealizedPnl)}</span>
            )}
          </Stat>
          <Stat label={t("realizedPnl")}>
            <span className={pnl.realizedPnl === 0 ? undefined : pnlColor(pnl.realizedPnl)}>
              {formatSigned(pnl.realizedPnl)}
            </span>
          </Stat>
        </div>

        <div className="flex items-baseline justify-between gap-3 border-t border-border px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("totalPnl")}
          </p>
          <p className={cn("font-mono text-lg font-bold tabular-nums", pnlColor(pnl.pnlAbsolute))}>
            {formatSigned(pnl.pnlAbsolute)}{" "}
            <span className="text-sm font-semibold">({formatPercent(pnl.pnlPct)})</span>
          </p>
        </div>

        {canSimulate && (
          <div className="border-t border-border p-4">
            {/* Capped width keeps label and value scannable on desktop */}
            <div className="sm:max-w-md">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t("sellSimulator")}
                </p>
                <div className="flex gap-1 rounded-lg bg-muted p-0.5">
                  {SELL_FRACTIONS.map((fraction) => (
                    <button
                      key={fraction}
                      type="button"
                      aria-pressed={sellFraction === fraction}
                      onClick={() => setSellFraction(fraction)}
                      className={cn(
                        "rounded-md px-2.5 py-1 font-mono text-xs tabular-nums transition-colors",
                        sellFraction === fraction
                          ? "bg-accent font-semibold text-white"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {fraction * 100}%
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                {t("simUnits", {
                  quantity: formatQuantity(holding.quantity * sellFraction),
                  symbol: holding.symbol,
                })}
              </p>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{t("simProceeds")}</dt>
                  <dd className="font-mono tabular-nums text-foreground">
                    {formatCurrency(pnl.valueUSD * sellFraction, "USD")}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{t("simGain")}</dt>
                  <dd className={cn("font-mono tabular-nums", pnlColor(simGain))}>
                    {formatSigned(simGain)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{t("simRealizedAfter")}</dt>
                  <dd className={cn("font-mono tabular-nums", pnlColor(pnl.realizedPnl + simGain))}>
                    {formatSigned(pnl.realizedPnl + simGain)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </section>

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
