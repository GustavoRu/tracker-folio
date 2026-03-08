import { createClient } from "@/lib/supabase/server";
import { PortfolioClient } from "@/components/portfolio/PortfolioClient";
import { computeHoldings } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
      id,
      type,
      quantity,
      price_per_unit,
      currency,
      notes,
      transacted_at,
      assets (
        symbol,
        name,
        category
      )
    `
    )
    .order("transacted_at", { ascending: false });

  const txList = (transactions as never[]) ?? [];
  const holdings = computeHoldings(txList);

  return <PortfolioClient transactions={txList} holdings={holdings} />;
}
