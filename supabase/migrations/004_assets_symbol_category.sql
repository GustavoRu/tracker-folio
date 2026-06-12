-- Allow the same symbol to exist in multiple categories (e.g. MELI stock vs MELI cedear).
-- Migration 003 silently failed to insert MELI as stock because of the old UNIQUE(symbol).
ALTER TABLE public.assets DROP CONSTRAINT assets_symbol_key;
ALTER TABLE public.assets ADD CONSTRAINT assets_symbol_category_key UNIQUE (symbol, category);

-- MELI as US stock
INSERT INTO public.assets (symbol, name, category, yahoo_ticker, rank) VALUES
  ('MELI', 'MercadoLibre Inc.', 'stock', 'MELI', 22)
ON CONFLICT (symbol, category) DO NOTHING;

-- Existing MELI transactions were entered as stock but got linked to the cedear
-- asset (the only MELI row at the time). Re-point them to the stock asset.
UPDATE public.transactions
SET asset_id = (SELECT id FROM public.assets WHERE symbol = 'MELI' AND category = 'stock')
WHERE asset_id = (SELECT id FROM public.assets WHERE symbol = 'MELI' AND category = 'cedear');
