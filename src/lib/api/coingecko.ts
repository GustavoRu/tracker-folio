import { CRYPTO_IDS, API_URLS } from "@/lib/constants";
import type { Quote } from "@/types/quote";

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  market_cap: number | null;
  total_volume: number | null;
}

export async function fetchCryptoPrices(): Promise<Quote[]> {
  const ids = CRYPTO_IDS.map((c) => c.id).join(",");
  const url = `${API_URLS.coingecko}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false`;

  const headers: HeadersInit = { Accept: "application/json" };
  if (process.env.COINGECKO_API_KEY) {
    headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status}`);
  }

  const data: CoinGeckoMarket[] = await res.json();

  // Build a lookup from the API response
  const marketMap = new Map(data.map((coin) => [coin.id, coin]));

  const quotes = CRYPTO_IDS.map((coin) => {
    const market = marketMap.get(coin.id);
    return {
      symbol: coin.symbol,
      name: coin.name,
      category: "crypto" as const,
      iconUrl: market?.image ?? null,
      price: market?.current_price ?? 0,
      priceChange24h: market?.price_change_percentage_24h ?? null,
      marketCap: market?.market_cap ?? null,
      volume24h: market?.total_volume ?? null,
      currency: "USD" as const,
      rank: 0,
    };
  });

  // Catalog order is arbitrary, so rank by market cap (unknown caps last)
  quotes.sort((a, b) => (b.marketCap ?? -1) - (a.marketCap ?? -1));
  return quotes.map((q, index) => ({ ...q, rank: index + 1 }));
}
