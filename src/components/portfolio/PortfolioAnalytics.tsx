"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cn, formatCurrency, formatCurrencyCompact, formatPercent } from "@/lib/utils";
import {
  computeHoldingPnl,
  computePortfolioTotals,
  holdingKey,
  type Holding,
} from "@/lib/portfolio";
import type { PriceInfo } from "@/hooks/usePortfolioPrices";
import type { AssetCategory } from "@/types/quote";
import { AssetIcon } from "@/components/ui/AssetIcon";
import { AllocationChart } from "./AllocationChart";
import { AllocationBar, type AllocationItem } from "./AllocationBar";
import { CATEGORY_COLORS, CATEGORY_MESSAGE_KEYS } from "./categories";

interface PortfolioAnalyticsProps {
  holdings: Holding[];
  priceMap: Map<string, PriceInfo>;
  iconMap: Map<string, string | null>;
  dolarBlueVenta: number;
  isLoading: boolean;
  onSelectAsset: (key: string) => void;
}

function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground/80">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StatTile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function SignedUSD({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("font-mono tabular-nums", value >= 0 ? "text-gain" : "text-loss", className)}>
      {value >= 0 ? "+" : "-"}
      {formatCurrency(Math.abs(value), "USD")}
    </span>
  );
}

export function PortfolioAnalytics({
  holdings,
  priceMap,
  iconMap,
  dolarBlueVenta,
  isLoading,
  onSelectAsset,
}: PortfolioAnalyticsProps) {
  const t = useTranslations("holdings");
  const ct = useTranslations("categories");

  if (isLoading) {
    return (
      <div className="space-y-4" aria-hidden="true">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    );
  }

  const totals = computePortfolioTotals(holdings, priceMap, dolarBlueVenta);

  // Same inclusion rule as the totals: open positions need a price
  const rows = holdings.flatMap((h) => {
    const key = holdingKey(h);
    const price = priceMap.get(key);
    if (h.quantity > 0 && !price) return [];
    return [{ h, key, pnl: computeHoldingPnl(h, price, dolarBlueVenta) }];
  });

  const categoryTotals = new Map<AssetCategory, number>();
  for (const { h, pnl } of rows) {
    if (pnl.valueUSD > 0) {
      categoryTotals.set(h.category, (categoryTotals.get(h.category) ?? 0) + pnl.valueUSD);
    }
  }
  const categoryItems: AllocationItem[] = [...categoryTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, valueUSD]) => ({
      key: category,
      label: ct(CATEGORY_MESSAGE_KEYS[category]),
      valueUSD,
      percent: totals.totalValueUSD > 0 ? (valueUSD / totals.totalValueUSD) * 100 : 0,
      color: CATEGORY_COLORS[category],
    }));

  const performance = rows
    .filter((r) => r.pnl.pnlAbsolute !== 0)
    .sort((a, b) => b.pnl.pnlAbsolute - a.pnl.pnlAbsolute);
  // One linear scale for gains and losses; the zero line sits where the range puts it
  const maxGain = Math.max(0, ...performance.map((r) => r.pnl.pnlAbsolute));
  const maxLoss = Math.max(0, ...performance.map((r) => -r.pnl.pnlAbsolute));
  const pnlSpan = maxGain + maxLoss;
  const zeroPct = pnlSpan > 0 ? (maxLoss / pnlSpan) * 100 : 50;

  const unrealizedPct =
    totals.investedUSD > 0 ? (totals.unrealizedPnl / totals.investedUSD) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label={t("totalARS")}>
          {/* Full ARS figures overflow a half-width mobile tile */}
          <p className="truncate font-mono text-base font-semibold tabular-nums text-foreground sm:text-lg">
            <span className="sm:hidden">{formatCurrencyCompact(totals.totalValueARS, "ARS")}</span>
            <span className="hidden sm:inline">{formatCurrency(totals.totalValueARS, "ARS")}</span>
          </p>
          {dolarBlueVenta > 0 && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {t("blueRate")}{" "}
              <span className="font-mono tabular-nums">
                AR${Math.round(dolarBlueVenta).toLocaleString("en-US")}
              </span>
            </p>
          )}
        </StatTile>
        <StatTile label={t("invested")}>
          <p className="truncate font-mono text-base font-semibold tabular-nums text-foreground sm:text-lg">
            {formatCurrency(totals.investedUSD, "USD")}
          </p>
        </StatTile>
        <StatTile label={t("unrealizedPnl")}>
          <SignedUSD value={totals.unrealizedPnl} className="block truncate text-base font-semibold sm:text-lg" />
          <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
            {formatPercent(unrealizedPct)}
          </p>
        </StatTile>
        <StatTile label={t("realizedPnl")}>
          <SignedUSD value={totals.realizedPnl} className="block truncate text-base font-semibold sm:text-lg" />
        </StatTile>
      </div>

      <AllocationChart
        holdings={holdings}
        priceMap={priceMap}
        dolarBlueVenta={dolarBlueVenta}
      />

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {categoryItems.length > 0 && (
          <Card title={t("allocationByCategory")}>
            <AllocationBar segments={categoryItems} />
          </Card>
        )}

        {performance.length > 0 && (
          <Card title={t("performance")} hint={t("performanceHint")}>
            <ul className="-mx-2">
              {performance.map(({ h, key, pnl }) => {
                const isGain = pnl.pnlAbsolute >= 0;
                const width = pnlSpan > 0 ? (Math.abs(pnl.pnlAbsolute) / pnlSpan) * 100 : 0;
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => onSelectAsset(key)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-card-hover active:bg-card-hover"
                    >
                      <div className="flex w-20 shrink-0 items-center gap-2">
                        <AssetIcon
                          iconUrl={iconMap.get(key) ?? null}
                          symbol={h.symbol}
                          name={h.name}
                          className="h-6 w-6 text-[9px]"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{h.symbol}</p>
                          {pnl.isClosed && (
                            <p className="text-[10px] leading-tight text-muted-foreground">
                              {t("closedPosition")}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Diverging bar: gains grow right of the zero line, losses left */}
                      <div className="relative h-2 min-w-0 flex-1" aria-hidden="true">
                        <div
                          className="absolute inset-y-[-3px] w-px bg-border"
                          style={{ left: `${zeroPct}%` }}
                        />
                        <div
                          className={cn(
                            "absolute inset-y-0",
                            isGain ? "rounded-r bg-gain" : "rounded-l bg-loss"
                          )}
                          style={
                            isGain
                              ? { left: `${zeroPct}%`, width: `${width}%` }
                              : { right: `${100 - zeroPct}%`, width: `${width}%` }
                          }
                        />
                      </div>

                      <div className="w-[6.5rem] shrink-0 text-right">
                        <SignedUSD value={pnl.pnlAbsolute} className="block truncate text-sm" />
                        <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                          {formatPercent(pnl.pnlPct)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
