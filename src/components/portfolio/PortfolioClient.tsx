"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePortfolioPrices } from "@/hooks/usePortfolioPrices";
import { AddTransactionModal } from "./AddTransactionModal";
import { TransactionList } from "./TransactionList";
import { PortfolioSummary } from "./PortfolioSummary";
import { HoldingsTable } from "./HoldingsTable";
import { AllocationChart } from "./AllocationChart";
import { AssetDetailView } from "./AssetDetailView";
import type { Holding } from "@/lib/portfolio";

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
  const [activeTab, setActiveTab] = useState<"holdings" | "transactions">("holdings");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const { priceMap, dolarBlueVenta, isLoading } = usePortfolioPrices(holdings);

  const handleTabChange = (tab: "holdings" | "transactions") => {
    setActiveTab(tab);
    setSelectedAsset(null);
  };

  const selectedHolding = selectedAsset
    ? holdings.find((h) => h.symbol === selectedAsset)
    : null;

  const filteredTransactions = selectedAsset
    ? transactions.filter((tx) => tx.assets.symbol === selectedAsset)
    : transactions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{t("subtitle")}</p>
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

      {/* Summary cards */}
      {holdings.length > 0 && (
        <PortfolioSummary
          holdings={holdings}
          priceMap={priceMap}
          dolarBlueVenta={dolarBlueVenta}
          isLoading={isLoading}
        />
      )}

      {/* Allocation chart - full width */}
      {holdings.length > 0 && (
        <AllocationChart
          holdings={holdings}
          priceMap={priceMap}
          dolarBlueVenta={dolarBlueVenta}
          isLoading={isLoading}
        />
      )}

      {/* Tab switcher + content */}
      {holdings.length > 0 && (
        <div>
          {/* Tab switcher */}
          <div className="mb-4 flex gap-1 rounded-xl bg-muted p-1">
            <button
              onClick={() => handleTabChange("holdings")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "holdings"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {ht("holdingsTab")}
            </button>
            <button
              onClick={() => handleTabChange("transactions")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "transactions"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {ht("transactionsTab")}
            </button>
          </div>

          {activeTab === "holdings" ? (
            selectedHolding ? (
              <AssetDetailView
                holding={selectedHolding}
                priceInfo={priceMap.get(selectedAsset!)}
                dolarBlueVenta={dolarBlueVenta}
                transactions={filteredTransactions}
                onBack={() => setSelectedAsset(null)}
              />
            ) : (
              <HoldingsTable
                holdings={holdings}
                priceMap={priceMap}
                dolarBlueVenta={dolarBlueVenta}
                isLoading={isLoading}
                onSelectAsset={setSelectedAsset}
              />
            )
          ) : (
            <TransactionList transactions={transactions} />
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
      />
    </div>
  );
}
