
import type { InvestmentResult } from '../api';
import { TrendingUp, TrendingDown, Bitcoin, Wallet } from 'lucide-react';

interface ResultsDashboardProps {
  result: InvestmentResult | null;
}

export function ResultsDashboard({ result }: ResultsDashboardProps) {
  if (!result) return null;

  const isProfit = result.roi >= 0;
  const formatting = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <div className="dashboard-grid">
      <div className="stat-card">
        <div className="stat-header">
          <Wallet className="icon-subtle" />
          <span>Total Invested</span>
        </div>
        <div className="stat-value">{formatting.format(result.totalInvested)}</div>
      </div>

      <div className="stat-card featured">
        <div className="stat-header">
          <Bitcoin className="icon-subtle" />
          <span>Value in Bitcoin</span>
        </div>
        <div className="stat-value">{result.totalBitcoin.toFixed(8)} BTC</div>
        <div className="sub-value">Current Value: {formatting.format(result.currentValue)}</div>
      </div>

      <div className={`stat-card ${isProfit ? 'profit' : 'loss'}`}>
        <div className="stat-header">
          {isProfit ? <TrendingUp className="icon-subtle" /> : <TrendingDown className="icon-subtle" />}
          <span>Total Change</span>
        </div>
        <div className="stat-value">
          {isProfit ? '+' : ''}{result.roi.toFixed(2)}%
        </div>
        <div className="sub-value">
          {isProfit ? '+' : ''}{formatting.format(result.currentValue - result.totalInvested)}
        </div>
      </div>
    </div>
  );
}
