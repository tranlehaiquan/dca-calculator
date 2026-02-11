import {
  format,
  isSameDay,
  addDays,
  addWeeks,
  addMonths,
  isBefore,
  startOfDay,
  differenceInDays,
} from "date-fns";
import type { Asset, Frequency } from "./constants";
import { ASSET_CONFIG } from "./constants";
import { getFallbackHistory } from "./fallbackData";

export interface PricePoint {
  date: number;
  price: number;
}

export interface InvestmentResult {
  totalInvested: number;
  currentValue: number;
  totalUnits: number;
  roi: number;
  averagePrice: number;
  bestPrice: number;
  worstPrice: number;
  purchaseCount: number;
  currentPrice: number;
  lumpSumValue: number;
  inflationAdjustedValue: number;
  history: {
    date: string;
    invested: number;
    value: number;
    price: number;
  }[];
  transactions: {
    date: string;
    amount: number;
    price: number;
    units: number;
  }[];
}

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

async function fetchFromYahoo(symbol: string): Promise<PricePoint[]> {
  const now = Math.floor(Date.now() / 1000);
  const tenYearsAgo = now - 10 * 365 * 24 * 60 * 60;
  
  const baseUrl =
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"
      ? "http://localhost:3001/api/yahoo/history"
      : "/api/yahoo/history";

  const url = `${baseUrl}?symbol=${symbol}&period1=${tenYearsAgo}&period2=${now}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Proxy error: ${response.statusText}`);
  const json = await response.json();

  if (json.chart.error) {
    throw new Error(json.chart.error.description || "Yahoo Finance error");
  }

  const result = json.chart.result[0];
  const timestamps = result.timestamp;
  const quotes = result.indicators.quote[0].close;

  return timestamps
    .map((timestamp: number, index: number) => ({
      date: timestamp * 1000,
      price: quotes[index] as number,
    }))
    .filter((p: PricePoint) => p.price !== null);
}

export async function fetchPriceHistory(asset: Asset): Promise<PricePoint[]> {
  const config = ASSET_CONFIG[asset];
  const CACHE_KEY = `history_cache_${asset}`;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    let prices: PricePoint[] = [];

    if (config.source === "binance" && config.symbol) {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${config.symbol}&interval=1d&limit=1000`,
        );
        if (!response.ok) throw new Error(response.statusText);
        const json = (await response.json()) as (string | number)[][];
        prices = json.map((kline) => ({
          date: kline[0] as number,
          price: parseFloat(kline[4] as string),
        }));
      } catch (e) {
        console.warn(`Binance failed for ${asset}, falling back to Yahoo:`, e);
        if (config.yahooSymbol) {
          prices = await fetchFromYahoo(config.yahooSymbol);
        } else {
          throw e;
        }
      }
    } else if (config.source === "yahoo" && config.yahooSymbol) {
      prices = await fetchFromYahoo(config.yahooSymbol);
    } else {
      // Fallback for coingecko or if yahoo fails
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${config.id}/market_chart?vs_currency=usd&days=1000&interval=daily`,
        );
        if (!response.ok) throw new Error(response.statusText);
        const json = await response.json();
        prices = json.prices.map((p: [number, number]) => ({
          date: p[0],
          price: p[1],
        }));
      } catch (e) {
        console.warn(`CoinGecko failed for ${asset}, falling back to Yahoo if available:`, e);
        if (config.yahooSymbol) {
          prices = await fetchFromYahoo(config.yahooSymbol);
        } else {
          throw e;
        }
      }
    }

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data: prices }),
    );
    return prices;
  } catch (error) {
    console.error(`API Error for ${asset}:`, error);
    return getFallbackHistory(asset);
  }
}

export async function fetchVnStockHistory(
  symbol: string,
): Promise<PricePoint[]> {
  const CACHE_KEY = `vn_history_cache_${symbol}`;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    // Yahoo Finance often requires .VN or .HM for Vietnamese stocks
    let yahooSymbol = symbol.toUpperCase();
    if (!yahooSymbol.includes(".")) {
      yahooSymbol = `${yahooSymbol}.VN`;
    }

    let prices: PricePoint[] = [];
    try {
      prices = await fetchFromYahoo(yahooSymbol);
    } catch (e) {
      // Try with .HN if .VN fails
      if (yahooSymbol.endsWith(".VN")) {
        const hnSymbol = yahooSymbol.replace(".VN", ".HN");
        try {
          prices = await fetchFromYahoo(hnSymbol);
        } catch (hnError) {
          console.error(`Error fetching .HN fallback:`, hnError);
          throw e; // throw original .VN error if .HN also fails
        }
      } else {
        throw e;
      }
    }

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data: prices }),
    );
    return prices;
  } catch (error) {
    console.error(`API Error for VN Stock ${symbol}:`, error);
    return [];
  }
}

export interface StockSuggestion {
  symbol: string;
  shortname: string;
  longname: string;
  exchange: string;
}

interface YahooSearchQuote {
  symbol: string;
  shortname?: string;
  longname?: string;
  exchange: string;
}

