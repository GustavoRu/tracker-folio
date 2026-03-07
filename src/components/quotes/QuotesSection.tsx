"use client";

import { useState } from "react";
import { CategoryTabs } from "./CategoryTabs";
import { QuotesTable } from "./QuotesTable";
import { DolarTable } from "./DolarTable";
import type { AssetCategory } from "@/types/quote";

export function QuotesSection() {
  const [category, setCategory] = useState<AssetCategory>("crypto");

  return (
    <div className="space-y-4">
      <CategoryTabs active={category} onChange={setCategory} />
      {category === "dolar" ? (
        <DolarTable />
      ) : (
        <QuotesTable category={category} />
      )}
    </div>
  );
}
