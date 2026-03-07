"use client";

import { useTranslations } from "next-intl";
import { useDolar } from "@/hooks/useQuotes";
import { formatCurrency } from "@/lib/utils";
import { QuotesSkeleton } from "./QuotesSkeleton";

export function DolarTable() {
  const t = useTranslations("table");
  const { data: quotes, isLoading, error } = useDolar();

  if (isLoading) return <QuotesSkeleton />;

  if (error || !quotes?.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-muted-foreground">{t("noData")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-3">{t("type")}</th>
            <th className="px-6 py-3 text-right">{t("buy")}</th>
            <th className="px-6 py-3 text-right">{t("sell")}</th>
            <th className="px-6 py-3 text-right">{t("spread")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {quotes.map((q) => (
            <tr
              key={q.type}
              className="transition-colors hover:bg-card-hover"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                    $
                  </div>
                  <span className="font-medium text-foreground">{q.type}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right font-medium tabular-nums text-foreground">
                {formatCurrency(q.compra, "ARS", "es-AR")}
              </td>
              <td className="px-6 py-4 text-right font-medium tabular-nums text-foreground">
                {formatCurrency(q.venta, "ARS", "es-AR")}
              </td>
              <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                {q.spread.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
