import { Link } from 'react-router-dom';
import { Flame, TrendingUp, TrendingDown, Volume2, Zap, Activity, BarChart3 } from 'lucide-react';
import { useTrendingStocks } from '@/hooks/useStocks';
import { formatNumber, formatPercentage } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { SparklineChart } from '@/components/SparklineChart';

function getAiTagConfig(tag: string) {
  switch (tag) {
    case 'Hot':
      return { 
        className: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
        icon: Flame,
      };
    case 'Strong Momentum':
      return { 
        className: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
        icon: Zap,
      };
    case 'Rising':
      return { 
        className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
        icon: TrendingUp,
      };
    case 'Breakout':
      return { 
        className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
        icon: Activity,
      };
    case 'Oversold':
      return { 
        className: 'bg-gradient-to-r from-red-500 to-rose-500 text-white',
        icon: TrendingDown,
      };
    case 'Overbought':
      return { 
        className: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white',
        icon: BarChart3,
      };
    case 'Watchlist':
      return { 
        className: 'bg-gradient-to-r from-slate-500 to-zinc-500 text-white',
        icon: Activity,
      };
    default:
      return { 
        className: 'bg-muted text-muted-foreground',
        icon: Activity,
      };
  }
}

export function EnhancedTrendingStocks() {
  const { data: stocks, isLoading, error } = useTrendingStocks();

  if (isLoading) {
    return (
      <section className="mb-10">
        <div className="section-header">
          <div className="section-icon">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Trending Stocks</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (error || !stocks || stocks.length === 0) {
    return (
      <section className="mb-10">
        <div className="section-header">
          <div className="section-icon">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Trending Stocks</h2>
        </div>
        <div className="text-center py-10 text-muted-foreground">
          {error ? 'Failed to load trending stocks' : 'No trending stocks at the moment'}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10 fade-in">
      <div className="section-header mb-4">
        <div className="flex items-center gap-2">
          <div className="section-icon">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold">
            <span className="gradient-text">🔥 Trending Now</span>
          </h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            Live
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stocks.slice(0, 8).map((stock, index) => {
          const isPositive = (stock.price_change ?? 0) >= 0;
          const volumeSurge = stock.avg_volume && stock.avg_volume > 0 
            ? Math.round((((stock.volume ?? 0) - stock.avg_volume) / stock.avg_volume) * 100)
            : 0;
          const tagConfig = getAiTagConfig(stock.ai_tag ?? 'Neutral');
          const TagIcon = tagConfig.icon;
          const sentiment = stock.sentiment ?? 0.5;
          const rsi = stock.rsi ?? 50;

          // Generate mock sparkline data based on price change
          const sparklineData = Array.from({ length: 20 }, (_, i) => {
            const base = 100;
            const trend = (stock.price_change ?? 0) > 0 ? 1 : -1;
            const noise = (Math.random() - 0.5) * 5;
            return base + (i * trend * 0.5) + noise;
          });

          return (
            <Link
              key={stock.id}
              to={`/analyze?ticker=${stock.ticker}`}
              className="group premium-card p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Background Gradient */}
              <div className={cn(
                "absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10",
                isPositive ? "bg-gradient-to-br from-success to-transparent" : "bg-gradient-to-br from-destructive to-transparent"
              )} />
              
              {/* Header */}
              <div className="flex items-start justify-between mb-2 relative">
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {stock.ticker}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[100px]">
                    {stock.name}
                  </p>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1",
                  tagConfig.className
                )}>
                  <TagIcon className="h-3 w-3" />
                  {stock.ai_tag}
                </span>
              </div>

              {/* Price */}
              <div className="mb-2 relative">
                <div className="text-lg font-bold text-foreground">
                  ₹{(stock.price ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1.5">
                  {isPositive ? (
                    <TrendingUp className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                  )}
                  <span className={cn(
                    'text-sm font-semibold',
                    isPositive ? 'text-success' : 'text-destructive'
                  )}>
                    {isPositive ? '+' : ''}{(stock.price_change ?? 0).toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Mini Sparkline */}
              <div className="h-8 mb-2 opacity-60 group-hover:opacity-100 transition-opacity">
                <SparklineChart 
                  data={sparklineData} 
                  color={isPositive ? 'success' : 'destructive'} 
                  height={32}
                />
              </div>

              {/* Metrics Footer */}
              <div className="flex items-center justify-between text-[10px] relative">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Volume2 className="h-3 w-3" />
                  <span className={cn(
                    volumeSurge > 0 ? 'text-success' : 'text-muted-foreground'
                  )}>
                    {volumeSurge > 0 ? `+${volumeSurge}%` : `${volumeSurge}%`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[9px]",
                    sentiment > 0.6 ? 'bg-success/20 text-success' : 
                    sentiment < 0.4 ? 'bg-destructive/20 text-destructive' : 
                    'bg-muted text-muted-foreground'
                  )}>
                    Sent: {Math.round(sentiment * 100)}%
                  </span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[9px]",
                    rsi > 70 ? 'bg-warning/20 text-warning' : 
                    rsi < 30 ? 'bg-primary/20 text-primary' : 
                    'bg-muted text-muted-foreground'
                  )}>
                    RSI: {Math.round(rsi)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
