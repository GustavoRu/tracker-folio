"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePortfolioPrices } from "@/hooks/usePortfolioPrices";
import { AddTransactionModal } from "./AddTransactionModal";
import { TransactionList } from "./TransactionList";
import { PortfolioSummary } from "./PortfolioSummary";
import { HoldingsTable } from "./HoldingsTable";
import { AllocationChart } from "./AllocationChart";
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

  const { priceMap, dolarBlueVenta, isLoading } = usePortfolioPrices(holdings);

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

      {/* Allocation chart + Holdings/Transactions tabs */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <AllocationChart
              holdings={holdings}
              priceMap={priceMap}
              dolarBlueVenta={dolarBlueVenta}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-2">
            {/* Tab switcher */}
            <div className="mb-4 flex gap-1 rounded-xl bg-muted p-1">
              <button
                onClick={() => setActiveTab("holdings")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === "holdings"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {ht("holdingsTab")}
              </button>
              <button
                onClick={() => setActiveTab("transactions")}
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
              <HoldingsTable
                holdings={holdings}
                priceMap={priceMap}
                dolarBlueVenta={dolarBlueVenta}
                isLoading={isLoading}
              />
            ) : (
              <TransactionList transactions={transactions} />
            )}
          </div>
        </div>
      )}

      {/* If no holdings, just show transactions */}
      {holdings.length === 0 && (
        <TransactionList transactions={transactions} />
      )}

      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
