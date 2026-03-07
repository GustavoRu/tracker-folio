import { CRYPTO_IDS, API_URLS } from "@/lib/constants";
import type { Quote } from "@/types/quote";

interface CoinGeckoPrice {
  usd: number;
  usd_24h_change?: number;
  usd_market_cap?: number;
  usd_24h_vol?: number;
}

export async function fetchCryptoPrices(): Promise<Quote[]> {
  const ids = CRYPTO_IDS.map((c) => c.id).join(",");
  const url = `${API_URLS.coingecko}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;

  const headers: HeadersInit = { Accept: "application/json" };
  if (process.env.COINGECKO_API_KEY) {
    headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${res.status}`);
  }

  const data: Record<string, CoinGeckoPrice> = await res.json();

  return CRYPTO_IDS.map((coin, index) => {
    const price = data[coin.id];
    return {
      symbol: coin.symbol,
      name: coin.name,
      category: "crypto" as const,
      iconUrl: `https://assets.coingecko.com/coins/images/${getCoinImageId(coin.id)}/small/${coin.id}.png`,
      price: price?.usd ?? 0,
      priceChange24h: price?.usd_24h_change ?? null,
      marketCap: price?.usd_market_cap ?? null,
      volume24h: price?.usd_24h_vol ?? null,
      currency: "USD" as const,
      rank: index + 1,
    };
  });
}

// Simplified - CoinGecko icon URLs vary, so we use a generic approach
function getCoinImageId(id: string): string {
  const map: Record<string, string> = {
    bitcoin: "1",
    ethereum: "279",
    solana: "4128",
    tether: "325",
    binancecoin: "825",
    ripple: "44",
    cardano: "975",
    dogecoin: "5",
  };
  return map[id] ?? "1";
}
