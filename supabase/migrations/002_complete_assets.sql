-- ============================================================
-- Insert all assets from constants.ts into the catalog
-- Uses ON CONFLICT to skip already-existing assets
-- ============================================================

-- Crypto (20)
INSERT INTO public.assets (symbol, name, category, coingecko_id, rank) VALUES
  ('BTC',   'Bitcoin',            'crypto', 'bitcoin',        1),
  ('ETH',   'Ethereum',           'crypto', 'ethereum',       2),
  ('USDT',  'Tether',             'crypto', 'tether',         3),
  ('BNB',   'BNB',                'crypto', 'binancecoin',    4),
  ('SOL',   'Solana',             'crypto', 'solana',         5),
  ('XRP',   'XRP',                'crypto', 'ripple',         6),
  ('USDC',  'USD Coin',           'crypto', 'usd-coin',       7),
  ('STETH', 'Lido Staked Ether',  'crypto', 'staked-ether',   8),
  ('ADA',   'Cardano',            'crypto', 'cardano',        9),
  ('DOGE',  'Dogecoin',           'crypto', 'dogecoin',      10),
  ('TRX',   'TRON',               'crypto', 'tron',          11),
  ('AVAX',  'Avalanche',          'crypto', 'avalanche-2',   12),
  ('LINK',  'Chainlink',          'crypto', 'chainlink',     13),
  ('SHIB',  'Shiba Inu',          'crypto', 'shiba-inu',     14),
  ('DOT',   'Polkadot',           'crypto', 'polkadot',      15),
  ('BCH',   'Bitcoin Cash',       'crypto', 'bitcoin-cash',  16),
  ('SUI',   'Sui',                'crypto', 'sui',           17),
  ('NEAR',  'NEAR Protocol',      'crypto', 'near',          18),
  ('LTC',   'Litecoin',           'crypto', 'litecoin',      19),
  ('UNI',   'Uniswap',            'crypto', 'uniswap',       20)
ON CONFLICT (symbol) DO NOTHING;

-- US Stocks (20)
INSERT INTO public.assets (symbol, name, category, yahoo_ticker, rank) VALUES
  ('SPY',   'S&P 500 ETF',       'stock', 'SPY',    1),
  ('QQQ',   'Nasdaq 100 ETF',    'stock', 'QQQ',    2),
  ('AAPL',  'Apple Inc.',         'stock', 'AAPL',   3),
  ('MSFT',  'Microsoft',          'stock', 'MSFT',   4),
  ('NVDA',  'NVIDIA',             'stock', 'NVDA',   5),
  ('GOOGL', 'Alphabet',           'stock', 'GOOGL',  6),
  ('AMZN',  'Amazon',             'stock', 'AMZN',   7),
  ('META',  'Meta Platforms',     'stock', 'META',   8),
  ('TSLA',  'Tesla',              'stock', 'TSLA',   9),
  ('BRK-B', 'Berkshire Hathaway', 'stock', 'BRK-B', 10),
  ('AVGO',  'Broadcom',           'stock', 'AVGO',  11),
  ('JPM',   'JPMorgan Chase',     'stock', 'JPM',   12),
  ('LLY',   'Eli Lilly',          'stock', 'LLY',   13),
  ('V',     'Visa',               'stock', 'V',     14),
  ('UNH',   'UnitedHealth',       'stock', 'UNH',   15),
  ('MA',    'Mastercard',         'stock', 'MA',    16),
  ('COST',  'Costco',             'stock', 'COST',  17),
  ('HD',    'Home Depot',         'stock', 'HD',    18),
  ('NFLX',  'Netflix',            'stock', 'NFLX',  19),
  ('CRM',   'Salesforce',         'stock', 'CRM',   20)
ON CONFLICT (symbol) DO NOTHING;

-- CEDEARs (20)
INSERT INTO public.assets (symbol, name, category, yahoo_ticker, rank) VALUES
  ('GGAL',  'Grupo Galicia',       'cedear', 'GGAL.BA',  1),
  ('MELI',  'MercadoLibre',        'cedear', 'MELI.BA',  2),
  ('YPF',   'YPF',                 'cedear', 'YPF.BA',   3),
  ('BBAR',  'BBVA Argentina',      'cedear', 'BBAR.BA',  4),
  ('TS',    'Tenaris',             'cedear', 'TS.BA',    5),
  ('GLOB',  'Globant',             'cedear', 'GLOB.BA',  6),
  ('PAM',   'Pampa Energia',       'cedear', 'PAM.BA',   7),
  ('CEPU',  'Central Puerto',      'cedear', 'CEPU.BA',  8),
  ('LOMA',  'Loma Negra',          'cedear', 'LOMA.BA',  9),
  ('TGS',   'Transp. Gas del Sur', 'cedear', 'TGS.BA', 10),
  ('SUPV',  'Grupo Supervielle',   'cedear', 'SUPV.BA', 11),
  ('BMA',   'Banco Macro',         'cedear', 'BMA.BA',  12),
  ('CRESY', 'Cresud',              'cedear', 'CRESY.BA',13),
  ('IRCP',  'IRSA Propiedades',    'cedear', 'IRCP.BA', 14),
  ('TXAR',  'Ternium Argentina',   'cedear', 'TXAR.BA', 15),
  ('TECO2', 'Telecom Argentina',   'cedear', 'TECO2.BA',16),
  ('EDN',   'Edenor',              'cedear', 'EDN.BA',  17),
  ('TRAN',  'Transener',           'cedear', 'TRAN.BA', 18),
  ('ALUA',  'Aluar',               'cedear', 'ALUA.BA', 19),
  ('MIRG',  'Mirgor',              'cedear', 'MIRG.BA', 20)
ON CONFLICT (symbol) DO NOTHING;

-- Dolar types (4)
INSERT INTO public.assets (symbol, name, category, dolar_api_key, rank) VALUES
  ('BLUE',    'Dolar Blue',    'dolar', 'blue',            1),
  ('OFICIAL', 'Dolar Oficial', 'dolar', 'oficial',         2),
  ('BOLSA',   'Dolar MEP',    'dolar', 'bolsa',           3),
  ('CONTADOCONLIQUI', 'Dolar CCL', 'dolar', 'contadoconliqui', 4)
ON CONFLICT (symbol) DO NOTHING;

-- USD cash (for tracking dollar holdings)
INSERT INTO public.assets (symbol, name, category, rank) VALUES
  ('USD', 'Dolar (cash)', 'dolar', 5)
ON CONFLICT (symbol) DO NOTHING;
