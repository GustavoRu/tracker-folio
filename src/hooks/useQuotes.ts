"use client";

import { useQuery } from "@tanstack/react-query";
import { POLLING_INTERVALS } from "@/lib/constants";
import type { Quote, DolarQuote, AssetCategory } from "@/types/quote";

async function fetchQuotes(category: AssetCategory): Promise<Quote[]> {
  const url =
    category === "cedear"
      ? "/api/quotes/stocks?type=cedear"
      : category === "stock"
        ? "/api/quotes/stocks?type=stock"
        : `/api/quotes/${category}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch quotes");
  return res.json();
}

async function fetchDolar(): Promise<DolarQuote[]> {
  const res = await fetch("/api/quotes/dolar");
  if (!res.ok) throw new Error("Failed to fetch dolar rates");
  return res.json();
}

export function useQuotes(category: Exclude<AssetCategory, "dolar">) {
  return useQuery<Quote[]>({
    queryKey: ["quotes", category],
    queryFn: () => fetchQuotes(category),
    staleTime: 30_000,
    refetchInterval: POLLING_INTERVALS[category],
  });
}

export function useDolar() {
  return useQuery<DolarQuote[]>({
    queryKey: ["quotes", "dolar"],
    queryFn: fetchDolar,
    staleTime: 30_000,
    refetchInterval: POLLING_INTERVALS.dolar,
  });
}
