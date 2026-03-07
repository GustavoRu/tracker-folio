"use client";

import { useState, useRef, useEffect } from "react";
import { ALL_ASSETS, type AssetOption } from "@/lib/constants";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  crypto: "Crypto",
  stock: "Stock",
  cedear: "CEDEAR",
  dolar: "Dolar",
};

interface AssetComboboxProps {
  value: AssetOption | null;
  onChange: (asset: AssetOption) => void;
  placeholder?: string;
  label: string;
}

export function AssetCombobox({
  value,
  onChange,
  placeholder = "Search asset...",
  label,
}: AssetComboboxProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered =
    query.length === 0
      ? ALL_ASSETS
      : ALL_ASSETS.filter(
          (a) =>
            a.symbol.toLowerCase().includes(query.toLowerCase()) ||
            a.name.toLowerCase().includes(query.toLowerCase())
        );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (asset: AssetOption) => {
    onChange(asset);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div
        className={cn(
          "flex items-center rounded-lg border bg-background px-3 py-2 text-sm transition-colors",
          isOpen ? "border-accent ring-1 ring-accent" : "border-border"
        )}
      >
        {value && !isOpen ? (
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            className="flex w-full items-center gap-2 text-left"
          >
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
              {value.symbol}
            </span>
            <span className="text-foreground">{value.name}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {CATEGORY_LABELS[value.category]}
            </span>
          </button>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-xl">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No results
            </div>
          ) : (
            filtered.slice(0, 30).map((asset) => (
              <button
                key={`${asset.category}-${asset.symbol}`}
                type="button"
                onClick={() => handleSelect(asset)}
                className={cn(
                  "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-card-hover",
                  value?.symbol === asset.symbol &&
                    value?.category === asset.category &&
                    "bg-muted"
                )}
              >
                <span className="w-16 shrink-0 font-medium text-foreground">
                  {asset.symbol}
                </span>
                <span className="truncate text-muted-foreground">
                  {asset.name}
                </span>
                <span className="ml-auto shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  {CATEGORY_LABELS[asset.category]}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
