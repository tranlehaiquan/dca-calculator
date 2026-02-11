import { useState, useEffect, useRef } from "react";
import type { Frequency } from "@/constants";

interface VnStockParams {
  symbol: string;
  amount: number;
  frequency: Frequency;
  startDate: string;
  endDate: string;
  inflationRate: number;
}

const getInitialParams = (): VnStockParams => {
  const params = new URLSearchParams(window.location.search);
  return {
    symbol: params.get("symbol") || "VNM",
    amount: Number(params.get("amount")) || 1000000, // 1M VND default
    frequency: (params.get("frequency") as Frequency) || "monthly",
    startDate: params.get("startDate") || "2023-01-01",
    endDate: params.get("endDate") || new Date().toISOString().split("T")[0],
    inflationRate: Number(params.get("inflation")) || 4,
  };
};

export function useVnStockParams(updateUrl = true) {
  const initialParams = getInitialParams();

  const [symbol, setSymbol] = useState(initialParams.symbol);
  const [amount, setAmount] = useState(initialParams.amount);
  const [frequency, setFrequency] = useState<Frequency>(initialParams.frequency);
  const [startDate, setStartDate] = useState(initialParams.startDate);
  const [endDate, setEndDate] = useState(initialParams.endDate);
  const [inflationRate, setInflationRate] = useState(initialParams.inflationRate);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!updateUrl) return;
    
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams();
    params.set("symbol", symbol);
    params.set("amount", amount.toString());
    params.set("frequency", frequency);
    params.set("startDate", startDate);
    params.set("endDate", endDate);
    params.set("inflation", inflationRate.toString());

    const newRelativePathQuery = window.location.pathname + "?" + params.toString();
    window.history.replaceState(null, "", newRelativePathQuery);
  }, [symbol, amount, frequency, startDate, endDate, inflationRate, updateUrl]);

  return {
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
  };
}
