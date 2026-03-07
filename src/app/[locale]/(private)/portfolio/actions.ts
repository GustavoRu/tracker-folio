"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

interface AddTransactionInput {
  type: "buy" | "sell";
  asset_symbol: string;
  asset_name: string;
  quantity: number;
  price_per_unit: number;
  currency: "USD" | "ARS";
  notes?: string;
  transacted_at: string;
}

export async function addTransaction(input: AddTransactionInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Look up the asset in the catalog
  const { data: asset } = await supabase
    .from("assets")
    .select("id")
    .eq("symbol", input.asset_symbol.toUpperCase())
    .single();

  if (!asset) {
    return { error: `Asset "${input.asset_symbol}" not found in catalog` };
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    asset_id: asset.id,
    type: input.type,
    quantity: input.quantity,
    price_per_unit: input.price_per_unit,
    currency: input.currency,
    notes: input.notes || null,
    transacted_at: input.transacted_at,
  });

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
