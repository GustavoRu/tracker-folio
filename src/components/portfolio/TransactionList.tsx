"use client";

import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { deleteTransaction } from "@/app/[locale]/(private)/portfolio/actions";
import { useState } from "react";

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

interface TransactionListProps {
  transactions: TransactionRow[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const t = useTranslations("portfolio");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!transactions.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-muted-foreground">{t("noTransactions")}</p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteTransaction(id);
    setDeletingId(null);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-3">{t("date")}</th>
            <th className="px-6 py-3">{t("type")}</th>
            <th className="px-6 py-3">{t("asset")}</th>
            <th className="px-6 py-3 text-right">{t("qty")}</th>
            <th className="px-6 py-3 text-right">{t("price")}</th>
            <th className="px-6 py-3 text-right">{t("totalCol")}</th>
            <th className="hidden px-6 py-3 md:table-cell">{t("notesCol")}</th>
            <th className="px-6 py-3 w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {transactions.map((tx) => {
            const total = tx.quantity * tx.price_per_unit;
            const cur = tx.currency as "USD" | "ARS";
            return (
              <tr
                key={tx.id}
                className="transition-colors hover:bg-card-hover"
              >
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(tx.transacted_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                      tx.type === "buy"
                        ? "bg-gain/10 text-gain"
                        : "bg-loss/10 text-loss"
                    }`}
                  >
                    {tx.type === "buy" ? t("buyLabel") : t("sellLabel")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-foreground">
                      {tx.assets.symbol}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.assets.name}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-medium tabular-nums text-foreground">
                  {tx.quantity}
                </td>
                <td className="px-6 py-4 text-right text-sm tabular-nums text-muted-foreground">
                  {formatCurrency(tx.price_per_unit, cur)}
                </td>
                <td className="px-6 py-4 text-right font-medium tabular-nums text-foreground">
                  {formatCurrency(total, cur)}
                </td>
                <td className="hidden px-6 py-4 text-sm text-muted-foreground md:table-cell">
                  {tx.notes || "-"}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(tx.id)}
                    disabled={deletingId === tx.id}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-loss/10 hover:text-loss disabled:opacity-50"
                    title={t("delete")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 3.25V4H2.75a.75.75 0 000 1.5h.3l.815 8.15A1.5 1.5 0 005.357 15h5.285a1.5 1.5 0 001.493-1.35l.815-8.15h.3a.75.75 0 000-1.5H11v-.75A2.25 2.25 0 008.75 1h-1.5A2.25 2.25 0 005 3.25zm2.25-.75a.75.75 0 00-.75.75V4h3v-.75a.75.75 0 00-.75-.75h-1.5zM6.05 6a.75.75 0 01.787.713l.275 5.5a.75.75 0 01-1.498.075l-.275-5.5A.75.75 0 016.05 6zm3.9 0a.75.75 0 01.712.787l-.275 5.5a.75.75 0 01-1.498-.075l.275-5.5a.75.75 0 01.786-.711z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
