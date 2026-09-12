-- ============================================================
-- Manual backup — the free tier keeps no point-in-time backups.
-- Run in the Supabase SQL Editor. Read-only: it emits the INSERT
-- statements that recreate assets, transactions and profile prefs.
-- Expand the result cell, copy the text and commit/store it.
--
-- To restore into a fresh project: run the migrations first, sign up
-- with the SAME email, then run the generated statements.
-- ============================================================

WITH asset_rows AS (
  SELECT
    1 AS ord,
    a.rank AS sub,
    format(
      'INSERT INTO public.assets (symbol, name, category, icon_url, coingecko_id, yahoo_ticker, dolar_api_key, rank, is_active) VALUES (%L, %L, %L, %L, %L, %L, %L, %L, %L) ON CONFLICT (symbol, category) DO NOTHING;',
      a.symbol, a.name, a.category, a.icon_url, a.coingecko_id,
      a.yahoo_ticker, a.dolar_api_key, a.rank, a.is_active
    ) AS stmt
  FROM public.assets a
),
tx_rows AS (
  SELECT
    2 AS ord,
    row_number() OVER (ORDER BY t.transacted_at) AS sub,
    format(
      'INSERT INTO public.transactions (id, user_id, asset_id, type, quantity, price_per_unit, currency, notes, transacted_at, created_at) SELECT %L, (SELECT id FROM auth.users WHERE email = %L), a.id, %L, %L, %L, %L, %L, %L, %L FROM public.assets a WHERE a.symbol = %L AND a.category = %L ON CONFLICT (id) DO NOTHING;',
      t.id, u.email, t.type, t.quantity, t.price_per_unit, t.currency,
      t.notes, t.transacted_at, t.created_at, a.symbol, a.category
    ) AS stmt
  FROM public.transactions t
  JOIN public.assets a ON a.id = t.asset_id
  JOIN auth.users u ON u.id = t.user_id
),
profile_rows AS (
  SELECT
    3 AS ord,
    1 AS sub,
    format(
      'UPDATE public.profiles SET display_name = %L, preferred_currency = %L, preferred_locale = %L WHERE id = (SELECT id FROM auth.users WHERE email = %L);',
      p.display_name, p.preferred_currency, p.preferred_locale, u.email
    ) AS stmt
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
)
SELECT string_agg(stmt, E'\n' ORDER BY ord, sub) AS migration_sql
FROM (
  SELECT * FROM asset_rows
  UNION ALL SELECT * FROM tx_rows
  UNION ALL SELECT * FROM profile_rows
) s;
