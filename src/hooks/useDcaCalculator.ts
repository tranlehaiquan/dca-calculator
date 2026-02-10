import { useState, useEffect, useCallback, useRef } from "react";
import { fetchPriceHistory, calculateDCA } from "../api";
import type { PricePoint, InvestmentResult } from "../api";
import type { Asset, Frequency } from "@/constants";
import { ASSET_CONFIG } from "@/constants";

export function useDcaCalculator() {
  // Initialize from URL params if available
  const getInitialParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      asset: (params.get("asset") as Asset) || "BTC",
      amount: Number(params.get("amount")) || 100,
      frequency: (params.get("frequency") as Frequency) || "weekly",
      startDate: params.get("startDate") || "2023-01-01",
      endDate: params.get("endDate") || new Date().toISOString().split("T")[0],
    };
  };

  const initialParams = getInitialParams();

  const [asset, setAsset] = useState<Asset>(initialParams.asset);
  const [amount, setAmount] = useState(initialParams.amount);
  const [frequency, setFrequency] = useState<Frequency>(initialParams.frequency);
  const [startDate, setStartDate] = useState(initialParams.startDate);
  const [endDate, setEndDate] = useState(initialParams.endDate);

  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [result, setResult] = useState<InvestmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isFirstRender = useRef(true);

  // Sync state to URL params
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams();
    params.set("asset", asset);
    params.set("amount", amount.toString());
    params.set("frequency", frequency);
    params.set("startDate", startDate);
    params.set("endDate", endDate);

    const newRelativePathQuery = window.location.pathname + "?" + params.toString();
    window.history.replaceState(null, "", newRelativePathQuery);
  }, [asset, amount, frequency, startDate, endDate]);

  const performCalculation = useCallback(() => {
    if (prices.length === 0) return;

    const res = calculateDCA(
      prices,
      amount,
      frequency,
      new Date(startDate),
      new Date(endDate),
    );
    setResult(res);
  }, [prices, amount, frequency, startDate, endDate]);

  // Fetch prices when asset changes with debounce
  useEffect(() => {
    let isMounted = true;
    
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);

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
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [asset]);

  // Re-calculate when prices or inputs change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      performCalculation();
    }, 300);

    return () => clearTimeout(timer);
  }, [performCalculation]);

  return {
    // State
    asset,
    amount,
    frequency,
    startDate,
    endDate,
    prices,
    result,
    loading,
    error,
    // Setters
    setAsset,
    setAmount,
    setFrequency,
    setStartDate,
    setEndDate,
    // Actions
    calculate: performCalculation,
  };
}
