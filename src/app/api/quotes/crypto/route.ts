import { NextResponse } from "next/server";
import { fetchCryptoPrices } from "@/lib/api/coingecko";

let cache: { data: unknown; timestamp: number } = { data: null, timestamp: 0 };
const TTL = 30_000;

export async function GET() {
  try {
    if (cache.data && Date.now() - cache.timestamp < TTL) {
      return NextResponse.json(cache.data);
    }

    const data = await fetchCryptoPrices();
    cache = { data, timestamp: Date.now() };
    return NextResponse.json(data);
  } catch (error) {
    console.error("Crypto API error:", error);
    if (cache.data) {
      return NextResponse.json(cache.data);
    }
    return NextResponse.json({ error: "Failed to fetch crypto prices" }, { status: 500 });
  }
}
