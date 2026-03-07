import { STOCK_TICKERS, CEDEAR_TICKERS, API_URLS } from "@/lib/constants";
import type { Quote, AssetCategory } from "@/types/quote";

interface YahooChartResult {
  meta: {
    symbol: string;
    regularMarketPrice: number;
    previousClose: number;
  };
}

interface YahooChartResponse {
  chart: {
    result: YahooChartResult[] | null;
    error: { code: string; description: string } | null;
  };
}

async function fetchYahooTicker(ticker: string): Promise<YahooChartResult["meta"] | null> {
  try {
    const res = await fetch(
      `${API_URLS.yahoo}/${ticker}?interval=1d&range=1d`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) return null;

    const data: YahooChartResponse = await res.json();
    return data.chart.result?.[0]?.meta ?? null;
  } catch {
    return null;
  }
}

export async function fetchStockPrices(): Promise<Quote[]> {
  return fetchTickerGroup(STOCK_TICKERS, "stock", "USD");
}

export async function fetchCedearPrices(): Promise<Quote[]> {
  return fetchTickerGroup(
    CEDEAR_TICKERS.map((c) => ({ ticker: c.ticker, name: c.name })),
    "cedear",
    "ARS"
  );
}

async function fetchTickerGroup(
  tickers: readonly { ticker: string; name: string }[],
  category: AssetCategory,
  currency: "USD" | "ARS"
): Promise<Quote[]> {
  const results = await Promise.allSettled(
    tickers.map((t) => fetchYahooTicker(t.ticker))
  );

  return tickers.map((t, index) => {
    const result = results[index];
    const meta = result.status === "fulfilled" ? result.value : null;
    const price = meta?.regularMarketPrice ?? 0;
    const prevClose = meta?.previousClose ?? 0;
    const change = prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : null;
    const symbol = t.ticker.replace(".BA", "");

    return {
      symbol,
      name: t.name,
      category,
      iconUrl: null,
      price,
      priceChange24h: change,
      marketCap: null,
      volume24h: null,
      currency,
      rank: index + 1,
    };
  });
}
