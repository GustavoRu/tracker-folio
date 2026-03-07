export interface Transaction {
  id: string;
  user_id: string;
  asset_symbol: string;
  asset_name: string;
  type: "buy" | "sell";
  quantity: number;
  price_per_unit: number;
  currency: "USD" | "ARS";
  notes: string | null;
  transacted_at: string;
  created_at: string;
}

export interface TransactionFormData {
  type: "buy" | "sell";
  asset_symbol: string;
  asset_name: string;
  quantity: number;
  price_per_unit: number;
  currency: "USD" | "ARS";
  notes?: string;
  transacted_at: string;
}
