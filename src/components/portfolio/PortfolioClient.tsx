"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AddTransactionModal } from "./AddTransactionModal";
import { TransactionList } from "./TransactionList";

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
}

export function PortfolioClient({ transactions }: PortfolioClientProps) {
  const t = useTranslations("portfolio");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
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

      <TransactionList transactions={transactions} />

      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
