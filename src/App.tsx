
import { useState, useEffect } from 'react';
import { fetchPriceHistory, calculateDCA, ASSET_CONFIG } from './api';
import type { PricePoint, InvestmentResult, Frequency, Asset } from './api';
import { InputForm } from './components/InputForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { Chart } from './components/Chart';
import { Bitcoin, Coins, Gem } from 'lucide-react';

function App() {
  const [asset, setAsset] = useState<Asset>('BTC');
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [amount, setAmount] = useState(100);
  const [frequency, setFrequency] = useState<Frequency>('weekly');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Results State
  const [result, setResult] = useState<InvestmentResult | null>(null);

  const handleCalculate = () => {
    if (prices.length === 0) return;
    
    const res = calculateDCA(
      prices,
      amount,
      frequency,
      new Date(startDate),
      new Date(endDate)
    );
    setResult(res);
  };

  // Auto-calculate when inputs change and prices are available
  useEffect(() => {
    if (prices.length > 0) {
      handleCalculate();
    }
  }, [prices, amount, frequency, startDate, endDate]);

  useEffect(() => {
    setLoading(true);
    fetchPriceHistory(asset)
      .then(data => {
        setPrices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(`Failed to load ${ASSET_CONFIG[asset].label} price history. Please try again later.`);
        setLoading(false);
      });
  }, [asset]);

  const renderLogo = () => {
    switch (asset) {
      case 'BTC': return <Bitcoin size={48} className="asset-logo" />;
      case 'Gold': return <Gem size={48} className="asset-logo" />;
      case 'Silver': return <Coins size={48} className="asset-logo" />;
    }
  };

  const assetLabel = ASSET_CONFIG[asset].label;

  return (
    <div className={`app-container asset-${asset.toLowerCase()}`}>
      <header className="header">
        <div className="logo-container">
          {renderLogo()}
        </div>
        <h1 className="title">
          <span className="asset-color">{assetLabel}</span> DCA Calculator
        </h1>
        <p className="subtitle">Visualize your potential returns with Dollar Cost Averaging</p>
      </header>

      <main className="main-content">
        {error && <div className="error-banner">{error}</div>}
        
        <div className="calculator-layout">
          <InputForm
            asset={asset}
            setAsset={setAsset}
            amount={amount}
            setAmount={setAmount}
            frequency={frequency}
            setFrequency={setFrequency}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onCalculate={handleCalculate}
            isLoading={loading}
          />
          
          <div className="results-container">
            {result ? (
              <>
                <ResultsDashboard result={result} asset={asset} />
                <Chart data={result.history} asset={asset} />
              </>
            ) : (
              <div className="placeholder-card">
                <p>Enter your investment details and click "Calculate Returns" to see the magic of DCA.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
