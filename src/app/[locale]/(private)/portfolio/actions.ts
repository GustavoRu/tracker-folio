"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

interface AddTransactionInput {
  type: "buy" | "sell";
  asset_symbol: string;
  asset_category: "crypto" | "stock" | "cedear" | "dolar";
  asset_name: string;
  quantity: number;
  price_per_unit: number;
  currency: "USD" | "ARS";
  notes?: string;
  transacted_at: string;
}

// Symbols repeat across categories (e.g. MELI stock vs MELI cedear), so match both.
// A failed lookup and a missing row are different problems and must not share a message.
async function resolveAssetId(
  supabase: SupabaseClient,
  symbol: string,
  category: string
): Promise<{ id?: string; error?: string }> {
  const { data, error } = await supabase
    .from("assets")
    .select("id")
    .eq("symbol", symbol.toUpperCase())
    .eq("category", category)
    .maybeSingle();

  if (error) {
    return {
      error: `Could not look up "${symbol}" (${category}): ${error.message}`,
    };
  }

  if (!data) {
    return { error: `Asset "${symbol}" (${category}) not found in catalog` };
  }

  return { id: data.id as string };
}

// Takes every leg of a trade at once: a buy and its stablecoin counterpart go in
// as one INSERT, so a failure can never leave the trade half recorded.
export async function addTransactions(legs: AddTransactionInput[]) {
  if (legs.length === 0) {
    return { error: "No transactions to add" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Resolve every asset before writing anything
  const rows = [];
  for (const leg of legs) {
    const { id, error } = await resolveAssetId(
      supabase,
      leg.asset_symbol,
      leg.asset_category
    );

    if (error) {
      return { error };
    }

    rows.push({
      user_id: user.id,
      asset_id: id,
      type: leg.type,
      quantity: leg.quantity,
      price_per_unit: leg.price_per_unit,
      currency: leg.currency,
      notes: leg.notes || null,
      transacted_at: leg.transacted_at,
    });
  }

  const { error } = await supabase.from("transactions").insert(rows);

  if (error) {
    return { error: `Failed to add transaction: ${error.message}` };
  }

  revalidatePath("/portfolio");
  return { success: true };
}

export async function deleteTransaction(transactionId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", user.id);

  if (error) {
    return { error: `Failed to delete transaction: ${error.message}` };
  }

  revalidatePath("/portfolio");
  return { success: true };
}
