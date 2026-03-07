import { createClient } from "@/lib/supabase/server";
import { PortfolioClient } from "@/components/portfolio/PortfolioClient";

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
        name
      )
    `
    )
    .order("transacted_at", { ascending: false });

  return <PortfolioClient transactions={(transactions as never[]) ?? []} />;
}
