-- Add HBAR, ONDO, PUMP and AVAIL to the crypto catalog.
-- XRP already exists from migration 002.
INSERT INTO public.assets (symbol, name, category, coingecko_id, rank) VALUES
  ('HBAR',  'Hedera',   'crypto', 'hedera-hashgraph', 21),
  ('ONDO',  'Ondo',     'crypto', 'ondo-finance',     22),
  ('PUMP',  'Pump.fun', 'crypto', 'pump-fun',         23),
  ('AVAIL', 'Avail',    'crypto', 'avail',            24)
ON CONFLICT (symbol, category) DO NOTHING;
