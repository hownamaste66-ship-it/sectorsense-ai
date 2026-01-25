import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import { useRealtimeMarketSentiment } from '@/hooks/useRealtimeStocks';
import { RealTimeIndicator } from './RealTimeIndicator';
import { cn } from '@/lib/utils';

export function MarketInsightsBanner() {
  const { sentiment, lastUpdate } = useRealtimeMarketSentiment();

  if (!sentiment) return null;

  const fearGreedScore = sentiment.fear_greed_score || 50;
  const marketMood = sentiment.market_mood || 'Neutral';
  const vix = sentiment.vix || 15;

  const getMoodColor = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'bullish':
      case 'greed':
      case 'extreme greed':
        return 'text-success';
      case 'bearish':
      case 'fear':
      case 'extreme fear':
        return 'text-destructive';
      default:
        return 'text-warning';
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'bullish':
      case 'greed':
      case 'extreme greed':
        return TrendingUp;
      case 'bearish':
      case 'fear':
      case 'extreme fear':
        return TrendingDown;
      default:
        return Activity;
    }
  };

  const MoodIcon = getMoodIcon(marketMood);

  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              getMoodColor(marketMood).replace('text-', 'bg-') + '/20'
            )}>
              <MoodIcon className={cn("h-5 w-5", getMoodColor(marketMood))} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Market Mood</p>
              <p className={cn("font-semibold", getMoodColor(marketMood))}>
                {marketMood}
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-border hidden md:block" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fear & Greed</p>
              <p className="font-semibold">
                {fearGreedScore}
                <span className="text-xs text-muted-foreground ml-1">/ 100</span>
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-border hidden md:block" />

          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              vix > 20 ? 'bg-destructive/20' : 'bg-success/20'
            )}>
              <Activity className={cn(
                "h-5 w-5",
                vix > 20 ? 'text-destructive' : 'text-success'
              )} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">VIX</p>
              <p className={cn(
                "font-semibold",
                vix > 20 ? 'text-destructive' : 'text-success'
              )}>
                {vix.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <RealTimeIndicator lastUpdate={lastUpdate} />
      </div>

      {/* Bullish/Bearish Sectors */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/50">
        {sentiment.bullish_sectors && sentiment.bullish_sectors.length > 0 && (
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Bullish:</span>
            <div className="flex gap-1">
              {sentiment.bullish_sectors.slice(0, 3).map((sector) => (
                <span 
                  key={sector} 
                  className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full"
                >
                  {sector}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {sentiment.bearish_sectors && sentiment.bearish_sectors.length > 0 && (
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-destructive" />
            <span className="text-xs text-muted-foreground">Bearish:</span>
            <div className="flex gap-1">
              {sentiment.bearish_sectors.slice(0, 3).map((sector) => (
                <span 
                  key={sector} 
                  className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded-full"
                >
                  {sector}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
