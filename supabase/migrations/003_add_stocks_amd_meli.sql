-- Add AMD and MELI as US stocks (not CEDEARs)
INSERT INTO assets (symbol, name, category) VALUES
  ('AMD',  'AMD',                'stock'),
  ('MELI', 'MercadoLibre Inc.',  'stock')
ON CONFLICT (symbol) DO NOTHING;
