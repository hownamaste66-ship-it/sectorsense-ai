import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useScannerStocks } from '@/hooks/useStocks';
import { formatMarketCap, formatPercentage } from '@/lib/formatters';
import { 
  Scan, Loader2, TrendingUp, TrendingDown, Flame, 
  ArrowUpCircle, ArrowDownCircle, Volume2, Zap, ShieldCheck, BarChart2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow
} from '@/components/ui/table';
import type { ScannerFilter } from '@/types/stock';

const SCANNER_FILTERS: { key: ScannerFilter; label: string; icon: typeof TrendingUp; description: string }[] = [
  { key: 'high-growth', label: 'High Growth', icon: TrendingUp, description: 'Revenue YoY > 15%' },
  { key: 'low-debt', label: 'Low Debt', icon: ShieldCheck, description: 'D/E < 0.5' },
  { key: 'breakout', label: 'Breakout', icon: Zap, description: 'RSI 60-75 + Volume' },
  { key: 'oversold', label: 'Oversold', icon: ArrowDownCircle, description: 'RSI < 30' },
  { key: 'overbought', label: 'Overbought', icon: ArrowUpCircle, description: 'RSI > 70' },
  { key: 'volume-surge', label: 'Volume Surge', icon: Volume2, description: 'High volume' },
  { key: 'strong-momentum', label: 'Strong Momentum', icon: Flame, description: 'Sentiment > 70%' },
  { key: 'undervalued', label: 'Undervalued', icon: BarChart2, description: 'P/E < 20' },
];

function getAiTagClass(tag: string) {
  switch (tag) {
    case 'Hot':
    case 'Strong Momentum':
      return 'ai-tag-hot';
    case 'Rising':
    case 'Watchlist':
      return 'ai-tag-rising';
    default:
      return 'ai-tag-neutral';
  }
}

export default function ScannerPage() {
  const [activeFilter, setActiveFilter] = useState<ScannerFilter>('high-growth');
  const { data: stocks, isLoading } = useScannerStocks(activeFilter);

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <Header />

      <main className="container py-8">
        {/* Hero */}
        <div className="text-center mb-8 slide-up">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="gradient-text">Stock Scanner</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Filter stocks by technical indicators and fundamental metrics
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {SCANNER_FILTERS.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.key;
            
            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/20 text-primary border border-primary/40"
                    : "glass-card text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <Icon className="h-4 w-4" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Current Filter Description */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">
            <Scan className="inline h-4 w-4 mr-1" />
            Scanning for: <span className="text-primary font-medium">
              {SCANNER_FILTERS.find(f => f.key === activeFilter)?.description}
            </span>
          </p>
        </div>

        {/* Results Table */}
        <div className="glass-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : stocks && stocks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Ticker</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Market Cap</TableHead>
                  <TableHead className="text-right">Change %</TableHead>
                  <TableHead className="text-right">RSI</TableHead>
                  <TableHead className="text-right">Vol vs Avg</TableHead>
                  <TableHead>AI Tag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks.map((stock, index) => {
                  const isPositive = stock.price_change >= 0;
                  const volumeVsAvg = stock.avg_volume > 0 
                    ? Math.round(((stock.volume - stock.avg_volume) / stock.avg_volume) * 100)
                    : 0;

                  return (
                    <TableRow 
                      key={stock.id}
                      className="border-border/30 hover:bg-muted/30 fade-in cursor-pointer"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <TableCell>
                        <Link 
                          to={`/analyze?ticker=${stock.ticker}`}
                          className="font-bold text-primary hover:underline"
                        >
                          {stock.ticker}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {stock.name}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatMarketCap(stock.market_cap)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={cn(
                          "flex items-center justify-end gap-1 font-medium",
                          isPositive ? 'text-success' : 'text-destructive'
                        )}>
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatPercentage(stock.price_change)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          "font-medium",
                          stock.rsi >= 70 && 'text-destructive',
                          stock.rsi <= 30 && 'text-success',
                          stock.rsi > 30 && stock.rsi < 70 && 'text-muted-foreground'
                        )}>
                          {stock.rsi.toFixed(0)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          "font-medium",
                          volumeVsAvg > 50 && 'text-success',
                          volumeVsAvg < -20 && 'text-destructive',
                        )}>
                          {volumeVsAvg > 0 ? '+' : ''}{volumeVsAvg}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={getAiTagClass(stock.ai_tag)}>
                          {stock.ai_tag}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-20">
              <Scan className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Stocks Found</h3>
              <p className="text-muted-foreground">
                No stocks match the current filter criteria.
              </p>
            </div>
          )}
        </div>

        {/* Results Count */}
        {stocks && stocks.length > 0 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Showing {stocks.length} results
          </p>
        )}
      </main>
    </div>
  );
}