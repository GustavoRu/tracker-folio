import { API_URLS, DOLAR_TYPES, DOLAR_LABELS } from "@/lib/constants";
import type { DolarQuote } from "@/types/quote";

interface DolarApiResponse {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

export async function fetchDolarPrices(): Promise<DolarQuote[]> {
  const res = await fetch(API_URLS.dolar, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`DolarAPI error: ${res.status}`);
  }

  const data: DolarApiResponse[] = await res.json();

  return DOLAR_TYPES.map((type) => {
    const item = data.find((d) => d.casa === type);
    const compra = item?.compra ?? 0;
    const venta = item?.venta ?? 0;
    const spread = compra > 0 ? ((venta - compra) / compra) * 100 : 0;

    return {
      type: DOLAR_LABELS[type] ?? type,
      compra,
      venta,
      spread,
      fechaActualizacion: item?.fechaActualizacion ?? "",
    };
  });
}
