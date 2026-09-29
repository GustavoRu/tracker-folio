"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePortfolioPrices } from "@/hooks/usePortfolioPrices";
import { AddTransactionModal } from "./AddTransactionModal";
import { TransactionList } from "./TransactionList";
import { PortfolioSummary } from "./PortfolioSummary";
import { HoldingsTable } from "./HoldingsTable";
import { PortfolioAnalytics } from "./PortfolioAnalytics";
import { AssetDetailView } from "./AssetDetailView";
import { holdingKey, type Holding } from "@/lib/portfolio";
import { cn } from "@/lib/utils";
import { CoinGeckoAttribution } from "@/components/ui/CoinGeckoAttribution";
import type { AssetCategory } from "@/types/quote";

const TABS = ["holdings", "analytics", "transactions"] as const;
type Tab = (typeof TABS)[number];

const TAB_MESSAGE_KEYS: Record<Tab, string> = {
  holdings: "holdingsTab",
  analytics: "analyticsTab",
  transactions: "transactionsTab",
};

interface TransactionRow {
  id: string;
  type: "buy" | "sell";
  quantity: number;
  price_per_unit: number;
  currency: string;
  notes: string | null;
  transacted_at: string;
  assets: {
    symbol: string;
    name: string;
    category: AssetCategory;
  };
}

interface PortfolioClientProps {
  transactions: TransactionRow[];
  holdings: Holding[];
}

export function PortfolioClient({ transactions, holdings }: PortfolioClientProps) {
  const t = useTranslations("portfolio");
  const ht = useTranslations("holdings");
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("holdings");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const { priceMap, iconMap, dolarBlueVenta, isLoading } = usePortfolioPrices(holdings);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedAsset(null);
  };

  const openAssetDetail = (key: string) => {
    setActiveTab("holdings");
    setSelectedAsset(key);
  };

  // selectedAsset holds a holdingKey (category:symbol) — symbols repeat across categories
  const selectedHolding = selectedAsset
    ? holdings.find((h) => holdingKey(h) === selectedAsset)
    : null;

  const filteredTransactions = selectedHolding
    ? transactions.filter((tx) => holdingKey(tx.assets) === selectedAsset)
    : transactions;

  return (
    <div className="space-y-6 pb-24 sm:pb-0">
      {/* Compact CoinGecko-style header: title, total, 24h and total P&L */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-sm font-medium text-muted-foreground">{t("title")}</h1>
          {holdings.length > 0 && (
            <PortfolioSummary
              holdings={holdings}
              priceMap={priceMap}
              dolarBlueVenta={dolarBlueVenta}
              isLoading={isLoading}
            />
          )}
        </div>
        {/* Desktop button */}
        <button
          onClick={() => setModalOpen(true)}
          className="hidden shrink-0 items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:flex"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          {t("addTransaction")}
        </button>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform hover:scale-105 active:scale-95 sm:hidden"
        aria-label={t("addTransaction")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
      </button>

      {/* Tab switcher + content */}
      {holdings.length > 0 && (
        <div>
          {/* Text tabs with an accent underline, as in CoinGecko */}
          <div role="tablist" className="mb-4 flex gap-6 border-b border-border">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  id={`portfolio-tab-${tab}`}
                  aria-selected={isActive}
                  aria-controls="portfolio-tabpanel"
                  onClick={() => handleTabChange(tab)}
                  className={cn(
                    "relative -mb-px pb-2.5 text-[15px] transition-colors",
                    isActive
                      ? "font-semibold text-foreground"
                      : "font-medium text-muted-foreground hover:text-foreground"
                  )}
                >
                  {ht(TAB_MESSAGE_KEYS[tab])}
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-accent" />
                  )}
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id="portfolio-tabpanel"
            aria-labelledby={`portfolio-tab-${activeTab}`}
          >
            {activeTab === "holdings" ? (
              selectedHolding ? (
                <AssetDetailView
                  holding={selectedHolding}
                  priceInfo={priceMap.get(selectedAsset!)}
                  iconUrl={iconMap.get(selectedAsset!)}
                  dolarBlueVenta={dolarBlueVenta}
                  transactions={filteredTransactions}
                  onBack={() => setSelectedAsset(null)}
                />
              ) : (
                <HoldingsTable
                  holdings={holdings}
                  priceMap={priceMap}
                  iconMap={iconMap}
                  dolarBlueVenta={dolarBlueVenta}
                  isLoading={isLoading}
                  onSelectAsset={setSelectedAsset}
                />
              )
            ) : activeTab === "analytics" ? (
              <PortfolioAnalytics
                holdings={holdings}
                priceMap={priceMap}
                iconMap={iconMap}
                dolarBlueVenta={dolarBlueVenta}
                isLoading={isLoading}
                onSelectAsset={openAssetDetail}
              />
            ) : (
              <TransactionList transactions={transactions} />
            )}
          </div>

          {/* Header totals use crypto prices on every tab */}
          {holdings.some((h) => h.category === "crypto") && (
            <CoinGeckoAttribution className="mt-4" />
          )}
        </div>
      )}

      {/* Empty state for new users */}
      {holdings.length === 0 && transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-accent">
              <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">{t("emptyTitle")}</h3>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">{t("emptyDescription")}</p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            {t("addTransaction")}
          </button>
        </div>
      )}

      {/* If no holdings but has transactions, show transaction list */}
      {holdings.length === 0 && transactions.length > 0 && (
        <TransactionList transactions={transactions} />
      )}

      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        holdings={holdings}
      />
    </div>
  );
}
