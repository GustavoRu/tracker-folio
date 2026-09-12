"use client";

import { useTranslations } from "next-intl";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/utils";
import { computeHoldingPnl, holdingKey, type Holding } from "@/lib/portfolio";
import { AssetIcon } from "@/components/ui/AssetIcon";
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

function formatQuantity(quantity: number): string {
  return quantity.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
}

// Mobile columns are ~85px wide, so large quantities drop precision they do not need
function formatQuantityCompact(quantity: number): string {
  const maximumFractionDigits = quantity >= 1000 ? 2 : quantity >= 1 ? 6 : 8;
  return quantity.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  });
}

// "ARS 1,234,567.89" does not fit on mobile: shorten the prefix, go compact when huge
function formatCurrencyCompact(value: number, currency: "USD" | "ARS"): string {
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

interface HoldingsTableProps {
  holdings: Holding[];
  priceMap: Map<string, PriceInfo>;
  iconMap: Map<string, string | null>;
  dolarBlueVenta: number;
  isLoading: boolean;
  onSelectAsset?: (symbol: string) => void;
}

export function HoldingsTable({
  holdings,
  priceMap,
  iconMap,
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

  // Both layouts render the same computed rows, so they cannot drift apart
  const rows = holdings.map((h) => {
    const key = holdingKey(h);
    const price = priceMap.get(key);
    const pnl = computeHoldingPnl(h, price, dolarBlueVenta);

    return {
      h,
      key,
      iconUrl: iconMap.get(key) ?? null,
      currentPrice: price?.currentPrice ?? 0,
      priceCurrency: price?.currency ?? ("USD" as const),
      badgeStyle:
        CATEGORY_BADGE_STYLES[h.category] ?? "bg-muted text-muted-foreground",
      isGain: pnl.isClosed ? pnl.pnlAbsolute >= 0 : pnl.pnlPct >= 0,
      ...pnl,
    };
  });

  return (
    <>
      {/* Mobile: asset / price / holdings, in the CoinGecko layout */}
      <div className="overflow-hidden rounded-xl border border-border bg-card sm:hidden">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span className="flex-1">{t("asset")}</span>
          <span className="w-[27%] text-right">{t("price")}</span>
          <span className="w-[34%] text-right">{t("holdingsLabel")}</span>
        </div>

        <div className="divide-y divide-border">
          {rows.map((row) => (
            <button
              key={row.key}
              type="button"
              onClick={() => onSelectAsset?.(row.key)}
              disabled={!onSelectAsset}
              className={`flex w-full items-center gap-2 px-3 py-3 text-left transition-colors active:bg-card-hover ${row.isClosed ? "opacity-55" : ""}`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <AssetIcon
                  iconUrl={row.iconUrl}
                  symbol={row.h.symbol}
                  name={row.h.name}
                  className="h-7 w-7"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {row.h.symbol}
                  </p>
                  <span
                    className={`inline-block rounded px-1 py-px text-[10px] font-medium ${row.badgeStyle}`}
                  >
                    {row.isClosed
                      ? t("closedPosition")
                      : CATEGORY_LABELS[row.h.category] ?? row.h.category}
                  </span>
                </div>
              </div>

              <div className="w-[27%] shrink-0 text-right">
                <p className="truncate font-mono text-xs tabular-nums text-foreground">
                  {row.isClosed || row.currentPrice <= 0
                    ? "—"
                    : formatCurrencyCompact(row.currentPrice, row.priceCurrency)}
                </p>
                {!row.isClosed && (
                  <p
                    className={`font-mono text-[11px] tabular-nums ${row.isGain ? "text-gain" : "text-loss"}`}
                  >
                    {formatPercent(row.pnlPct)}
                  </p>
                )}
              </div>

              <div className="w-[34%] shrink-0 text-right">
                <p
                  className={`truncate font-mono text-sm font-medium tabular-nums ${row.isClosed ? (row.isGain ? "text-gain" : "text-loss") : "text-foreground"}`}
                >
                  {row.isClosed
                    ? `${row.pnlAbsolute >= 0 ? "+" : "-"}${formatCurrencyCompact(Math.abs(row.pnlAbsolute), "USD")}`
                    : formatCurrencyCompact(row.valueUSD, "USD")}
                </p>
                <p className="truncate font-mono text-[11px] tabular-nums text-muted-foreground">
                  {row.isClosed
                    ? t("realizedPnl")
                    : `${formatQuantityCompact(row.h.quantity)} ${row.h.symbol}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: full table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 sm:px-6">{t("asset")}</th>
              <th className="px-4 py-3">{t("category")}</th>
              <th className="px-4 py-3 text-right">{t("quantity")}</th>
              <th className="px-4 py-3 text-right">{t("avgCost")}</th>
              <th className="px-4 py-3 text-right">{t("currentPrice")}</th>
              <th className="px-4 py-3 text-right">{t("value")}</th>
              <th className="px-4 py-3 text-right sm:px-6">{t("pnl")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr
                key={row.key}
                onClick={() => onSelectAsset?.(row.key)}
                className={`transition-colors hover:bg-card-hover ${onSelectAsset ? "cursor-pointer" : ""} ${row.isClosed ? "opacity-55" : ""}`}
              >
                <td className="px-4 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <AssetIcon
                      iconUrl={row.iconUrl}
                      symbol={row.h.symbol}
                      name={row.h.name}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{row.h.symbol}</p>
                        {row.isClosed && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                            {t("closedPosition")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{row.h.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${row.badgeStyle}`}>
                    {CATEGORY_LABELS[row.h.category] ?? row.h.category}
                  </span>
                </td>
                <td className="px-4 py-4 text-right font-mono font-medium tabular-nums text-foreground">
                  {row.isClosed ? "—" : formatQuantity(row.h.quantity)}
                </td>
                <td className="px-4 py-4 text-right font-mono text-sm tabular-nums text-muted-foreground">
                  {formatCurrency(row.h.avgCostPerUnit, row.h.costCurrency)}
                </td>
                <td className="px-4 py-4 text-right font-mono text-sm tabular-nums text-foreground">
                  {row.isClosed ? "—" : row.currentPrice > 0 ? formatCurrency(row.currentPrice, row.priceCurrency) : "—"}
                </td>
                <td className="px-4 py-4 text-right">
                  {row.isClosed ? (
                    <span className="font-mono text-foreground">—</span>
                  ) : (
                    <div>
                      <p className="font-mono font-medium tabular-nums text-foreground">
                        {formatCurrency(row.valueUSD, "USD")}
                      </p>
                      {dolarBlueVenta > 0 && (
                        <p className="font-mono text-xs tabular-nums text-muted-foreground">
                          {formatCurrency(row.valueARS, "ARS")}
                        </p>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 text-right sm:px-6">
                  <div>
                    <p className={`font-mono font-medium tabular-nums ${row.isGain ? "text-gain" : "text-loss"}`}>
                      {row.pnlAbsolute >= 0 ? "+" : "-"}
                      {formatCurrency(Math.abs(row.pnlAbsolute), "USD")}
                    </p>
                    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-xs font-medium tabular-nums ${row.isGain ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"}`}>
                      {formatPercent(row.pnlPct)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
