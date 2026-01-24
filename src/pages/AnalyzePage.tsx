import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { StockMetricCard } from '@/components/StockMetricCard';
import { RatingMeter } from '@/components/RatingMeter';
import { SparklineChart } from '@/components/SparklineChart';
import { useStock } from '@/hooks/useStocks';
import { formatMarketCap, formatPercentage } from '@/lib/formatters';
import { 
  Search, Loader2, TrendingUp, TrendingDown, DollarSign, 
  BarChart3, Percent, Building2, Activity, Shield,
  Brain, ChartLine, Target, Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Mock price data for chart
const generateMockPriceData = () => 
  Array.from({ length: 30 }, () => 50 + Math.random() * 50);

export default function AnalyzePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tickerParam = searchParams.get('ticker') || '';
  const [searchValue, setSearchValue] = useState(tickerParam);
  const [activeTicker, setActiveTicker] = useState(tickerParam);

  const { data: stock, isLoading, error } = useStock(activeTicker);

  const handleSearch = () => {
    if (searchValue.trim()) {
      setActiveTicker(searchValue.trim().toUpperCase());
      setSearchParams({ ticker: searchValue.trim().toUpperCase() });
    }
  };

  const priceData = generateMockPriceData();
  const isPositive = stock && stock.price_change >= 0;

  // Calculate AI ratings based on stock metrics
  const getValuationRating = () => {
    if (!stock) return 50;
    const peScore = stock.pe ? Math.max(0, 100 - stock.pe * 2) : 50;
    return Math.round(peScore);
  };

  const getGrowthRating = () => {
    if (!stock) return 50;
    const growthScore = (stock.revenue_yoy || 0) * 3 + (stock.profit_yoy || 0) * 2;
    return Math.min(100, Math.max(0, Math.round(growthScore)));
  };

  const getRiskRating = () => {
    if (!stock) return 50;
    return Math.round((1 - stock.volatility) * 100);
  };

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <Header />

      <main className="container py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 slide-up">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="gradient-text-premium">Stock Analyzer</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Deep dive into any stock with AI-powered fundamental analysis
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter ticker symbol (e.g., RELIANCE)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <Button onClick={handleSearch} className="btn-premium">
              Analyze
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* No Results */}
        {!isLoading && activeTicker && !stock && (
          <div className="text-center py-20 glass-card max-w-md mx-auto">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Stock Not Found</h3>
            <p className="text-muted-foreground">
              No data available for "{activeTicker}". Try another ticker.
            </p>
          </div>
        )}

        {/* Stock Analysis */}
        {stock && (
          <div className="space-y-8 fade-in">
            {/* Header Card */}
            <div className="premium-card p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{stock.ticker}</h2>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      stock.ai_tag === 'Hot' && 'ai-tag-hot',
                      stock.ai_tag === 'Rising' && 'ai-tag-rising',
                      !['Hot', 'Rising'].includes(stock.ai_tag) && 'ai-tag-neutral'
                    )}>
                      {stock.ai_tag}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{stock.name}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-3xl font-bold">₹{stock.price.toLocaleString()}</p>
                    <div className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      isPositive ? 'text-success' : 'text-destructive'
                    )}>
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {formatPercentage(stock.price_change)}
                    </div>
                  </div>

                  <SparklineChart 
                    data={priceData} 
                    color={isPositive ? 'success' : 'destructive'}
                    className="hidden md:flex"
                  />
                </div>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <section>
              <div className="section-header">
                <div className="section-icon">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Key Metrics</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StockMetricCard
                  label="Market Cap"
                  value={formatMarketCap(stock.market_cap)}
                  icon={DollarSign}
                />
                <StockMetricCard
                  label="P/E Ratio"
                  value={stock.pe?.toFixed(1) || 'N/A'}
                  icon={Percent}
                />
                <StockMetricCard
                  label="EPS"
                  value={stock.eps ? `₹${stock.eps.toFixed(1)}` : 'N/A'}
                  icon={BarChart3}
                />
                <StockMetricCard
                  label="ROE"
                  value={stock.roe ? `${stock.roe.toFixed(1)}%` : 'N/A'}
                  trend={stock.roe && stock.roe > 15 ? 'up' : 'neutral'}
                  icon={TrendingUp}
                />
                <StockMetricCard
                  label="ROCE"
                  value={stock.roce ? `${stock.roce.toFixed(1)}%` : 'N/A'}
                  trend={stock.roce && stock.roce > 15 ? 'up' : 'neutral'}
                  icon={Activity}
                />
                <StockMetricCard
                  label="Revenue YoY"
                  value={stock.revenue_yoy ? `${stock.revenue_yoy.toFixed(1)}%` : 'N/A'}
                  trend={stock.revenue_yoy && stock.revenue_yoy > 0 ? 'up' : 'down'}
                  icon={ChartLine}
                />
                <StockMetricCard
                  label="Profit YoY"
                  value={stock.profit_yoy ? `${stock.profit_yoy.toFixed(1)}%` : 'N/A'}
                  trend={stock.profit_yoy && stock.profit_yoy > 0 ? 'up' : 'down'}
                  icon={Target}
                />
                <StockMetricCard
                  label="Debt/Equity"
                  value={stock.debt_to_equity?.toFixed(2) || 'N/A'}
                  trend={stock.debt_to_equity && stock.debt_to_equity < 1 ? 'up' : 'down'}
                  icon={Shield}
                />
              </div>
            </section>

            {/* AI Ratings */}
            <section>
              <div className="section-header">
                <div className="section-icon">
                  <Gauge className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">AI Ratings</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="glass-card p-5">
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">Valuation Rating</h4>
                  <RatingMeter 
                    label="Score" 
                    value={getValuationRating()} 
                    type={getValuationRating() >= 60 ? 'bullish' : getValuationRating() >= 40 ? 'neutral' : 'bearish'}
                  />
                </div>
                <div className="glass-card p-5">
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">Growth Rating</h4>
                  <RatingMeter 
                    label="Score" 
                    value={getGrowthRating()} 
                    type={getGrowthRating() >= 60 ? 'bullish' : getGrowthRating() >= 40 ? 'neutral' : 'bearish'}
                  />
                </div>
                <div className="glass-card p-5">
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">Risk Rating</h4>
                  <RatingMeter 
                    label="Score" 
                    value={getRiskRating()} 
                    type={getRiskRating() >= 60 ? 'bullish' : getRiskRating() >= 40 ? 'neutral' : 'bearish'}
                  />
                </div>
              </div>
            </section>

            {/* AI Summary */}
            <section>
              <div className="section-header">
                <div className="section-icon">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">AI Analysis Summary</h3>
              </div>

              <div className="premium-card p-6">
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">{stock.name} ({stock.ticker})</strong> shows 
                    {getGrowthRating() >= 60 ? ' strong' : getGrowthRating() >= 40 ? ' moderate' : ' weak'} growth metrics 
                    with a revenue growth of {stock.revenue_yoy?.toFixed(1) || 'N/A'}% YoY. 
                    The stock is currently trading at a P/E of {stock.pe?.toFixed(1) || 'N/A'}, 
                    {stock.pe && stock.pe < 25 ? ' which suggests reasonable valuation' : ' indicating premium valuation'} 
                    compared to industry peers.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-3">
                    <strong className="text-success">Strengths:</strong> 
                    {stock.roe && stock.roe > 15 ? ' High return on equity indicating efficient capital usage.' : ''} 
                    {stock.debt_to_equity && stock.debt_to_equity < 0.5 ? ' Low debt levels provide financial flexibility.' : ''} 
                    {stock.profit_yoy && stock.profit_yoy > 15 ? ' Strong profit growth trajectory.' : ''} 
                    {stock.sentiment > 0.7 ? ' Positive market sentiment.' : ''}
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-3">
                    <strong className="text-destructive">Risks:</strong> 
                    {stock.volatility > 0.6 ? ' High volatility may lead to significant price swings.' : ''} 
                    {stock.pe && stock.pe > 50 ? ' Elevated valuations could limit upside potential.' : ''} 
                    {stock.debt_to_equity && stock.debt_to_equity > 1.5 ? ' High debt levels pose financial risk.' : ''} 
                    {stock.rsi && stock.rsi > 70 ? ' RSI indicates overbought conditions.' : ''}
                    {stock.rsi && stock.rsi < 30 ? ' RSI indicates oversold conditions.' : ''}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Empty State */}
        {!activeTicker && !isLoading && (
          <div className="text-center py-16 glass-card max-w-md mx-auto">
            <BarChart3 className="h-16 w-16 text-primary/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Enter a Ticker to Analyze</h3>
            <p className="text-muted-foreground">
              Search for any stock to view detailed fundamental analysis and AI insights.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}