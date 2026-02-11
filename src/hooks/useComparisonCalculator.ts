import { useState, useEffect, useCallback } from "react";
import { fetchPriceHistory, calculateDCA } from "../api";
import type { InvestmentResult } from "../api";
import { useDcaParams } from "./useDcaParams";
import type { Asset } from "@/constants";

export function useComparisonCalculator() {
  const {
    amount,
    setAmount,
    frequency,
    setFrequency,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = useDcaParams(false);

  const [results, setResults] = useState<Record<Asset, InvestmentResult | null>>({
    BTC: null,
    Gold: null,
    Silver: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllPricesAndCalculate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const assets: Asset[] = ["BTC", "Gold", "Silver"];
      const pricePromises = assets.map(asset => fetchPriceHistory(asset));
      const pricesArray = await Promise.all(pricePromises);

      const newResults: any = {};
      assets.forEach((asset, index) => {
        const prices = pricesArray[index];
        newResults[asset] = calculateDCA(
          prices,
          amount,
          frequency,
          new Date(startDate),
          new Date(endDate)
        );
      });

      setResults(newResults);
    } catch (err) {
      console.error(err);
      setError("Failed to load price history for comparison.");
    } finally {
      setLoading(false);
    }
  }, [amount, frequency, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllPricesAndCalculate();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchAllPricesAndCalculate]);

  return {
    amount,
    setAmount,
    frequency,
    setFrequency,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    results,
    loading,
    error,
    calculate: fetchAllPricesAndCalculate,
  };
}