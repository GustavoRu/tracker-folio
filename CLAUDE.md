# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server (Turbopack)
npm run build    # production build + type check
npm run lint     # ESLint
```

No test suite exists. Verify changes with `npm run build`.

## Architecture

Next.js 16 App Router with two parallel concerns: **public quotes** (home page) and **private portfolio** (auth-gated).

### Routing

```
src/app/
  layout.tsx                        ← returns children only, no html/body
  [locale]/layout.tsx               ← real root: html, body, providers, Header
  [locale]/page.tsx                 ← public home (quotes)
  [locale]/login/page.tsx           ← auth forms
  [locale]/(private)/portfolio/     ← protected route group
    layout.tsx                      ← auth guard (server component)
    page.tsx                        ← computes holdings server-side, passes to PortfolioClient
    actions.ts                      ← Server Actions: addTransaction, deleteTransaction
  api/quotes/crypto/route.ts        ← proxies CoinGecko, 30s in-memory cache
  api/quotes/dolar/route.ts         ← proxies dolarapi.com, 30s cache
  api/quotes/stocks/route.ts        ← proxies Yahoo Finance, 60s cache; ?type=stock|cedear
  auth/callback/route.ts            ← Supabase OAuth callback handler
```

### Data flow: Quotes (public)

`useQuotes(category)` / `useDolar()` → `/api/quotes/*` → server-side fetchers in `src/lib/api/`. TanStack Query with `staleTime: 30_000` and polling (`refetchInterval`). The API routes hold the only in-memory cache; client cache is per-session.

### Data flow: Portfolio (private)

1. `portfolio/page.tsx` (Server Component) fetches transactions from Supabase, runs `computeHoldings()` from `src/lib/portfolio.ts`, passes result to `<PortfolioClient>`.
2. `PortfolioClient` (client) calls `usePortfolioPrices(holdings)` — uses **same query keys** as `useQuotes`/`useDolar` so the two caches are shared: `["quotes", category]`.
3. All USD↔ARS conversion uses `dolarBlueVenta` from the dolar API ("Dolar Blue" label → `venta` price).

### Key data contracts

**`computeHoldings`** — aggregates buy/sell transactions into net positions. Returns `Holding[]` sorted by `totalCost` descending. Cost currency (`USD`|`ARS`) is preserved from the transaction currency.

**`PriceInfo`** — `{ currentPrice: number; currency: "USD" | "ARS" }`. CEDEARs price in ARS, everything else in USD. Conversion: `valueUSD = (qty * arsPrice) / dolarBlueVenta`.

**Dolar API quirk** — `dolar.ts` maps raw keys (`blue`) to labels (`"Dolar Blue"`). `usePortfolioPrices` must match on labels, not keys. `labelToSymbol` map handles this.

### Adding a new tradeable asset

1. Add to the relevant constant in `src/lib/constants.ts` (`CRYPTO_IDS`, `STOCK_TICKERS`, or `CEDEAR_TICKERS`).
2. Add a Supabase migration in `supabase/migrations/` to `INSERT INTO assets ... ON CONFLICT (symbol) DO NOTHING`.
3. Run the migration in the Supabase SQL Editor (no CLI migration runner is configured).

### i18n

`next-intl` with locales `es` (default) and `en`. Translations in `messages/es.json` and `messages/en.json`. **Use static imports only** in `src/i18n/request.ts` — dynamic template imports break with Turbopack.

### Auth

Supabase Auth with `@supabase/ssr` (cookie-based). Three clients:
- `src/lib/supabase/client.ts` — browser only; call inside `useEffect` or event handlers, never during SSR
- `src/lib/supabase/server.ts` — Server Components / Server Actions (`await createClient()`)
- `src/lib/supabase/middleware.ts` — session refresh in `middleware.ts`

`middleware.ts` chains next-intl + Supabase auth. Redirects unauthenticated users from `/portfolio` to `/{locale}/login`. Pages using the server client need `export const dynamic = "force-dynamic"`.

### Styling

Tailwind CSS v4. Dark mode via `@custom-variant dark (&:is(.dark *))` — no `darkMode` config. CSS variables for all theme tokens. Responsive pattern: mobile-first, `sm:` breakpoint for desktop variants (e.g. `h-8 sm:h-9`, `hidden sm:flex`).

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY    # server-side only
COINGECKO_API_KEY            # optional, for Pro API
```
