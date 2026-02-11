import { useState, useEffect } from "react";
import { fetchVnStockHistory } from "../api";
import type { PricePoint } from "../api";

export function useVnStockPrice(symbol: string) {
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPrices() {
      if (!symbol) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchVnStockHistory(symbol);
        if (data.length === 0) {
          setError("Could not load price data for " + symbol);
        } else {
          setPrices(data);
        }
      } catch (err) {
        setError("Failed to fetch price history");
      } finally {
        setLoading(false);
      }
    }

    loadPrices();
  }, [symbol]);

  return { prices, loading, error };
}
