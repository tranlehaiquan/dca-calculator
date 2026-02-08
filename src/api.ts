
import { format, isSameDay, addDays, addWeeks, addMonths, isBefore, startOfDay } from 'date-fns';

export interface PricePoint {
  date: number;
  price: number;
}

export type Asset = 'BTC' | 'Gold' | 'Silver';

export const ASSET_CONFIG: Record<Asset, { id: string; symbol: string | null; label: string; unit: string; source: 'binance' | 'coingecko' }> = {
  BTC: {
    id: 'bitcoin',
    symbol: 'BTCUSDT',
    label: 'Bitcoin',
    unit: 'BTC',
    source: 'binance',
  },
  Gold: {
    id: 'pax-gold',
    symbol: 'PAXGUSDT',
    label: 'Gold',
    unit: 'OZ',
    source: 'binance',
  },
  Silver: {
    id: 'kinesis-silver',
    symbol: null,
    label: 'Silver',
    unit: 'OZ',
    source: 'coingecko',
  },
};

export interface InvestmentResult {
  totalInvested: number;
  currentValue: number;
  totalUnits: number;
  roi: number;
  history: {
    date: string;
    invested: number;
    value: number;
    price: number;
  }[];
}

export type Frequency = 'daily' | 'weekly' | 'monthly';

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

import { getFallbackHistory } from './fallbackData';

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

    if (config.source === 'binance' && config.symbol) {
      // Binance Public API
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${config.symbol}&interval=1d&limit=1000`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${asset} data from Binance: ${response.statusText}`);
      }

      const json = await response.json();
      prices = json.map((kline: any[]) => ({
        date: kline[0],
        price: parseFloat(kline[4])
      }));
    } else {
      // Coingecko Public API
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${config.id}/market_chart?vs_currency=usd&days=1000&interval=daily`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${asset} data from Coingecko: ${response.statusText}`);
      }

      const json = await response.json();
      prices = json.prices.map((p: [number, number]) => ({
        date: p[0],
        price: p[1]
      }));
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data: prices
    }));

    return prices;
  } catch (error) {
    console.error(`API Error for ${asset}, switching to fallback data:`, error);
    return getFallbackHistory(asset);
  }
}

export function calculateDCA(
  prices: PricePoint[],
  amount: number,
  frequency: Frequency,
  startDate: Date,
  endDate: Date = new Date()
): InvestmentResult {
  // Normalize dates to start of day for comparison
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);

  const history: { date: string; invested: number; value: number; price: number }[] = [];

  // Filter prices to range
  const relevantPrices = prices.filter(p => p.date >= start.getTime() && p.date <= end.getTime());
  
  // Sort by date just in case
  relevantPrices.sort((a, b) => a.date - b.date);

  let nextInvestmentDate = start;
  let accumulatedUnits = 0;
  let accumulatedInvested = 0;

  for (const point of relevantPrices) {
    const pointDate = startOfDay(point.date);
    
    if (!isBefore(pointDate, nextInvestmentDate)) { 
         if (isSameDay(pointDate, nextInvestmentDate) || isBefore(nextInvestmentDate, pointDate)) {
             const unitsBought = amount / point.price;
             accumulatedUnits += unitsBought;
             accumulatedInvested += amount;
             
             switch (frequency) {
               case 'daily': nextInvestmentDate = addDays(nextInvestmentDate, 1); break;
               case 'weekly': nextInvestmentDate = addWeeks(nextInvestmentDate, 1); break;
               case 'monthly': nextInvestmentDate = addMonths(nextInvestmentDate, 1); break;
             }
         }
    }

    history.push({
      date: format(point.date, 'yyyy-MM-dd'),
      invested: accumulatedInvested,
      value: accumulatedUnits * point.price,
      price: point.price
    });
  }

  const currentPrice = prices[prices.length - 1].price;
  const currentValue = accumulatedUnits * currentPrice;

  return {
    totalInvested: accumulatedInvested,
    totalUnits: accumulatedUnits,
    currentValue: currentValue,
    roi: accumulatedInvested > 0 ? ((currentValue - accumulatedInvested) / accumulatedInvested) * 100 : 0,
    history
  };
}
