-- ============================================================
-- TrackerFolio Database Schema
-- Supabase (PostgreSQL)
-- ============================================================

-- PROFILES: Extends auth.users with app-specific preferences
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT,
  preferred_currency TEXT NOT NULL DEFAULT 'USD' CHECK (preferred_currency IN ('USD', 'ARS')),
  preferred_locale   TEXT NOT NULL DEFAULT 'es'  CHECK (preferred_locale IN ('es', 'en')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ASSET CATEGORIES ENUM
CREATE TYPE public.asset_category AS ENUM (
  'crypto',
  'stock',
  'cedear',
  'dolar'
);

-- ASSETS: Catalog of trackable assets
CREATE TABLE public.assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol          TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  category        public.asset_category NOT NULL,
  icon_url        TEXT,
  coingecko_id    TEXT,
  yahoo_ticker    TEXT,
  dolar_api_key   TEXT,
  rank            INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assets_category ON public.assets(category);
CREATE INDEX idx_assets_symbol ON public.assets(symbol);

-- TRANSACTIONS: User buy/sell records
CREATE TYPE public.transaction_type AS ENUM ('buy', 'sell');

CREATE TABLE public.transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id        UUID NOT NULL REFERENCES public.assets(id) ON DELETE RESTRICT,
  type            public.transaction_type NOT NULL,
  quantity        NUMERIC(20, 8) NOT NULL CHECK (quantity > 0),
  price_per_unit  NUMERIC(20, 8) NOT NULL CHECK (price_per_unit > 0),
  currency        TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'ARS')),
  notes           TEXT,
  transacted_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user ON public.transactions(user_id);
CREATE INDEX idx_transactions_asset ON public.transactions(asset_id);
CREATE INDEX idx_transactions_user_asset ON public.transactions(user_id, asset_id);

-- ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assets are publicly readable"
  ON public.assets FOR SELECT
  USING (TRUE);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
