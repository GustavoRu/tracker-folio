export const POLLING_INTERVALS = {
  crypto: 30_000,
  dolar: 60_000,
  stock: 60_000,
  cedear: 60_000,
} as const;

export const CRYPTO_IDS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "tether", symbol: "USDT", name: "Tether" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "usd-coin", symbol: "USDC", name: "USD Coin" },
  { id: "staked-ether", symbol: "STETH", name: "Lido Staked Ether" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "tron", symbol: "TRX", name: "TRON" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink" },
  { id: "shiba-inu", symbol: "SHIB", name: "Shiba Inu" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  { id: "bitcoin-cash", symbol: "BCH", name: "Bitcoin Cash" },
  { id: "sui", symbol: "SUI", name: "Sui" },
  { id: "near", symbol: "NEAR", name: "NEAR Protocol" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin" },
  { id: "uniswap", symbol: "UNI", name: "Uniswap" },
] as const;

export const STOCK_TICKERS = [
  { ticker: "SPY", name: "S&P 500 ETF" },
  { ticker: "QQQ", name: "Nasdaq 100 ETF" },
  { ticker: "AAPL", name: "Apple Inc." },
  { ticker: "MSFT", name: "Microsoft" },
  { ticker: "NVDA", name: "NVIDIA" },
  { ticker: "GOOGL", name: "Alphabet" },
  { ticker: "AMZN", name: "Amazon" },
  { ticker: "META", name: "Meta Platforms" },
  { ticker: "TSLA", name: "Tesla" },
  { ticker: "BRK-B", name: "Berkshire Hathaway" },
  { ticker: "AVGO", name: "Broadcom" },
  { ticker: "JPM", name: "JPMorgan Chase" },
  { ticker: "LLY", name: "Eli Lilly" },
  { ticker: "V", name: "Visa" },
  { ticker: "UNH", name: "UnitedHealth" },
  { ticker: "MA", name: "Mastercard" },
  { ticker: "COST", name: "Costco" },
  { ticker: "HD", name: "Home Depot" },
  { ticker: "NFLX", name: "Netflix" },
  { ticker: "CRM", name: "Salesforce" },
  { ticker: "AMD", name: "AMD" },
  { ticker: "MELI", name: "MercadoLibre Inc." },
] as const;

export const CEDEAR_TICKERS = [
  { ticker: "GGAL.BA", symbol: "GGAL", name: "Grupo Galicia" },
  { ticker: "MELI.BA", symbol: "MELI", name: "MercadoLibre" },
  { ticker: "YPF.BA", symbol: "YPF", name: "YPF" },
  { ticker: "BBAR.BA", symbol: "BBAR", name: "BBVA Argentina" },
  { ticker: "TS.BA", symbol: "TS", name: "Tenaris" },
  { ticker: "GLOB.BA", symbol: "GLOB", name: "Globant" },
  { ticker: "PAM.BA", symbol: "PAM", name: "Pampa Energia" },
  { ticker: "CEPU.BA", symbol: "CEPU", name: "Central Puerto" },
  { ticker: "LOMA.BA", symbol: "LOMA", name: "Loma Negra" },
  { ticker: "TGS.BA", symbol: "TGS", name: "Transp. Gas del Sur" },
  { ticker: "SUPV.BA", symbol: "SUPV", name: "Grupo Supervielle" },
  { ticker: "BMA.BA", symbol: "BMA", name: "Banco Macro" },
  { ticker: "CRESY.BA", symbol: "CRESY", name: "Cresud" },
  { ticker: "IRCP.BA", symbol: "IRCP", name: "IRSA Propiedades" },
  { ticker: "TXAR.BA", symbol: "TXAR", name: "Ternium Argentina" },
  { ticker: "TECO2.BA", symbol: "TECO2", name: "Telecom Argentina" },
  { ticker: "EDN.BA", symbol: "EDN", name: "Edenor" },
  { ticker: "TRAN.BA", symbol: "TRAN", name: "Transener" },
  { ticker: "ALUA.BA", symbol: "ALUA", name: "Aluar" },
  { ticker: "MIRG.BA", symbol: "MIRG", name: "Mirgor" },
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

export interface AssetOption {
  symbol: string;
  name: string;
  category: "crypto" | "stock" | "cedear" | "dolar";
}

export const ALL_ASSETS: AssetOption[] = [
  ...CRYPTO_IDS.map((c) => ({
    symbol: c.symbol,
    name: c.name,
    category: "crypto" as const,
  })),
  ...STOCK_TICKERS.map((s) => ({
    symbol: s.ticker,
    name: s.name,
    category: "stock" as const,
  })),
  ...CEDEAR_TICKERS.map((c) => ({
    symbol: c.symbol,
    name: c.name,
    category: "cedear" as const,
  })),
  ...DOLAR_TYPES.map((d) => ({
    symbol: d.toUpperCase(),
    name: DOLAR_LABELS[d],
    category: "dolar" as const,
  })),
  { symbol: "USD", name: "Dolar (cash)", category: "dolar" as const },
];
