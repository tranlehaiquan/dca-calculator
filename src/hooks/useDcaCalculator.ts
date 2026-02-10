import { useState, useEffect, useCallback } from "react";
import { calculateDCA } from "../api";
import type { InvestmentResult } from "../api";
import { useDcaParams } from "./useDcaParams";
import { useAssetPrice } from "./useAssetPrice";
import type { Asset, Frequency } from "@/constants";

export interface DcaCalculatorHook {
  asset: Asset;
  amount: number;
  frequency: Frequency;
  startDate: string;
  endDate: string;
  result: InvestmentResult | null;
  loading: boolean;
  error: string | null;
  setAsset: (asset: Asset) => void;
  setAmount: (amount: number) => void;
  setFrequency: (frequency: Frequency) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  calculate: () => void;
}

export function useDcaCalculator(): DcaCalculatorHook {
  const {
    asset,
    setAsset,
    amount,
    setAmount,
    frequency,
    setFrequency,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
  } = useDcaParams();

  const { prices, loading: pricesLoading, error } = useAssetPrice(asset);

  const [result, setResult] = useState<InvestmentResult | null>(null);

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
    result,
    loading: pricesLoading,
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
