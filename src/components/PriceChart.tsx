import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PriceChartProps {
  data?: Array<{ time: string; price: number; volume?: number }>;
  currentPrice: number;
  priceChange: number;
  className?: string;
}

type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';

export function PriceChart({ data, currentPrice, priceChange, className }: PriceChartProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1M');
  
  const isPositive = priceChange >= 0;
  
  // Generate mock data if none provided
  const generateMockData = (days: number) => {
    const now = new Date();
    const startPrice = currentPrice * (1 - priceChange / 100);
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const progress = (days - i) / days;
      const trend = startPrice + (currentPrice - startPrice) * progress;
      const noise = trend * (0.02 * (Math.random() - 0.5));
      
      data.push({
        time: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        price: Math.round((trend + noise) * 100) / 100,
        volume: Math.floor(Math.random() * 10000000) + 1000000
      });
    }
    
    return data;
  };

  const getDaysForTimeFrame = (tf: TimeFrame) => {
    switch (tf) {
      case '1D': return 1;
      case '1W': return 7;
      case '1M': return 30;
      case '3M': return 90;
      case '1Y': return 365;
      case '5Y': return 1825;
      default: return 30;
    }
  };

  const chartData = data || generateMockData(getDaysForTimeFrame(timeFrame));
  const minPrice = Math.min(...chartData.map(d => d.price)) * 0.98;
  const maxPrice = Math.max(...chartData.map(d => d.price)) * 1.02;

  const timeFrames: TimeFrame[] = ['1D', '1W', '1M', '3M', '1Y', '5Y'];

  return (
    <div className={cn("glass-card p-5", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-muted-foreground">Price Chart</h4>
        <div className="flex gap-1">
          {timeFrames.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFrame(tf)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                timeFrame === tf
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop 
                  offset="0%" 
                  stopColor={isPositive ? "hsl(145, 80%, 42%)" : "hsl(0, 72%, 55%)"} 
                  stopOpacity={0.3} 
                />
                <stop 
                  offset="100%" 
                  stopColor={isPositive ? "hsl(145, 80%, 42%)" : "hsl(0, 72%, 55%)"} 
                  stopOpacity={0.02} 
                />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
              tickMargin={10}
              minTickGap={50}
            />
            <YAxis 
              domain={[minPrice, maxPrice]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
              tickFormatter={(value) => `₹${value.toLocaleString()}`}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(225, 45%, 11%)',
                border: '1px solid hsl(225, 30%, 18%)',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
              labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Price']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? "hsl(145, 80%, 42%)" : "hsl(0, 72%, 55%)"}
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Volume indicator */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
        <span>Average Volume: {(chartData.reduce((a, b) => a + (b.volume || 0), 0) / chartData.length / 1000000).toFixed(1)}M</span>
        <span>Data points: {chartData.length}</span>
      </div>
    </div>
  );
}
