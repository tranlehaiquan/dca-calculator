import { useState, useEffect } from "react";
import { fetchPriceHistory } from "../api";
import type { PricePoint } from "../api";
import type { Asset } from "@/constants";
import { ASSET_CONFIG } from "@/constants";

export function useAssetPrice(asset: Asset) {
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Reset state when asset changes
    setLoading(true);
    setError(null);
    setPrices([]);

    const timer = setTimeout(() => {
      fetchPriceHistory(asset)
        .then((data) => {
          if (isMounted) {
            setPrices(data);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.error(err);
            setError(
              `Failed to load ${ASSET_CONFIG[asset].label} price history.`,
            );
            setLoading(false);
          }
        });
    }, 300); // Keep the debounce

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [asset]);

  return { prices, loading, error };
}
