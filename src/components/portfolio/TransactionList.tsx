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
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!transactions.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-muted-foreground">{t("noTransactions")}</p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    setDeletingId(id);
    await deleteTransaction(id);
    setDeletingId(null);
  };

  const confirmTx = confirmDeleteId
    ? transactions.find((tx) => tx.id === confirmDeleteId)
    : null;

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 sm:px-6">{t("date")}</th>
              <th className="px-4 py-3 sm:px-6">{t("type")}</th>
              <th className="px-4 py-3 sm:px-6">{t("asset")}</th>
              <th className="px-4 py-3 text-right sm:px-6">{t("qty")}</th>
              <th className="hidden px-4 py-3 text-right sm:table-cell sm:px-6">{t("price")}</th>
              <th className="px-4 py-3 text-right sm:px-6">{t("totalCol")}</th>
              <th className="hidden px-6 py-3 md:table-cell">{t("notesCol")}</th>
              <th className="w-10 px-2 py-3 sm:w-12 sm:px-6"></th>
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
                  <td className="px-4 py-4 text-sm text-muted-foreground sm:px-6">
                    {new Date(tx.transacted_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 sm:px-6">
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
                  <td className="px-4 py-4 sm:px-6">
                    <div>
                      <p className="font-medium text-foreground">
                        {tx.assets.symbol}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.assets.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right font-medium tabular-nums text-foreground sm:px-6">
                    {tx.quantity}
                  </td>
                  <td className="hidden px-4 py-4 text-right text-sm tabular-nums text-muted-foreground sm:table-cell sm:px-6">
                    {formatCurrency(tx.price_per_unit, cur)}
                  </td>
                  <td className="px-4 py-4 text-right font-medium tabular-nums text-foreground sm:px-6">
                    {formatCurrency(total, cur)}
                  </td>
                  <td className="hidden px-6 py-4 text-sm text-muted-foreground md:table-cell">
                    {tx.notes || "-"}
                  </td>
                  <td className="px-2 py-4 sm:px-6">
                    <button
                      onClick={() => setConfirmDeleteId(tx.id)}
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

      {/* Delete Confirmation Modal */}
      {confirmTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div className="relative z-10 mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground">
              {t("deleteConfirmTitle")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("deleteConfirmMessage")}
            </p>
            <div className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm">
              <span className="font-medium text-foreground">{confirmTx.assets.symbol}</span>
              <span className="text-muted-foreground">
                {" "}&middot; {confirmTx.type === "buy" ? t("buyLabel") : t("sellLabel")}{" "}
                {confirmTx.quantity} @ {formatCurrency(confirmTx.price_per_unit, confirmTx.currency as "USD" | "ARS")}
              </span>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId!)}
                disabled={deletingId === confirmDeleteId}
                className="flex-1 rounded-lg bg-loss px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {deletingId === confirmDeleteId ? "..." : t("confirmDelete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
