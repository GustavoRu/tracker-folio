-- Seed: Crypto assets
INSERT INTO public.assets (symbol, name, category, coingecko_id, rank) VALUES
  ('BTC',  'Bitcoin',     'crypto', 'bitcoin',     1),
  ('ETH',  'Ethereum',    'crypto', 'ethereum',    2),
  ('SOL',  'Solana',      'crypto', 'solana',      3),
  ('USDT', 'Tether',      'crypto', 'tether',      4),
  ('BNB',  'BNB',         'crypto', 'binancecoin', 5),
  ('XRP',  'XRP',         'crypto', 'ripple',      6),
  ('ADA',  'Cardano',     'crypto', 'cardano',     7),
  ('DOGE', 'Dogecoin',    'crypto', 'dogecoin',    8);

-- Seed: US Stocks
INSERT INTO public.assets (symbol, name, category, yahoo_ticker, rank) VALUES
  ('SPY',   'S&P 500 ETF', 'stock', 'SPY',   1),
  ('AAPL',  'Apple Inc.',   'stock', 'AAPL',  2),
  ('MSFT',  'Microsoft',    'stock', 'MSFT',  3),
  ('GOOGL', 'Alphabet',     'stock', 'GOOGL', 4),
  ('AMZN',  'Amazon',       'stock', 'AMZN',  5),
  ('TSLA',  'Tesla',        'stock', 'TSLA',  6),
  ('NVDA',  'NVIDIA',       'stock', 'NVDA',  7);

-- Seed: CEDEARs (Argentine market)
INSERT INTO public.assets (symbol, name, category, yahoo_ticker, rank) VALUES
  ('GGAL', 'Grupo Galicia', 'cedear', 'GGAL.BA', 1),
  ('MELI', 'MercadoLibre',  'cedear', 'MELI.BA', 2),
  ('YPF',  'YPF',           'cedear', 'YPF.BA',  3),
  ('BBAR', 'BBVA Argentina','cedear', 'BBAR.BA', 4),
  ('TS',   'Tenaris',       'cedear', 'TS.BA',   5);

-- Seed: Dolar types
INSERT INTO public.assets (symbol, name, category, dolar_api_key, rank) VALUES
  ('BLUE',    'Dolar Blue',    'dolar', 'blue',            1),
  ('OFICIAL', 'Dolar Oficial', 'dolar', 'oficial',         2),
  ('MEP',     'Dolar MEP',     'dolar', 'bolsa',           3),
  ('CCL',     'Dolar CCL',     'dolar', 'contadoconliqui', 4);
