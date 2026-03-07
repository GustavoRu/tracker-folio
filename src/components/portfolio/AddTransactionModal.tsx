"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { addTransaction } from "@/app/[locale]/(private)/portfolio/actions";
import { AssetCombobox } from "@/components/ui/AssetCombobox";
import type { AssetOption } from "@/lib/constants";

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddTransactionModal({ open, onClose }: AddTransactionModalProps) {
  const t = useTranslations("transaction");

  const [type, setType] = useState<"buy" | "sell">("buy");
  const [selectedAsset, setSelectedAsset] = useState<AssetOption | null>(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<"USD" | "ARS">("USD");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const resetForm = () => {
    setType("buy");
    setSelectedAsset(null);
    setQuantity("");
    setPrice("");
    setCurrency("USD");
    setNotes("");
    setDate(new Date().toISOString().split("T")[0]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAsset) {
      setError(t("selectAssetError"));
      return;
    }

    setLoading(true);

    const result = await addTransaction({
      type,
      asset_symbol: selectedAsset.symbol,
      asset_name: selectedAsset.name,
      quantity: parseFloat(quantity),
      price_per_unit: parseFloat(price),
      currency,
      notes: notes || undefined,
      transacted_at: new Date(date).toISOString(),
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl mx-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {t("addTitle")}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-loss/10 px-4 py-3 text-sm text-loss">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Buy / Sell toggle */}
          <div className="flex gap-1 rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setType("buy")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                type === "buy"
                  ? "bg-gain text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("buy")}
            </button>
            <button
              type="button"
              onClick={() => setType("sell")}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                type === "sell"
                  ? "bg-loss text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("sell")}
            </button>
          </div>

          {/* Asset selector */}
          <AssetCombobox
            value={selectedAsset}
            onChange={setSelectedAsset}
            placeholder={t("searchAsset")}
            label={t("asset")}
          />

          {/* Quantity + Price row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                {t("quantity")}
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.5"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                {t("pricePerUnit")}
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="65000"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Currency + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                {t("currency")}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "USD" | "ARS")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                {t("date")}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              {t("notes")}
            </label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("notesPlaceholder")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Total preview */}
          {quantity && price && (
            <div className="rounded-lg bg-muted px-4 py-3 text-sm">
              <span className="text-muted-foreground">{t("total")}: </span>
              <span className="font-medium text-foreground">
                {currency === "USD" ? "$" : "ARS "}
                {(parseFloat(quantity) * parseFloat(price)).toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? t("saving") : t("save")}
          </button>
        </form>
      </div>
    </div>
  );
}
