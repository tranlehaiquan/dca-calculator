export type Asset = "BTC" | "Gold" | "Silver";
export type Frequency = "daily" | "weekly" | "monthly";

export interface AssetConfig {
  id: string;
  symbol: string | null;
  yahooSymbol?: string;
  label: string;
  unit: string;
  source: "binance" | "coingecko" | "yahoo";
  color: string;
}

export const ASSET_CONFIG: Record<Asset, AssetConfig> = {
  BTC: {
    id: "bitcoin",
    symbol: "BTCUSDT",
    yahooSymbol: "BTC-USD",
    label: "Bitcoin",
    unit: "BTC",
    source: "binance",
    color: "#F7931A",
  },
  Gold: {
    id: "pax-gold",
    symbol: "PAXGUSDT",
    yahooSymbol: "GC=F",
    label: "Gold",
    unit: "OZ",
    source: "binance",
    color: "#D4AF37",
  },
  Silver: {
    id: "kinesis-silver",
    symbol: null,
    yahooSymbol: "SI=F",
    label: "Silver",
    unit: "OZ",
    source: "yahoo",
    color: "#C0C0C0",
  },
};
