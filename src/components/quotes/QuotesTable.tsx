"use client";

import { useTranslations } from "next-intl";
import { useQuotes } from "@/hooks/useQuotes";
import { formatCurrency, formatCompact } from "@/lib/utils";
import { PriceChange } from "./PriceChange";
import { QuotesSkeleton } from "./QuotesSkeleton";
import type { AssetCategory } from "@/types/quote";

interface QuotesTableProps {
  category: Exclude<AssetCategory, "dolar">;
}

export function QuotesTable({ category }: QuotesTableProps) {
  const t = useTranslations("table");
  const { data: quotes, isLoading, error } = useQuotes(category);

  if (isLoading) return <QuotesSkeleton />;

  if (error || !quotes?.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-muted-foreground">{t("noData")}</p>
      </div>
    );
  }

  const currency = category === "cedear" ? "ARS" : "USD";

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="w-10 px-4 py-3 text-center sm:px-6">{t("rank")}</th>
            <th className="px-4 py-3 sm:px-6">{t("name")}</th>
            <th className="px-4 py-3 text-right sm:px-6">{t("price")}</th>
            <th className="px-4 py-3 text-right sm:px-6">{t("change24h")}</th>
            {category === "crypto" && (
              <>
                <th className="hidden px-4 py-3 text-right md:table-cell sm:px-6">
                  {t("marketCap")}
                </th>
                <th className="hidden px-4 py-3 text-right md:table-cell sm:px-6">
                  {t("volume")}
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {quotes.map((quote) => (
            <tr
              key={quote.symbol}
              className="transition-colors hover:bg-card-hover"
            >
              <td className="px-4 py-4 text-center font-mono text-sm tabular-nums text-muted-foreground sm:px-6">
                {quote.rank}
              </td>
              <td className="px-4 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  {quote.iconUrl ? (
                    <img
                      src={quote.iconUrl}
                      alt={quote.name}
                      className="h-8 w-8 rounded-full"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                      {quote.symbol.slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-foreground">{quote.name}</p>
                    <p className="text-xs text-muted-foreground uppercase">
                      {quote.symbol}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-right font-mono font-medium tabular-nums text-foreground sm:px-6">
                {formatCurrency(quote.price, currency)}
              </td>
              <td className="px-4 py-4 text-right sm:px-6">
                <PriceChange value={quote.priceChange24h} />
              </td>
              {category === "crypto" && (
                <>
                  <td className="hidden px-4 py-4 text-right font-mono text-sm tabular-nums text-muted-foreground md:table-cell sm:px-6">
                    {quote.marketCap
                      ? `$${formatCompact(quote.marketCap)}`
                      : "-"}
                  </td>
                  <td className="hidden px-4 py-4 text-right font-mono text-sm tabular-nums text-muted-foreground md:table-cell sm:px-6">
                    {quote.volume24h
                      ? `$${formatCompact(quote.volume24h)}`
                      : "-"}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
