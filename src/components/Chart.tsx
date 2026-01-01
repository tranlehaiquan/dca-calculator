
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import type { InvestmentResult } from '../api';

interface ChartProps {
  data: InvestmentResult['history'];
}

export function Chart({ data }: ChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="chart-container">
      <h3>Portfolio Performance</h3>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F7931A" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F7931A" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickMargin={10}
              tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getFullYear().toString().substr(2)}`;
              }}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(30, 32, 47, 0.9)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number | undefined) => [`$${(value || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, ''] as [string, string]}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }}/>
            <Area 
              type="monotone" 
              dataKey="invested" 
              stroke="#94a3b8" 
              fillOpacity={1} 
              fill="url(#colorInvested)" 
              name="Total Invested"
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#F7931A" 
              fillOpacity={1} 
              fill="url(#colorValue)" 
              name="Portfolio Value"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
