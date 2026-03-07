export type AssetCategory = "crypto" | "stock" | "cedear" | "dolar";

export interface Quote {
  symbol: string;
  name: string;
  category: AssetCategory;
  iconUrl: string | null;
  price: number;
  priceChange24h: number | null;
  marketCap: number | null;
  volume24h: number | null;
  currency: "USD" | "ARS";
  rank: number;
}

export interface DolarQuote {
  type: string;
  compra: number;
  venta: number;
  spread: number;
  fechaActualizacion: string;
}
