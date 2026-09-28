"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { computeHoldingPnl, holdingKey, type Holding } from "@/lib/portfolio";
import type { PriceInfo } from "@/hooks/usePortfolioPrices";
import { AllocationBar, type AllocationItem } from "./AllocationBar";

const SERIES_COLORS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
];
const OTHER_COLOR = "var(--series-other)";
const OTHER_KEY = "__other";

interface AllocationChartProps {
  holdings: Holding[];
  priceMap: Map<string, PriceInfo>;
  dolarBlueVenta: number;
}

function buildSlices(
  holdings: Holding[],
  priceMap: Map<string, PriceInfo>,
  dolarBlueVenta: number
): AllocationItem[] {
  const items: { key: string; label: string; valueUSD: number }[] = [];

  for (const h of holdings) {
    const price = priceMap.get(holdingKey(h));
    if (h.quantity === 0 || !price) continue;

    const { valueUSD } = computeHoldingPnl(h, price, dolarBlueVenta);
    if (valueUSD > 0) {
      items.push({ key: holdingKey(h), label: h.symbol, valueUSD });
    }
  }

  items.sort((a, b) => b.valueUSD - a.valueUSD);

  const total = items.reduce((s, i) => s + i.valueUSD, 0);
  if (total === 0) return [];

  return items.map((item, i) => ({
    ...item,
    percent: (item.valueUSD / total) * 100,
    color: SERIES_COLORS[i] ?? OTHER_COLOR,
  }));
}

// Hues are never cycled: everything past the palette folds into one "Other" mark
function foldSegments(slices: AllocationItem[], otherLabel: string): AllocationItem[] {
  if (slices.length <= SERIES_COLORS.length) return slices;

  const tail = slices.slice(SERIES_COLORS.length);
  return [
    ...slices.slice(0, SERIES_COLORS.length),
    {
      key: OTHER_KEY,
      label: otherLabel,
      valueUSD: tail.reduce((s, i) => s + i.valueUSD, 0),
      percent: tail.reduce((s, i) => s + i.percent, 0),
      color: OTHER_COLOR,
    },
  ];
}

function PieSlice({
  startAngle,
  endAngle,
  color,
  isDimmed,
  onMouseEnter,
  onMouseLeave,
  radius = 80,
  cx = 100,
  cy = 100,
}: {
  startAngle: number;
  endAngle: number;
  color: string;
  isDimmed: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  radius?: number;
  cx?: number;
  cy?: number;
}) {
  const handlers = {
    onMouseEnter,
    onMouseLeave,
    opacity: isDimmed ? 0.4 : 1,
    className: "cursor-pointer transition-opacity",
  };

  // A lone slice is a full circle, which an arc path cannot draw
  if (endAngle - startAngle >= 359.99) {
    return <circle cx={cx} cy={cy} r={radius} fill={color} {...handlers} />;
  }

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

  // Surface-colored stroke is the 2px gap between slices
  return (
    <path
      d={d}
      fill={color}
      stroke="var(--card)"
      strokeWidth={2}
      strokeLinejoin="round"
      {...handlers}
    />
  );
}

export function AllocationChart({
  holdings,
  priceMap,
  dolarBlueVenta,
}: AllocationChartProps) {
  const t = useTranslations("holdings");
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const slices = buildSlices(holdings, priceMap, dolarBlueVenta);
  if (slices.length === 0) return null;

  const segments = foldSegments(slices, t("others"));
  const segmentKeyOf = (slice: AllocationItem) =>
    slice.color === OTHER_COLOR ? OTHER_KEY : slice.key;

  const arcs = segments.reduce<
    (AllocationItem & { startAngle: number; endAngle: number })[]
  >((acc, segment) => {
    const start = acc.length > 0 ? acc[acc.length - 1].endAngle : 0;
    const sweep = (segment.percent / 100) * 360;
    acc.push({ ...segment, startAngle: start, endAngle: start + sweep });
    return acc;
  }, []);

  const hoveredSegment = hoveredKey
    ? segments.find((s) => s.key === hoveredKey)
    : null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        {t("allocationByAsset")}
      </h3>
      {/* Desktop: donut + legend side by side */}
      <div className="hidden items-center gap-6 sm:flex">
        <div className="relative shrink-0">
          <svg viewBox="0 0 200 200" className="h-56 w-56">
            {arcs.map((arc) =>
              arc.endAngle - arc.startAngle >= 0.5 ? (
                <PieSlice
                  key={arc.key}
                  startAngle={arc.startAngle}
                  endAngle={arc.endAngle}
                  color={arc.color}
                  isDimmed={hoveredKey !== null && hoveredKey !== arc.key}
                  onMouseEnter={() => setHoveredKey(arc.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                />
              ) : null
            )}
            <circle cx="100" cy="100" r="45" className="fill-card" />
            {hoveredSegment && (
              <>
                <text
                  x="100"
                  y="95"
                  textAnchor="middle"
                  className="fill-foreground text-[11px] font-semibold"
                >
                  {hoveredSegment.label}
                </text>
                <text
                  x="100"
                  y="112"
                  textAnchor="middle"
                  className="fill-muted-foreground text-[9px]"
                >
                  {formatCurrency(hoveredSegment.valueUSD, "USD")}
                </text>
              </>
            )}
          </svg>
        </div>
        <div className="grid w-full grid-cols-2 gap-3 lg:grid-cols-3">
          {slices.map((slice) => {
            const segmentKey = segmentKeyOf(slice);
            return (
              <div
                key={slice.key}
                className={`flex items-start gap-2 rounded-md px-1.5 py-0.5 transition-colors ${
                  hoveredKey === segmentKey ? "bg-muted" : ""
                }`}
                onMouseEnter={() => setHoveredKey(segmentKey)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <div
                  className="mt-1 h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: slice.color }}
                />
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {slice.label}
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
            );
          })}
        </div>
      </div>

      {/* Mobile: stacked bar + full legend */}
      <div className="sm:hidden">
        <AllocationBar segments={segments} legend={slices} />
      </div>
    </div>
  );
}
