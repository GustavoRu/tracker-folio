export const POLLING_INTERVALS = {
  crypto: 30_000,
  dolar: 30_000,
  stock: 60_000,
  cedear: 60_000,
} as const;

export const CRYPTO_IDS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "tether", symbol: "USDT", name: "Tether" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
] as const;

export const STOCK_TICKERS = [
  { ticker: "SPY", name: "S&P 500 ETF" },
  { ticker: "AAPL", name: "Apple Inc." },
  { ticker: "MSFT", name: "Microsoft" },
  { ticker: "GOOGL", name: "Alphabet" },
  { ticker: "AMZN", name: "Amazon" },
  { ticker: "TSLA", name: "Tesla" },
  { ticker: "NVDA", name: "NVIDIA" },
] as const;

export const CEDEAR_TICKERS = [
  { ticker: "GGAL.BA", symbol: "GGAL", name: "Grupo Galicia" },
  { ticker: "MELI.BA", symbol: "MELI", name: "MercadoLibre" },
  { ticker: "YPF.BA", symbol: "YPF", name: "YPF" },
  { ticker: "BBAR.BA", symbol: "BBAR", name: "BBVA Argentina" },
  { ticker: "TS.BA", symbol: "TS", name: "Tenaris" },
] as const;

export const DOLAR_TYPES = ["blue", "oficial", "bolsa", "contadoconliqui"] as const;

export const DOLAR_LABELS: Record<string, string> = {
  blue: "Dolar Blue",
  oficial: "Dolar Oficial",
  bolsa: "Dolar MEP",
  contadoconliqui: "Dolar CCL",
};

export const API_URLS = {
  coingecko: "https://api.coingecko.com/api/v3",
  dolar: "https://dolarapi.com/v1/dolares",
  yahoo: "https://query1.finance.yahoo.com/v8/finance/chart",
} as const;
