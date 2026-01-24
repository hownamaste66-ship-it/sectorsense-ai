import { Link } from 'react-router-dom';
import { Flame, TrendingUp, TrendingDown, Volume2 } from 'lucide-react';
import { useTrendingStocks } from '@/hooks/useStocks';
import { formatNumber, formatPercentage } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

function getAiTagStyle(tag: string) {
  switch (tag) {
    case 'Hot':
      return 'ai-tag-hot';
    case 'Rising':
    case 'Strong Momentum':
      return 'ai-tag-rising';
    default:
      return 'ai-tag-neutral';
  }
}

export function TrendingStocks() {
  const { data: stocks, isLoading } = useTrendingStocks();

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
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (!stocks || stocks.length === 0) return null;

  return (
    <section className="mb-10 fade-in">
      <div className="section-header">
        <div className="section-icon">
          <Flame className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold">
          <span className="gradient-text">🔥 Trending Stocks</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stocks.slice(0, 8).map((stock, index) => {
          const isPositive = stock.price_change >= 0;
          const volumeSurge = stock.avg_volume > 0 
            ? Math.round(((stock.volume - stock.avg_volume) / stock.avg_volume) * 100)
            : 0;

          return (
            <Link
              key={stock.id}
              to={`/analyze?ticker=${stock.ticker}`}
              className="premium-card p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-foreground">{stock.ticker}</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[100px]">
                    {stock.name}
                  </p>
                </div>
                <span className={getAiTagStyle(stock.ai_tag)}>{stock.ai_tag}</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={cn(
                  'text-lg font-bold',
                  isPositive ? 'text-success' : 'text-destructive'
                )}>
                  {formatPercentage(stock.price_change)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Volume2 className="h-3 w-3" />
                  <span>{volumeSurge > 0 ? `+${volumeSurge}%` : `${volumeSurge}%`}</span>
                </div>
                <div className="text-muted-foreground">
                  Sent: {Math.round(stock.sentiment * 100)}%
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}