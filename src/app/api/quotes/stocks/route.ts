import { NextRequest, NextResponse } from "next/server";
import { fetchStockPrices, fetchCedearPrices } from "@/lib/api/yahoo";

const caches: Record<string, { data: unknown; timestamp: number }> = {
  stock: { data: null, timestamp: 0 },
  cedear: { data: null, timestamp: 0 },
};
const TTL = 60_000;

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") || "stock";
  const cacheKey = type === "cedear" ? "cedear" : "stock";

  try {
    const cached = caches[cacheKey];
    if (cached?.data && Date.now() - cached.timestamp < TTL) {
      return NextResponse.json(cached.data);
    }

    const data = type === "cedear" ? await fetchCedearPrices() : await fetchStockPrices();
    caches[cacheKey] = { data, timestamp: Date.now() };
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Stocks API error (${type}):`, error);
    const cached = caches[cacheKey];
    if (cached?.data) {
      return NextResponse.json(cached.data);
    }
    return NextResponse.json({ error: "Failed to fetch stock prices" }, { status: 500 });
  }
}
