import { NextResponse } from "next/server";
import { fetchDolarPrices } from "@/lib/api/dolar";

let cache: { data: unknown; timestamp: number } = { data: null, timestamp: 0 };
const TTL = 30_000;

export async function GET() {
  try {
    if (cache.data && Date.now() - cache.timestamp < TTL) {
      return NextResponse.json(cache.data);
    }

    const data = await fetchDolarPrices();
    cache = { data, timestamp: Date.now() };
    return NextResponse.json(data);
  } catch (error) {
    console.error("Dolar API error:", error);
    if (cache.data) {
      return NextResponse.json(cache.data);
    }
    return NextResponse.json({ error: "Failed to fetch dolar prices" }, { status: 500 });
  }
}
