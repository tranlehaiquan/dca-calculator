
import { format, isSameDay, addDays, addWeeks, addMonths, isBefore, startOfDay } from 'date-fns';

export interface PricePoint {
  date: number;
  price: number;
}

export interface InvestmentResult {
  totalInvested: number;
  currentValue: number;
  totalBitcoin: number;
  roi: number;
  history: {
    date: string;
    invested: number;
    value: number;
    price: number;
  }[];
}

export type Frequency = 'daily' | 'weekly' | 'monthly';

const CACHE_KEY = 'btc_history_cache';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

import { getFallbackBitcoinHistory } from './fallbackData';

export async function fetchBitcoinHistory(): Promise<PricePoint[]> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=max&interval=daily'
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Bitcoin data: ${response.statusText}`);
    }

    const json = await response.json();
    const prices: PricePoint[] = json.prices.map(([date, price]: [number, number]) => ({
      date,
      price
    }));

    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data: prices
    }));

    return prices;
  } catch (error) {
    console.error('API Error, switching to fallback data:', error);
    // Return synthetic data so the app remains usable
    return getFallbackBitcoinHistory();
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
  let accumulatedBitcoin = 0;
  let accumulatedInvested = 0;

  // We iterate through the relevant price history
  for (const point of relevantPrices) {
    const pointDate = startOfDay(point.date);
    
    // Check if we should invest today
    // We allow a small window or exact match, but let's stick to logic:
    // If current point date >= next investment date, we buy.
    // However, since we have daily data, we can just check if pointDate >= nextInvestmentDate
    // But we must handle the frequency increment correctly.
    
    // Better approach: Iterate our investment schedule and find the closest price point.
    // But iterating price history is easier for generating checking daily value.
    
    if (!isBefore(pointDate, nextInvestmentDate)) { 
        // Iterate nextInvestmentDate until it's > pointDate to avoid double buying if gaps exist
        // or just buy once.
        // Simple logic: If we haven't bought for this "period" yet.
        // Let's stick to: if pointDate matches nextInvestmentDate (approx)
        
         if (isSameDay(pointDate, nextInvestmentDate) || isBefore(nextInvestmentDate, pointDate)) {
             // Buy
             const btcBought = amount / point.price;
             accumulatedBitcoin += btcBought;
             accumulatedInvested += amount;
             
             // Advance next investment date
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
      value: accumulatedBitcoin * point.price,
      price: point.price
    });
  }

  const currentPrice = prices[prices.length - 1].price;
  const currentValue = accumulatedBitcoin * currentPrice;

  return {
    totalInvested: accumulatedInvested,
    totalBitcoin: accumulatedBitcoin,
    currentValue: currentValue,
    roi: accumulatedInvested > 0 ? ((currentValue - accumulatedInvested) / accumulatedInvested) * 100 : 0,
    history
  };
}
