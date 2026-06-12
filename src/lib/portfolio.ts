import type { AssetCategory } from "@/types/quote";

export interface PriceInfo {
  currentPrice: number;
  currency: "USD" | "ARS";
}

// Symbols can repeat across categories (e.g. MELI stock vs MELI cedear),
// so holdings and price lookups are keyed by category + symbol.
export function holdingKey(h: { symbol: string; category: AssetCategory }): string {
  return `${h.category}:${h.symbol}`;
}

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
      symbol: string;
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
    const key = holdingKey(tx.assets);
    const entry = map.get(key) ?? {
      symbol: tx.assets.symbol,
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

    map.set(key, entry);
  }

  const holdings: Holding[] = [];

  for (const entry of map.values()) {
    const quantity = Math.max(0, entry.buyQty - entry.sellQty);
    const avgBuyCost = entry.buyQty > 0 ? entry.buyTotal / entry.buyQty : 0;
    const realizedPnl = entry.sellTotal - avgBuyCost * entry.sellQty;
    const originalTotalCost = entry.buyTotal;

    holdings.push({
      symbol: entry.symbol,
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

export interface HoldingPnl {
  isClosed: boolean;
  valueUSD: number;
  valueARS: number;
  costBasisUSD: number;
  pnlAbsolute: number;
  pnlPct: number;
}

export function computeHoldingPnl(
  holding: Holding,
  price: PriceInfo | undefined,
  dolarBlueVenta: number
): HoldingPnl {
  const isClosed = holding.quantity === 0;
  const convFactor =
    holding.costCurrency === "ARS" && dolarBlueVenta > 0
      ? 1 / dolarBlueVenta
      : 1;

  if (isClosed) {
    // Closed position: realized P&L over the original cost basis
    const costBasisUSD = holding.originalTotalCost * convFactor;
    const pnlAbsolute = holding.realizedPnl * convFactor;
    return {
      isClosed,
      valueUSD: 0,
      valueARS: 0,
      costBasisUSD,
      pnlAbsolute,
      pnlPct: costBasisUSD > 0 ? (pnlAbsolute / costBasisUSD) * 100 : 0,
    };
  }

  const currentPrice = price?.currentPrice ?? 0;
  const priceCurrency = price?.currency ?? "USD";

  let valueUSD: number;
  if (priceCurrency === "ARS" && dolarBlueVenta > 0) {
    valueUSD = (holding.quantity * currentPrice) / dolarBlueVenta;
  } else {
    valueUSD = holding.quantity * currentPrice;
  }

  const costBasisUSD = holding.totalCost * convFactor;
  const pnlAbsolute = valueUSD - costBasisUSD;

  return {
    isClosed,
    valueUSD,
    valueARS: valueUSD * dolarBlueVenta,
    costBasisUSD,
    pnlAbsolute,
    pnlPct: costBasisUSD > 0 ? (pnlAbsolute / costBasisUSD) * 100 : 0,
  };
}
