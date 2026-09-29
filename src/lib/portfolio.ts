import type { AssetCategory } from "@/types/quote";

export interface PriceInfo {
  currentPrice: number;
  currency: "USD" | "ARS";
  // Percent change over the last 24h; null when the source has no history
  change24h: number | null;
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
  // Cost of the units still held (of every unit bought, once closed)
  costBasisUSD: number;
  unrealizedPnl: number;
  // Locked in by sells, partial or full
  realizedPnl: number;
  // Unrealized + realized
  pnlAbsolute: number;
  // pnlAbsolute over the cost of every unit ever bought
  pnlPct: number;
  change24hUSD: number;
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

  const totalBoughtUSD = holding.originalTotalCost * convFactor;
  const realizedPnl = holding.realizedPnl * convFactor;

  if (isClosed) {
    return {
      isClosed,
      valueUSD: 0,
      valueARS: 0,
      costBasisUSD: totalBoughtUSD,
      unrealizedPnl: 0,
      realizedPnl,
      pnlAbsolute: realizedPnl,
      pnlPct: totalBoughtUSD > 0 ? (realizedPnl / totalBoughtUSD) * 100 : 0,
      change24hUSD: 0,
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
  const unrealizedPnl = valueUSD - costBasisUSD;
  const pnlAbsolute = unrealizedPnl + realizedPnl;

  // ARS-priced assets ignore the blue rate's own 24h move
  const change24h = price?.change24h ?? null;
  const change24hUSD =
    change24h !== null && change24h > -100
      ? valueUSD - valueUSD / (1 + change24h / 100)
      : 0;

  return {
    isClosed,
    valueUSD,
    valueARS: valueUSD * dolarBlueVenta,
    costBasisUSD,
    unrealizedPnl,
    realizedPnl,
    pnlAbsolute,
    pnlPct: totalBoughtUSD > 0 ? (pnlAbsolute / totalBoughtUSD) * 100 : 0,
    change24hUSD,
  };
}

// Price at which the whole position, sales included, nets to zero; in cost currency
export function breakEvenPrice(holding: Holding): number {
  if (holding.quantity === 0) return 0;
  return Math.max(0, holding.avgCostPerUnit - holding.realizedPnl / holding.quantity);
}

export interface PortfolioTotals {
  totalValueUSD: number;
  totalValueARS: number;
  // Cost basis of open positions only
  investedUSD: number;
  pnlAbsolute: number;
  pnlPct: number;
  unrealizedPnl: number;
  realizedPnl: number;
  change24hUSD: number;
  change24hPct: number;
}

export function computePortfolioTotals(
  holdings: Holding[],
  priceMap: Map<string, PriceInfo>,
  dolarBlueVenta: number
): PortfolioTotals {
  let totalValueUSD = 0;
  let totalCostBasisUSD = 0;
  let investedUSD = 0;
  let unrealizedPnl = 0;
  let realizedPnl = 0;
  let change24hUSD = 0;

  // Total P&L = sum of the per-row P&L shown in HoldingsTable. The % keeps
  // today's cost base: summing every buy would double-count stablecoin legs.
  for (const h of holdings) {
    const price = priceMap.get(holdingKey(h));
    if (h.quantity > 0 && !price) continue;

    const pnl = computeHoldingPnl(h, price, dolarBlueVenta);
    totalValueUSD += pnl.valueUSD;
    totalCostBasisUSD += pnl.costBasisUSD;
    change24hUSD += pnl.change24hUSD;

    unrealizedPnl += pnl.unrealizedPnl;
    realizedPnl += pnl.realizedPnl;
    if (!pnl.isClosed) investedUSD += pnl.costBasisUSD;
  }

  const pnlAbsolute = unrealizedPnl + realizedPnl;
  const valueYesterday = totalValueUSD - change24hUSD;

  return {
    totalValueUSD,
    totalValueARS: totalValueUSD * dolarBlueVenta,
    investedUSD,
    pnlAbsolute,
    pnlPct: totalCostBasisUSD > 0 ? (pnlAbsolute / totalCostBasisUSD) * 100 : 0,
    unrealizedPnl,
    realizedPnl,
    change24hUSD,
    change24hPct: valueYesterday > 0 ? (change24hUSD / valueYesterday) * 100 : 0,
  };
}
