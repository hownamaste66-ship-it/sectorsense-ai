import { Header } from '@/components/Header';
import { SectorHeatmap } from '@/components/SectorHeatmap';
import { FearGreedGauge } from '@/components/FearGreedGauge';
import { useMarketSentiment, useTrendingStocks } from '@/hooks/useStocks';
import { useIndustries } from '@/hooks/useIndustries';
import { 
  Activity, TrendingUp, TrendingDown, BarChart3, 
  Gauge, Flame, Loader2, Brain, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function SentimentPage() {
  const { data: sentiment, isLoading: sentimentLoading } = useMarketSentiment();
  const { data: trendingStocks } = useTrendingStocks();
  const { data: industries } = useIndustries('all', '');

  // Calculate VIX sentiment label
  const getVixLabel = (vix: number) => {
    if (vix < 15) return { label: 'Low Volatility', color: 'text-success' };
    if (vix < 25) return { label: 'Moderate', color: 'text-warning' };
    return { label: 'High Volatility', color: 'text-destructive' };
  };

  // Get mood emoji
  const getMoodEmoji = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'bullish':
      case 'very bullish':
        return '🚀';
      case 'cautiously optimistic':
        return '📈';
      case 'neutral':
        return '😐';
      case 'cautious':
      case 'bearish':
        return '📉';
      default:
        return '🔮';
    }
  };

  if (sentimentLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <Header />

      <main className="container py-8">
        {/* Hero */}
        <div className="text-center mb-10 slide-up">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="gradient-text">Market Sentiment</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Real-time market mood, sector analysis, and fear-greed indicators
          </p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Fear & Greed Index */}
          <div className="lg:col-span-1 premium-card p-6">
            <div className="section-header">
              <div className="section-icon">
                <Gauge className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Fear & Greed Index</h3>
            </div>
            <div className="flex justify-center">
              <FearGreedGauge score={sentiment?.fear_greed_score || 50} />
            </div>
          </div>

          {/* AI Market Mood */}
          <div className="glass-card p-6">
            <div className="section-header">
              <div className="section-icon">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">AI Market Mood</h3>
            </div>
            <div className="text-center py-4">
              <span className="text-6xl mb-4 block">
                {getMoodEmoji(sentiment?.market_mood || 'Neutral')}
              </span>
              <h4 className={cn(
                "text-2xl font-bold mb-2",
                sentiment?.market_mood?.includes('Bullish') && 'text-success',
                sentiment?.market_mood?.includes('Bearish') && 'text-destructive',
              )}>
                {sentiment?.market_mood || 'Neutral'}
              </h4>
              <p className="text-sm text-muted-foreground">
                Based on technical indicators and market data
              </p>
            </div>
          </div>

          {/* VIX Indicator */}
          <div className="glass-card p-6">
            <div className="section-header">
              <div className="section-icon">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <h3 className="font-semibold">India VIX</h3>
            </div>
            <div className="text-center py-4">
              <span className="text-5xl font-bold gradient-text">
                {sentiment?.vix?.toFixed(2) || '15.00'}
              </span>
              <p className={cn(
                "text-lg font-medium mt-2",
                getVixLabel(sentiment?.vix || 15).color
              )}>
                {getVixLabel(sentiment?.vix || 15).label}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Volatility Index
              </p>
            </div>
          </div>
        </div>

        {/* Sector Heatmap */}
        <section className="mb-10">
          <div className="section-header">
            <div className="section-icon">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Sector Heatmap</h3>
          </div>
          <div className="premium-card p-6">
            <SectorHeatmap />
          </div>
        </section>

        {/* Bullish & Bearish Sectors */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Top Bullish */}
          <div className="glass-card p-6">
            <div className="section-header">
              <div className="section-icon bg-success/20 border-success/30">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <h3 className="font-semibold">Top Bullish Sectors</h3>
            </div>
            <div className="space-y-3">
              {(sentiment?.bullish_sectors || ['Technology', 'Financial Services', 'Healthcare']).map((sector, i) => (
                <div 
                  key={sector}
                  className="flex items-center gap-3 p-3 rounded-lg heatmap-positive fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span className="text-success font-bold">{i + 1}</span>
                  <span className="font-medium">{sector}</span>
                  <TrendingUp className="h-4 w-4 text-success ml-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Top Bearish */}
          <div className="glass-card p-6">
            <div className="section-header">
              <div className="section-icon bg-destructive/20 border-destructive/30">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="font-semibold">Top Bearish Sectors</h3>
            </div>
            <div className="space-y-3">
              {(sentiment?.bearish_sectors || ['Real Estate', 'Consumer Goods']).map((sector, i) => (
                <div 
                  key={sector}
                  className="flex items-center gap-3 p-3 rounded-lg heatmap-negative fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span className="text-destructive font-bold">{i + 1}</span>
                  <span className="font-medium">{sector}</span>
                  <TrendingDown className="h-4 w-4 text-destructive ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Most Active Industries */}
        <section>
          <div className="section-header">
            <div className="section-icon">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Most Active Industries Today</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(sentiment?.active_industries || ['Technology', 'Financial Services', 'Energy', 'Industrials']).map((industry, i) => (
              <div 
                key={industry}
                className="premium-card p-4 text-center fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <Activity className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="font-medium text-sm">{industry}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}