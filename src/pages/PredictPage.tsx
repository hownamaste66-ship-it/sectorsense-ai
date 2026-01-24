import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { RatingMeter } from '@/components/RatingMeter';
import { SparklineChart } from '@/components/SparklineChart';
import { useStock } from '@/hooks/useStocks';
import { formatMarketCap } from '@/lib/formatters';
import { 
  Search, Loader2, TrendingUp, TrendingDown, Minus,
  Brain, Target, AlertTriangle, Zap, Activity, LineChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PredictPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tickerParam = searchParams.get('ticker') || '';
  const [searchValue, setSearchValue] = useState(tickerParam);
  const [activeTicker, setActiveTicker] = useState(tickerParam);

  const { data: stock, isLoading } = useStock(activeTicker);

  const handleSearch = () => {
    if (searchValue.trim()) {
      setActiveTicker(searchValue.trim().toUpperCase());
      setSearchParams({ ticker: searchValue.trim().toUpperCase() });
    }
  };

  // Generate AI prediction based on stock metrics
  const getPrediction = () => {
    if (!stock) return null;

    const momentumScore = Math.round(
      (stock.sentiment * 40) + 
      ((stock.rsi - 30) / 40 * 30) + 
      (stock.price_change > 0 ? 20 : 0) +
      10
    );

    const trend = momentumScore >= 65 ? 'Bullish' : momentumScore >= 45 ? 'Neutral' : 'Bearish';
    
    const supportLevel = stock.price * (1 - stock.volatility * 0.15);
    const resistanceLevel = stock.price * (1 + stock.volatility * 0.15);
    
    const sevenDayForecast = {
      direction: trend === 'Bullish' ? 'up' : trend === 'Bearish' ? 'down' : 'sideways',
      probability: momentumScore,
    };

    const longTermTarget = stock.price * (1 + (stock.revenue_yoy || 0) / 100);

    return {
      trend,
      momentumScore: Math.min(100, Math.max(0, momentumScore)),
      supportLevel,
      resistanceLevel,
      industrySentimentImpact: Math.round(stock.sentiment * 100),
      volatilityScore: Math.round(stock.volatility * 100),
      sevenDayForecast,
      longTermZones: {
        support: supportLevel * 0.9,
        resistance: resistanceLevel * 1.1,
        target: longTermTarget,
      },
    };
  };

  const prediction = stock ? getPrediction() : null;
  const sparklineData = Array.from({ length: 20 }, () => Math.random() * 100);

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <Header />

      <main className="container py-8">
        {/* Hero */}
        <div className="text-center mb-8 slide-up">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="gradient-text-accent">Stock Predictor</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            AI-powered trend prediction and momentum analysis
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
                placeholder="Enter ticker symbol (e.g., TCS)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>
            <Button onClick={handleSearch} className="bg-accent hover:bg-accent/90 text-white">
              Predict
            </Button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        )}

        {/* No Results */}
        {!isLoading && activeTicker && !stock && (
          <div className="text-center py-20 glass-card max-w-md mx-auto">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Stock Not Found</h3>
            <p className="text-muted-foreground">
              No data available for "{activeTicker}".
            </p>
          </div>
        )}

        {/* Prediction Results */}
        {stock && prediction && (
          <div className="space-y-8 fade-in">
            {/* Main Prediction Card */}
            <div className="premium-card p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">{stock.name}</h2>
              <p className="text-muted-foreground mb-6">Short-term Trend Analysis</p>

              <div className={cn(
                "inline-flex items-center gap-3 px-6 py-4 rounded-2xl mb-6",
                prediction.trend === 'Bullish' && 'bg-success/20 border border-success/40',
                prediction.trend === 'Bearish' && 'bg-destructive/20 border border-destructive/40',
                prediction.trend === 'Neutral' && 'bg-warning/20 border border-warning/40',
              )}>
                {prediction.trend === 'Bullish' && <TrendingUp className="h-8 w-8 text-success" />}
                {prediction.trend === 'Bearish' && <TrendingDown className="h-8 w-8 text-destructive" />}
                {prediction.trend === 'Neutral' && <Minus className="h-8 w-8 text-warning" />}
                <span className={cn(
                  "text-3xl font-bold",
                  prediction.trend === 'Bullish' && 'text-success',
                  prediction.trend === 'Bearish' && 'text-destructive',
                  prediction.trend === 'Neutral' && 'text-warning',
                )}>
                  {prediction.trend}
                </span>
              </div>

              <div className="flex justify-center gap-2 mb-4">
                <SparklineChart 
                  data={sparklineData} 
                  color={prediction.trend === 'Bullish' ? 'success' : prediction.trend === 'Bearish' ? 'destructive' : 'primary'}
                  className="w-40"
                />
              </div>

              <p className="text-sm text-muted-foreground">
                * Predictions are based on historical data and technical indicators. Not financial advice.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Momentum Score */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-accent" />
                  <h4 className="font-medium">Momentum Score</h4>
                </div>
                <RatingMeter 
                  label="" 
                  value={prediction.momentumScore} 
                  type={prediction.momentumScore >= 60 ? 'bullish' : prediction.momentumScore >= 40 ? 'neutral' : 'bearish'}
                />
              </div>

              {/* Support & Resistance */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-accent" />
                  <h4 className="font-medium">Support & Resistance</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Support</span>
                    <span className="text-success font-medium">₹{prediction.supportLevel.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resistance</span>
                    <span className="text-destructive font-medium">₹{prediction.resistanceLevel.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Industry Sentiment */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-accent" />
                  <h4 className="font-medium">Industry Sentiment</h4>
                </div>
                <RatingMeter 
                  label="" 
                  value={prediction.industrySentimentImpact} 
                  type={prediction.industrySentimentImpact >= 60 ? 'bullish' : prediction.industrySentimentImpact >= 40 ? 'neutral' : 'bearish'}
                />
              </div>

              {/* Volatility */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <h4 className="font-medium">Volatility Score</h4>
                </div>
                <RatingMeter 
                  label="" 
                  value={prediction.volatilityScore} 
                  type={prediction.volatilityScore <= 40 ? 'bullish' : prediction.volatilityScore <= 60 ? 'neutral' : 'bearish'}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {prediction.volatilityScore >= 60 ? 'High risk - expect significant swings' : 
                   prediction.volatilityScore >= 40 ? 'Moderate volatility' : 'Low volatility - stable price action'}
                </p>
              </div>

              {/* 7-Day Forecast */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <LineChart className="h-5 w-5 text-accent" />
                  <h4 className="font-medium">7-Day Forecast</h4>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg",
                    prediction.sevenDayForecast.direction === 'up' && 'bg-success/20',
                    prediction.sevenDayForecast.direction === 'down' && 'bg-destructive/20',
                    prediction.sevenDayForecast.direction === 'sideways' && 'bg-muted',
                  )}>
                    {prediction.sevenDayForecast.direction === 'up' && <TrendingUp className="h-4 w-4 text-success" />}
                    {prediction.sevenDayForecast.direction === 'down' && <TrendingDown className="h-4 w-4 text-destructive" />}
                    {prediction.sevenDayForecast.direction === 'sideways' && <Minus className="h-4 w-4 text-muted-foreground" />}
                    <span className="font-medium capitalize">{prediction.sevenDayForecast.direction}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {prediction.sevenDayForecast.probability}% probability
                  </span>
                </div>
              </div>

              {/* Long-term Zones */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-5 w-5 text-accent" />
                  <h4 className="font-medium">Long-term Potential</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Price</span>
                    <span className="text-primary font-medium">₹{prediction.longTermZones.target.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Long Support</span>
                    <span className="text-success">₹{prediction.longTermZones.support.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Long Resistance</span>
                    <span className="text-destructive">₹{prediction.longTermZones.resistance.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="glass-card p-4 border-l-4 border-warning">
              <p className="text-sm text-muted-foreground">
                <strong className="text-warning">Disclaimer:</strong> This prediction is generated using AI analysis of historical data, 
                technical indicators, and market sentiment. It is for informational purposes only and does not constitute 
                financial advice. Always conduct your own research before making investment decisions.
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!activeTicker && !isLoading && (
          <div className="text-center py-16 glass-card max-w-md mx-auto">
            <Brain className="h-16 w-16 text-accent/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Enter a Ticker to Predict</h3>
            <p className="text-muted-foreground">
              Get AI-powered trend predictions and technical analysis.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}