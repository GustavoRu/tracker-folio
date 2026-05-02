"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { addTransaction } from "@/app/[locale]/(private)/portfolio/actions";
import { AssetCombobox } from "@/components/ui/AssetCombobox";
import type { AssetOption } from "@/lib/constants";
import type { Holding } from "@/lib/portfolio";

const STABLECOINS = ["USDT", "USDC", "USD"];

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  holdings?: Holding[];
}

export function AddTransactionModal({ open, onClose, holdings }: AddTransactionModalProps) {
  const t = useTranslations("transaction");

  const [type, setType] = useState<"buy" | "sell">("buy");
  const [selectedAsset, setSelectedAsset] = useState<AssetOption | null>(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [total, setTotal] = useState("");
  const [currency, setCurrency] = useState<"USD" | "ARS">("USD");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [counterpart, setCounterpart] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const resetForm = () => {
    setType("buy");
    setSelectedAsset(null);
    setQuantity("");
    setPrice("");
    setTotal("");
    setCurrency("USD");
    setNotes("");
    setDate(new Date().toISOString().split("T")[0]);
    setCounterpart("");
    setError(null);
  };

  // Bidirectional total calculation — each handler derives the third value
  const handleQuantityChange = (val: string) => {
    setQuantity(val);
    const q = parseFloat(val);
    const p = parseFloat(price);
    if (!isNaN(q) && !isNaN(p) && q >= 0 && p >= 0) {
      setTotal((q * p).toFixed(2));
    }
  };

  const handlePriceChange = (val: string) => {
    setPrice(val);
    const q = parseFloat(quantity);
    const p = parseFloat(val);
    if (!isNaN(q) && !isNaN(p) && q >= 0 && p >= 0) {
      setTotal((q * p).toFixed(2));
    }
  };

  const handleTotalChange = (val: string) => {
    setTotal(val);
    const tot = parseFloat(val);
    const q = parseFloat(quantity);
    const p = parseFloat(price);
    if (!isNaN(tot) && tot > 0) {
      if (!isNaN(q) && q > 0) {
        setPrice((tot / q).toFixed(8));
      } else if (!isNaN(p) && p > 0) {
        setQuantity((tot / p).toFixed(8));
      }
    }
  };

  // Stablecoin counterpart options — only stablecoins with positive balance, excluding the selected asset
  const availableStablecoins = (holdings ?? [])
    .filter(
      (h) =>
        h.quantity > 0 &&
        STABLECOINS.includes(h.symbol) &&
        h.symbol !== selectedAsset?.symbol
    )
    .map((h) => h.symbol);

  const showCounterpart =
    availableStablecoins.length > 0 &&
    selectedAsset !== null &&
    !STABLECOINS.includes(selectedAsset.symbol) &&
    parseFloat(total) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAsset) {
      setError(t("selectAssetError"));
      return;
    }

    const qty = parseFloat(quantity);
    const prc = parseFloat(price);
    if (isNaN(qty) || isNaN(prc) || qty <= 0 || prc <= 0) {
      setError(t("invalidAmounts"));
      return;
    }

    setLoading(true);

    const result = await addTransaction({
      type,
      asset_symbol: selectedAsset.symbol,
      asset_name: selectedAsset.name,
      quantity: qty,
      price_per_unit: prc,
      currency,
      notes: notes || undefined,
      transacted_at: new Date(date).toISOString(),
    });

    if (result.error) {
      setLoading(false);
      setError(result.error);
      return;
    }

    // Stablecoin counterpart transaction
    if (counterpart && parseFloat(total) > 0) {
      const counterpartResult = await addTransaction({
        type: type === "buy" ? "sell" : "buy",
        asset_symbol: counterpart,
        asset_name: counterpart,
        quantity: parseFloat(total),
        price_per_unit: 1,
        currency: "USD",
        notes: `Auto: contrapartida ${type === "buy" ? "compra" : "venta"} ${selectedAsset.symbol}`,
        transacted_at: new Date(date).toISOString(),
      });

      if (counterpartResult.error) {
        setLoading(false);
        setError(`Transacción guardada, pero error en contrapartida: ${counterpartResult.error}`);
        return;
      }
    }

    setLoading(false);
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
      <div className="relative z-10 mx-4 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl">
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

          {/* Total gastado (bidirectional) */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              {t("totalSpent")}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                min="0"
                value={total}
                onChange={(e) => handleTotalChange(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <span className="shrink-0 text-sm font-medium text-muted-foreground">{currency}</span>
            </div>
          </div>

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
                onChange={(e) => handleQuantityChange(e.target.value)}
                placeholder="0.5"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="65000"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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

          {/* Stablecoin counterpart selector */}
          {showCounterpart && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                {type === "buy" ? t("deductFrom") : t("creditTo")}
              </label>
              <select
                value={counterpart}
                onChange={(e) => setCounterpart(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">{t("noCounterpart")}</option>
                {availableStablecoins.map((sym) => (
                  <option key={sym} value={sym}>
                    {sym}
                  </option>
                ))}
              </select>
            </div>
          )}

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
