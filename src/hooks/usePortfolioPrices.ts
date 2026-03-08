"use client";

import { useQueries } from "@tanstack/react-query";
import type { Holding } from "@/lib/portfolio";
import type { Quote, DolarQuote } from "@/types/quote";

export interface PriceInfo {
  currentPrice: number;
  currency: "USD" | "ARS";
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

export function usePortfolioPrices(holdings: Holding[]) {
  const categories = new Set(holdings.map((h) => h.category));

  const queries = useQueries({
    queries: [
      {
        queryKey: ["portfolio-prices", "crypto"],
        queryFn: () => fetchJSON<Quote[]>("/api/quotes/crypto"),
        enabled: categories.has("crypto"),
        staleTime: 15_000,
        refetchInterval: 30_000,
      },
      {
        queryKey: ["portfolio-prices", "stock"],
        queryFn: () => fetchJSON<Quote[]>("/api/quotes/stocks?type=stock"),
        enabled: categories.has("stock"),
        staleTime: 15_000,
        refetchInterval: 60_000,
      },
      {
        queryKey: ["portfolio-prices", "cedear"],
        queryFn: () => fetchJSON<Quote[]>("/api/quotes/stocks?type=cedear"),
        enabled: categories.has("cedear"),
        staleTime: 15_000,
        refetchInterval: 60_000,
      },
      {
        queryKey: ["portfolio-prices", "dolar"],
        queryFn: () => fetchJSON<DolarQuote[]>("/api/quotes/dolar"),
        enabled: true,
        staleTime: 15_000,
        refetchInterval: 30_000,
      },
    ],
  });

  const [cryptoQ, stockQ, cedearQ, dolarQ] = queries;

  const isLoading = queries.some((q) => q.isLoading);

  const priceMap = new Map<string, PriceInfo>();

  const allQuotes: Quote[] = [
    ...(cryptoQ.data ?? []),
    ...(stockQ.data ?? []),
    ...(cedearQ.data ?? []),
  ];

  for (const q of allQuotes) {
    priceMap.set(q.symbol, {
      currentPrice: q.price,
      currency: q.currency,
    });
  }

  // USD cash = 1 USD
  priceMap.set("USD", { currentPrice: 1, currency: "USD" });

  // Dolar types: use venta price in ARS
  // The API returns type as label (e.g. "Dolar Blue"), so match by label
  const dolarRates = dolarQ.data ?? [];
  const labelToSymbol: Record<string, string> = {
    "Dolar Blue": "BLUE",
    "Dolar Oficial": "OFICIAL",
    "Dolar MEP": "BOLSA",
    "Dolar CCL": "CONTADOCONLIQUI",
  };
  for (const d of dolarRates) {
    const sym = labelToSymbol[d.type];
    if (sym) {
      priceMap.set(sym, { currentPrice: d.venta, currency: "ARS" });
    }
  }

  // Blue rate for ARS<->USD conversion
  const blueRate = dolarRates.find((d) => d.type === "Dolar Blue");
  const dolarBlueVenta = blueRate?.venta ?? 0;

  return { priceMap, dolarBlueVenta, isLoading, dolarRates };
}
