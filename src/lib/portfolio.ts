import type { AssetCategory } from "@/types/quote";

export interface Holding {
  symbol: string;
  name: string;
  category: AssetCategory;
  quantity: number;
  avgCostPerUnit: number;
  totalCost: number;
  costCurrency: "USD" | "ARS";
}

interface TransactionRow {
  type: "buy" | "sell";
  quantity: number;
  price_per_unit: number;
  currency: string;
  assets: {
    symbol: string;
    name: string;
    category: AssetCategory;
  };
}

export function computeHoldings(transactions: TransactionRow[]): Holding[] {
  const map = new Map<
    string,
    {
      name: string;
      category: AssetCategory;
      buyQty: number;
      buyTotal: number;
      sellQty: number;
      currency: "USD" | "ARS";
    }
  >();

  for (const tx of transactions) {
    const sym = tx.assets.symbol;
    const entry = map.get(sym) ?? {
      name: tx.assets.name,
      category: tx.assets.category,
      buyQty: 0,
      buyTotal: 0,
      sellQty: 0,
      currency: tx.currency as "USD" | "ARS",
    };

    if (tx.type === "buy") {
      entry.buyQty += tx.quantity;
      entry.buyTotal += tx.quantity * tx.price_per_unit;
    } else {
      entry.sellQty += tx.quantity;
    }

    map.set(sym, entry);
  }

  const holdings: Holding[] = [];

  for (const [symbol, entry] of map) {
    const quantity = entry.buyQty - entry.sellQty;
    if (quantity <= 0) continue;

    const avgCost = entry.buyQty > 0 ? entry.buyTotal / entry.buyQty : 0;

    holdings.push({
      symbol,
      name: entry.name,
      category: entry.category,
      quantity,
      avgCostPerUnit: avgCost,
      totalCost: avgCost * quantity,
      costCurrency: entry.currency,
    });
  }

  return holdings.sort((a, b) => b.totalCost - a.totalCost);
}