export async function searchVnStock(query: string): Promise<StockSuggestion[]> {
  if (!query || query.length < 2) return [];

  try {
    const baseUrl =
      typeof window !== "undefined" &&
      window.location.hostname === "localhost"
        ? "http://localhost:3001/api/yahoo/search"
        : "/api/yahoo/search";

    const url = `${baseUrl}?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Proxy error: ${response.statusText}`);
    const json = (await response.json()) as { quotes: YahooSearchQuote[] };

    if (!json.quotes) return [];

    return json.quotes
      .filter(
        (q) =>
          q.exchange === "HOSE" ||
          q.exchange === "HNX" ||
          q.symbol.endsWith(".VN") ||
          q.symbol.endsWith(".HN"),
      )
      .map((q) => ({
        symbol: q.symbol.split(".")[0],
        shortname: q.shortname || q.symbol,
        longname: q.longname || q.shortname || q.symbol,
        exchange: q.exchange,
      }));
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
}

interface YahooChartResult {
  chart: {
    result: Array<{
      timestamp: number[];
      indicators: {
        quote: Array<{
          close: (number | null)[];
        }>;
      };
    }>;
  };
}

function processYahooData(json: YahooChartResult, cacheKey: string): PricePoint[] {
  const result = json.chart.result[0];
  const timestamps = result.timestamp;
  const quotes = result.indicators.quote[0].close;

  const prices: PricePoint[] = timestamps
    .map((timestamp: number, index: number) => ({
      date: timestamp * 1000,
      price: quotes[index] as number,
    }))
    .filter((p: PricePoint) => p.price !== null);

  localStorage.setItem(
    cacheKey,
    JSON.stringify({ timestamp: Date.now(), data: prices }),
  );
  return prices;
}

export function calculateDCA(
  prices: PricePoint[],
  amount: number,
  frequency: Frequency,
  startDate: Date,
  endDate: Date = new Date(),
  inflationRate: number = 0,
): InvestmentResult {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  const history: InvestmentResult["history"] = [];
  const transactions: InvestmentResult["transactions"] = [];

  const relevantPrices = prices
    .filter((p) => p.date >= start.getTime() && p.date <= end.getTime())
    .sort((a, b) => a.date - b.date);

  let nextInvestmentDate = start;
  let accumulatedUnits = 0;
  let accumulatedInvested = 0;

  for (const point of relevantPrices) {
    const pointDate = startOfDay(point.date);

    if (!isBefore(pointDate, nextInvestmentDate)) {
      if (
        isSameDay(pointDate, nextInvestmentDate) ||
        isBefore(nextInvestmentDate, pointDate)
      ) {
        const unitsBought = amount / point.price;
        accumulatedUnits += unitsBought;
        accumulatedInvested += amount;

        transactions.push({
          date: format(point.date, "yyyy-MM-dd"),
          amount: amount,
          price: point.price,
          units: unitsBought,
        });

        switch (frequency) {
          case "daily":
            nextInvestmentDate = addDays(nextInvestmentDate, 1);
            break;
          case "weekly":
            nextInvestmentDate = addWeeks(nextInvestmentDate, 1);
            break;
          case "monthly":
            nextInvestmentDate = addMonths(nextInvestmentDate, 1);
            break;
        }
      }
    }

    history.push({
      date: format(point.date, "yyyy-MM-dd"),
      invested: accumulatedInvested,
      value: accumulatedUnits * point.price,
      price: point.price,
    });
  }

  const currentPrice = prices[prices.length - 1]?.price || 0;
  const currentValue = accumulatedUnits * currentPrice;

  // Calculate Lump Sum Comparison
  // Assume the total amount invested via DCA was invested all at once on the first day
  const firstPrice = relevantPrices[0]?.price || 0;
  const lumpSumUnits = firstPrice > 0 ? accumulatedInvested / firstPrice : 0;
  const lumpSumValue = lumpSumUnits * currentPrice;

  // Calculate Inflation Adjusted Value (Purchasing Power)
  const daysElapsed = differenceInDays(end, start);
  const yearsElapsed = daysElapsed / 365.25;
  const inflationAdjustedValue =
    currentValue / Math.pow(1 + inflationRate / 100, yearsElapsed);

  const buyPrices = transactions.map((t) => t.price);

  return {
    totalInvested: accumulatedInvested,
    totalUnits: accumulatedUnits,
    currentValue: currentValue,
    roi:
      accumulatedInvested > 0
        ? ((currentValue - accumulatedInvested) / accumulatedInvested) * 100
        : 0,
    averagePrice:
      accumulatedUnits > 0 ? accumulatedInvested / accumulatedUnits : 0,
    bestPrice: buyPrices.length > 0 ? Math.min(...buyPrices) : 0,
    worstPrice: buyPrices.length > 0 ? Math.max(...buyPrices) : 0,
    purchaseCount: transactions.length,
    currentPrice: currentPrice,
    lumpSumValue: lumpSumValue,
    inflationAdjustedValue: inflationAdjustedValue,
    history,
    transactions,
  };
}
