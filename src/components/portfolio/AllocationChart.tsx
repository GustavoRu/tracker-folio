"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import type { Holding } from "@/lib/portfolio";
import type { PriceInfo } from "@/hooks/usePortfolioPrices";

const COLORS = [
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f97316", // orange
  "#ec4899", // pink
  "#14b8a6", // teal
  "#84cc16", // lime
];

interface Slice {
  symbol: string;
  name: string;
  valueUSD: number;
  percent: number;
  color: string;
}

interface AllocationChartProps {
  holdings: Holding[];
  priceMap: Map<string, PriceInfo>;
  dolarBlueVenta: number;
  isLoading: boolean;
}

function buildSlices(
  holdings: Holding[],
  priceMap: Map<string, PriceInfo>,
  dolarBlueVenta: number
): Slice[] {
  const items: { symbol: string; name: string; valueUSD: number }[] = [];

  for (const h of holdings) {
    const price = priceMap.get(h.symbol);
    if (!price) continue;

    let valueUSD: number;
    if (price.currency === "ARS" && dolarBlueVenta > 0) {
      valueUSD = (h.quantity * price.currentPrice) / dolarBlueVenta;
    } else {
      valueUSD = h.quantity * price.currentPrice;
    }

    if (valueUSD > 0) {
      items.push({ symbol: h.symbol, name: h.name, valueUSD });
    }
  }

  items.sort((a, b) => b.valueUSD - a.valueUSD);

  const total = items.reduce((s, i) => s + i.valueUSD, 0);
  if (total === 0) return [];

  return items.map((item, i) => ({
    symbol: item.symbol,
    name: item.name,
    valueUSD: item.valueUSD,
    percent: (item.valueUSD / total) * 100,
    color: COLORS[i % COLORS.length],
  }));
}

function PieSlice({
  startAngle,
  endAngle,
  color,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  radius = 80,
  cx = 100,
  cy = 100,
}: {
  startAngle: number;
  endAngle: number;
  color: string;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  radius?: number;
  cx?: number;
  cy?: number;
}) {
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;

  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  const d = [
    `M ${cx} ${cy}`,
    `L ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
    "Z",
  ].join(" ");

  return (
    <path
      d={d}
      fill={color}
      opacity={isHovered ? 0.8 : 1}
      stroke={isHovered ? "var(--color-foreground)" : "none"}
      strokeWidth={isHovered ? 1.5 : 0}
      className="cursor-pointer transition-opacity"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
}

export function AllocationChart({
  holdings,
  priceMap,
  dolarBlueVenta,
  isLoading,
}: AllocationChartProps) {
  const t = useTranslations("holdings");
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
    );
  }

  const slices = buildSlices(holdings, priceMap, dolarBlueVenta);

  if (slices.length === 0) return null;

  const arcs = slices.reduce<
    (Slice & { startAngle: number; endAngle: number })[]
  >((acc, slice) => {
    const start = acc.length > 0 ? acc[acc.length - 1].endAngle : 0;
    const sweep = (slice.percent / 100) * 360;
    acc.push({ ...slice, startAngle: start, endAngle: start + sweep });
    return acc;
  }, []);

  const hoveredSlice = hoveredSymbol
    ? slices.find((s) => s.symbol === hoveredSymbol)
    : null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        {t("allocation")}
      </h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        {/* SVG Pie with tooltip */}
        <div className="relative shrink-0">
          <svg viewBox="0 0 200 200" className="h-48 w-48 sm:h-56 sm:w-56">
            {arcs.map((arc) =>
              arc.endAngle - arc.startAngle >= 0.5 ? (
                <PieSlice
                  key={arc.symbol}
                  startAngle={arc.startAngle}
                  endAngle={arc.endAngle}
                  color={arc.color}
                  isHovered={hoveredSymbol === arc.symbol}
                  onMouseEnter={() => setHoveredSymbol(arc.symbol)}
                  onMouseLeave={() => setHoveredSymbol(null)}
                />
              ) : null
            )}
            {/* Center hole for donut effect */}
            <circle cx="100" cy="100" r="45" className="fill-card" />
            {/* Center text on hover */}
            {hoveredSlice && (
              <>
                <text
                  x="100"
                  y="95"
                  textAnchor="middle"
                  className="fill-foreground text-[11px] font-semibold"
                >
                  {hoveredSlice.symbol}
                </text>
                <text
                  x="100"
                  y="112"
                  textAnchor="middle"
                  className="fill-muted-foreground text-[9px]"
                >
                  {formatCurrency(hoveredSlice.valueUSD, "USD")}
                </text>
              </>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slices.map((slice) => (
            <div
              key={slice.symbol}
              className={`flex items-start gap-2 rounded-md px-1.5 py-0.5 transition-colors ${
                hoveredSymbol === slice.symbol ? "bg-muted" : ""
              }`}
              onMouseEnter={() => setHoveredSymbol(slice.symbol)}
              onMouseLeave={() => setHoveredSymbol(null)}
            >
              <div
                className="mt-1 h-3 w-3 shrink-0 rounded-sm"
                style={{ backgroundColor: slice.color }}
              />
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {slice.symbol}
                  </span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {slice.percent.toFixed(1)}%
                  </span>
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {formatCurrency(slice.valueUSD, "USD")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
