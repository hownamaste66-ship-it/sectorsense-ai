import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { StockSearchInput } from '@/components/StockSearchInput';
import { KeyMetricCard } from '@/components/KeyMetricCard';
import { RatingMeter } from '@/components/RatingMeter';
import { PriceChart } from '@/components/PriceChart';
import { SentimentGauge } from '@/components/SentimentGauge';
import { VolatilityMeter } from '@/components/VolatilityMeter';
import { RiskScoreCard } from '@/components/RiskScoreCard';
import { AnalystRatingPanel } from '@/components/AnalystRatingPanel';
import { ShareholdingPattern } from '@/components/ShareholdingPattern';
import { ValuationScore } from '@/components/ValuationScore';
import { RealTimeIndicator } from '@/components/RealTimeIndicator';
import { MarketInsightsBanner } from '@/components/MarketInsightsBanner';
import { useRealtimeStock } from '@/hooks/useRealtimeStocks';
import { formatMarketCap, formatPercentage } from '@/lib/formatters';
import { 
  Loader2, TrendingUp, TrendingDown, DollarSign, 
  BarChart3, Percent, Activity, Shield,
  Brain, ChartLine, Target, Gauge, Zap, Volume2,
  Clock, Eye, Flame, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AnalyzePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tickerParam = searchParams.get('ticker') || '';
  const [searchValue, setSearchValue] = useState(tickerParam);
  const [activeTicker, setActiveTicker] = useState(tickerParam);

  const { stock, isLoading, lastUpdate } = useRealtimeStock(activeTicker);

  useEffect(() => {
    const urlTicker = searchParams.get('ticker') || '';
    if (urlTicker !== activeTicker) {
      setActiveTicker(urlTicker);
      setSearchValue(urlTicker);
    }
  }, [searchParams]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleStockSelect = (selectedStock: { ticker: string }) => {
    setActiveTicker(selectedStock.ticker);
    setSearchParams({ ticker: selectedStock.ticker });
  };

  const isPositive = stock && (stock.price_change || 0) >= 0;

  // Calculate ratings
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

  const getMomentumRating = () => {
    if (!stock) return 50;
    const rsiScore = stock.rsi > 50 ? Math.min(100, 50 + (stock.rsi - 50)) : Math.max(0, stock.rsi);
    return Math.round(rsiScore);
  };

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <Header />

      <main className="container py-6">
        <MarketInsightsBanner />

        {/* Hero Section */}
        <div className="text-center mb-6 slide-up">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="gradient-text-premium">Stock Analyzer</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            AI-powered fundamental and technical analysis for NSE/BSE stocks
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <StockSearchInput
            value={searchValue}
            onChange={handleSearchChange}
            onSelect={handleStockSelect}
            placeholder="Search by ticker or company name (e.g., RELIANCE, TCS)"
            autoNavigate={false}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Fetching stock data...</p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && activeTicker && !stock && (
          <div className="text-center py-20 glass-card max-w-md mx-auto">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Stock Not Found</h3>
            <p className="text-muted-foreground text-sm">
              No data available for "{activeTicker}". Try another ticker.
            </p>
          </div>
        )}

        {/* Stock Analysis */}
        {stock && (
          <div className="space-y-6 fade-in">
            {/* Main Header Card */}
            <div className="premium-card p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Left: Stock Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-2xl md:text-3xl font-bold">{stock.ticker}</h2>
                    
                    {/* Tags */}
                    <div className="flex items-center gap-2">
                      {stock.is_trending && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-warning/15 border border-warning/30 text-warning">
                          <Flame className="h-3 w-3" />
                          Trending
                        </span>
                      )}
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-semibold",
                        stock.ai_tag === 'Hot' && 'ai-tag-hot',
                        stock.ai_tag === 'Rising' && 'ai-tag-rising',
                        !['Hot', 'Rising'].includes(stock.ai_tag || '') && 'ai-tag-neutral'
                      )}>
                        {stock.ai_tag || 'Neutral'}
                      </span>
                      <RealTimeIndicator lastUpdate={lastUpdate} />
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-lg mb-4">{stock.name}</p>
                  
                  {/* Quick Stats Row */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Volume2 className="h-4 w-4" />
                      <span>Vol: {(stock.volume / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Activity className="h-4 w-4" />
                      <span>RSI: {stock.rsi}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>Sentiment: {Math.round(stock.sentiment * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* Right: Price Display */}
                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl md:text-5xl font-bold tracking-tight">
                      ₹{stock.price.toLocaleString()}
                    </span>
                    <div className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold",
                      isPositive 
                        ? 'bg-success/15 text-success border border-success/30' 
                        : 'bg-destructive/15 text-destructive border border-destructive/30'
                    )}>
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {formatPercentage(stock.price_change)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Market Cap: {formatMarketCap(stock.market_cap)}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Chart & Metrics */}
              <div className="lg:col-span-2 space-y-6">
                {/* Price Chart */}
                <PriceChart 
                  currentPrice={stock.price} 
                  priceChange={stock.price_change}
                />

                {/* Key Metrics Grid */}
                <section>
                  <div className="section-header">
                    <div className="section-icon">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Key Metrics</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KeyMetricCard
                      label="P/E Ratio"
                      value={stock.pe?.toFixed(1) || 'N/A'}
                      icon={Percent}
                      trend={stock.pe ? (stock.pe < 25 ? 'up' : stock.pe > 50 ? 'down' : 'neutral') : undefined}
                      description="Price to Earnings ratio"
                    />
                    <KeyMetricCard
                      label="EPS"
                      value={stock.eps ? `₹${stock.eps.toFixed(1)}` : 'N/A'}
                      icon={DollarSign}
                      trend={stock.eps ? (stock.eps > 50 ? 'up' : 'neutral') : undefined}
                      description="Earnings per share"
                    />
                    <KeyMetricCard
                      label="ROE"
                      value={stock.roe ? `${stock.roe.toFixed(1)}%` : 'N/A'}
                      icon={TrendingUp}
                      trend={stock.roe ? (stock.roe > 15 ? 'up' : stock.roe < 10 ? 'down' : 'neutral') : undefined}
                      description="Return on Equity"
                    />
                    <KeyMetricCard
                      label="ROCE"
                      value={stock.roce ? `${stock.roce.toFixed(1)}%` : 'N/A'}
                      icon={Activity}
                      trend={stock.roce ? (stock.roce > 15 ? 'up' : stock.roce < 10 ? 'down' : 'neutral') : undefined}
                      description="Return on Capital Employed"
                    />
                    <KeyMetricCard
                      label="Revenue YoY"
                      value={stock.revenue_yoy ? `${stock.revenue_yoy.toFixed(1)}%` : 'N/A'}
                      icon={ChartLine}
                      trend={stock.revenue_yoy ? (stock.revenue_yoy > 15 ? 'up' : stock.revenue_yoy < 0 ? 'down' : 'neutral') : undefined}
                      description="Year-over-year growth"
                    />
                    <KeyMetricCard
                      label="Profit YoY"
                      value={stock.profit_yoy ? `${stock.profit_yoy.toFixed(1)}%` : 'N/A'}
                      icon={Target}
                      trend={stock.profit_yoy ? (stock.profit_yoy > 15 ? 'up' : stock.profit_yoy < 0 ? 'down' : 'neutral') : undefined}
                      description="Profit growth rate"
                    />
                    <KeyMetricCard
                      label="Debt/Equity"
                      value={stock.debt_to_equity?.toFixed(2) || 'N/A'}
                      icon={Shield}
                      trend={stock.debt_to_equity ? (stock.debt_to_equity < 0.5 ? 'up' : stock.debt_to_equity > 1.5 ? 'down' : 'neutral') : undefined}
                      description="Leverage ratio"
                    />
                    <KeyMetricCard
                      label="RSI"
                      value={stock.rsi || 'N/A'}
                      icon={Zap}
                      trend={stock.rsi > 70 ? 'down' : stock.rsi < 30 ? 'up' : 'neutral'}
                      description={stock.rsi > 70 ? 'Overbought' : stock.rsi < 30 ? 'Oversold' : 'Neutral'}
                    />
                  </div>
                </section>

                {/* AI Ratings Section */}
                <section>
                  <div className="section-header">
                    <div className="section-icon">
                      <Gauge className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">AI Ratings</h3>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="glass-card p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Valuation</h4>
                      <RatingMeter 
                        label="Score" 
                        value={getValuationRating()} 
                        type={getValuationRating() >= 60 ? 'bullish' : getValuationRating() >= 40 ? 'neutral' : 'bearish'}
                      />
                    </div>
                    <div className="glass-card p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Growth</h4>
                      <RatingMeter 
                        label="Score" 
                        value={getGrowthRating()} 
                        type={getGrowthRating() >= 60 ? 'bullish' : getGrowthRating() >= 40 ? 'neutral' : 'bearish'}
                      />
                    </div>
                    <div className="glass-card p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Momentum</h4>
                      <RatingMeter 
                        label="Score" 
                        value={getMomentumRating()} 
                        type={getMomentumRating() >= 60 ? 'bullish' : getMomentumRating() >= 40 ? 'neutral' : 'bearish'}
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
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <span className="text-sm text-accent font-medium">AI Generated Insight</span>
                    </div>
                    <div className="space-y-4 text-sm leading-relaxed">
                      <p className="text-muted-foreground">
                        <strong className="text-foreground">{stock.name} ({stock.ticker})</strong> shows 
                        {getGrowthRating() >= 60 ? ' strong' : getGrowthRating() >= 40 ? ' moderate' : ' weak'} growth metrics 
                        with revenue growth of <span className={stock.revenue_yoy && stock.revenue_yoy > 0 ? 'text-success' : 'text-destructive'}>{stock.revenue_yoy?.toFixed(1) || 'N/A'}% YoY</span>. 
                        Trading at P/E of {stock.pe?.toFixed(1) || 'N/A'}, 
                        {stock.pe && stock.pe < 25 ? ' suggesting reasonable valuation' : ' indicating premium valuation'}.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                          <p className="font-medium text-success mb-2 flex items-center gap-1.5">
                            <TrendingUp className="h-4 w-4" /> Strengths
                          </p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {stock.roe && stock.roe > 15 && <li>• High ROE ({stock.roe.toFixed(1)}%) - efficient capital usage</li>}
                            {stock.debt_to_equity && stock.debt_to_equity < 0.5 && <li>• Low debt ({stock.debt_to_equity.toFixed(2)}x) - financial flexibility</li>}
                            {stock.profit_yoy && stock.profit_yoy > 15 && <li>• Strong profit growth ({stock.profit_yoy.toFixed(1)}%)</li>}
                            {stock.sentiment > 0.7 && <li>• Positive market sentiment ({Math.round(stock.sentiment * 100)}%)</li>}
                            {(!stock.roe || stock.roe <= 15) && (!stock.debt_to_equity || stock.debt_to_equity >= 0.5) && <li>• Stable market position</li>}
                          </ul>
                        </div>
                        
                        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                          <p className="font-medium text-destructive mb-2 flex items-center gap-1.5">
                            <TrendingDown className="h-4 w-4" /> Risks
                          </p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {stock.volatility > 0.6 && <li>• High volatility ({Math.round(stock.volatility * 100)}%) - price swings</li>}
                            {stock.pe && stock.pe > 50 && <li>• Elevated P/E ({stock.pe.toFixed(1)}x) - limited upside</li>}
                            {stock.debt_to_equity && stock.debt_to_equity > 1.5 && <li>• High debt ({stock.debt_to_equity.toFixed(2)}x) - financial risk</li>}
                            {stock.rsi && stock.rsi > 70 && <li>• RSI overbought ({stock.rsi}) - correction likely</li>}
                            {stock.rsi && stock.rsi < 30 && <li>• RSI oversold ({stock.rsi}) - under pressure</li>}
                            {(!stock.volatility || stock.volatility <= 0.6) && (!stock.pe || stock.pe <= 50) && <li>• Market-wide risks apply</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-muted-foreground mt-4 pt-3 border-t border-border/50">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Analysis generated at {new Date().toLocaleTimeString()} • This is not financial advice
                    </p>
                  </div>
                </section>
              </div>

              {/* Right Column - Analysis Panels */}
              <div className="space-y-6">
                {/* Sentiment Gauge */}
                <div className="glass-card p-5">
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">Market Sentiment</h4>
                  <SentimentGauge 
                    value={stock.sentiment * 100} 
                    label="Sentiment Score"
                    size="lg"
                  />
                </div>

                {/* Volatility Meter */}
                <VolatilityMeter value={stock.volatility} />

                {/* Risk Score */}
                <RiskScoreCard 
                  volatility={stock.volatility}
                  debtToEquity={stock.debt_to_equity}
                  pe={stock.pe}
                  rsi={stock.rsi}
                />

                {/* Analyst Ratings */}
                <AnalystRatingPanel currentPrice={stock.price} />

                {/* Shareholding Pattern */}
                <ShareholdingPattern />

                {/* Valuation Score */}
                <ValuationScore 
                  pe={stock.pe}
                  roe={stock.roe}
                  roce={stock.roce}
                  debtToEquity={stock.debt_to_equity}
                  revenueYoy={stock.revenue_yoy}
                  profitYoy={stock.profit_yoy}
                />
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!activeTicker && !isLoading && (
          <div className="text-center py-16 glass-card max-w-md mx-auto">
            <BarChart3 className="h-16 w-16 text-primary/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Enter a Ticker to Analyze</h3>
            <p className="text-muted-foreground text-sm">
              Search for any NSE/BSE stock to view detailed fundamental analysis and AI insights.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
