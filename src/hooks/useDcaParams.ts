import { useState, useEffect, useRef } from "react";
import type { Asset, Frequency } from "@/constants";

interface DcaParams {
  asset: Asset;
  amount: number;
  frequency: Frequency;
  startDate: string;
  endDate: string;
}

const getInitialParams = (): DcaParams => {
  const params = new URLSearchParams(window.location.search);
  return {
    asset: (params.get("asset") as Asset) || "BTC",
    amount: Number(params.get("amount")) || 100,
    frequency: (params.get("frequency") as Frequency) || "weekly",
    startDate: params.get("startDate") || "2023-01-01",
    endDate: params.get("endDate") || new Date().toISOString().split("T")[0],
  };
};

export function useDcaParams() {
  const initialParams = getInitialParams();

  const [asset, setAsset] = useState<Asset>(initialParams.asset);
  const [amount, setAmount] = useState(initialParams.amount);
  const [frequency, setFrequency] = useState<Frequency>(initialParams.frequency);
  const [startDate, setStartDate] = useState(initialParams.startDate);
  const [endDate, setEndDate] = useState(initialParams.endDate);

  const isFirstRender = useRef(true);

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

  return {
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
  };
}
