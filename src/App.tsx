
import { useState, useEffect } from 'react';
import { fetchBitcoinHistory, calculateDCA } from './api';
import type { PricePoint, InvestmentResult, Frequency } from './api';
import { InputForm } from './components/InputForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { Chart } from './components/Chart';
import { Bitcoin } from 'lucide-react';

function App() {
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

  useEffect(() => {
    fetchBitcoinHistory()
      .then(data => {
        setPrices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load Bitcoin price history. Please try again later.');
        setLoading(false);
      });
  }, []);

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

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-container">
          <Bitcoin size={48} className="bitcoin-logo" />
        </div>
        <h1 className="title">
          <span className="bitcoin-color">Bitcoin</span> DCA Calculator
        </h1>
        <p className="subtitle">Visualize your potential returns with Dollar Cost Averaging</p>
      </header>

      <main className="main-content">
        {error && <div className="error-banner">{error}</div>}
        
        <div className="calculator-layout">
          <InputForm
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
                <ResultsDashboard result={result} />
                <Chart data={result.history} />
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
