import { useState, useEffect, useCallback } from "react";
import { calculateDCA } from "../api";
import type { InvestmentResult } from "../api";
import { useVnStockParams } from "./useVnStockParams";
import { useVnStockPrice } from "./useVnStockPrice";
import type { Frequency } from "@/constants";

export interface VnStockCalculatorHook {
  symbol: string;
  amount: number;
  frequency: Frequency;
  startDate: string;
  endDate: string;
  inflationRate: number;
  result: InvestmentResult | null;
  loading: boolean;
  error: string | null;
  setSymbol: (symbol: string) => void;
  setAmount: (amount: number) => void;
  setFrequency: (frequency: Frequency) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setInflationRate: (rate: number) => void;
  calculate: () => void;
}

export function useVnStockCalculator(): VnStockCalculatorHook {
  const {
    symbol,
    setSymbol,
    amount,
    setAmount,
    frequency,
    setFrequency,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    inflationRate,
    setInflationRate,
  } = useVnStockParams();

  const { prices, loading: pricesLoading, error } = useVnStockPrice(symbol);

  const [result, setResult] = useState<InvestmentResult | null>(null);

  const performCalculation = useCallback(() => {
    if (prices.length === 0) return;

    const res = calculateDCA(
      prices,
      amount,
      frequency,
      new Date(startDate),
      new Date(endDate),
      inflationRate,
    );
    setResult(res);
  }, [prices, amount, frequency, startDate, endDate, inflationRate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      performCalculation();
    }, 300);

    return () => clearTimeout(timer);
  }, [performCalculation]);

  return {
    symbol,
    amount,
    frequency,
    startDate,
    endDate,
    inflationRate,
    result,
    loading: pricesLoading,
    error,
    setSymbol,
    setAmount,
    setFrequency,
    setStartDate,
    setEndDate,
    setInflationRate,
    calculate: performCalculation,
  };
}
