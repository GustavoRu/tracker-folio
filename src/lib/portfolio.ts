import type { AssetCategory } from "@/types/quote";

export interface Holding {
  symbol: string;
  name: string;
  category: AssetCategory;
  quantity: number;
  avgCostPerUnit: number;
  totalCost: number;
  costCurrency: "USD" | "ARS";
  realizedPnl: number;
  originalTotalCost: number;
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
      sellTotal: number;
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
      sellTotal: 0,
      currency: tx.currency as "USD" | "ARS",
    };

    if (tx.type === "buy") {
      entry.buyQty += tx.quantity;
      entry.buyTotal += tx.quantity * tx.price_per_unit;
    } else {
      entry.sellQty += tx.quantity;
      entry.sellTotal += tx.quantity * tx.price_per_unit;
    }

    map.set(sym, entry);
  }

  const holdings: Holding[] = [];

  for (const [symbol, entry] of map) {
    const quantity = Math.max(0, entry.buyQty - entry.sellQty);
    const avgBuyCost = entry.buyQty > 0 ? entry.buyTotal / entry.buyQty : 0;
    const realizedPnl = entry.sellTotal - avgBuyCost * entry.sellQty;
    const originalTotalCost = entry.buyTotal;

    holdings.push({
      symbol,
      name: entry.name,
      category: entry.category,
      quantity,
      avgCostPerUnit: avgBuyCost,
      totalCost: avgBuyCost * quantity,
      costCurrency: entry.currency,
      realizedPnl,
      originalTotalCost,
    });
  }

  return holdings.sort((a, b) => {
    // Open positions first, sorted by remaining cost desc
    if (a.quantity > 0 && b.quantity === 0) return -1;
    if (a.quantity === 0 && b.quantity > 0) return 1;
    if (a.quantity > 0 && b.quantity > 0) return b.totalCost - a.totalCost;
    // Both closed: sort by |realizedPnl| desc
    return Math.abs(b.realizedPnl) - Math.abs(a.realizedPnl);
  });
}
