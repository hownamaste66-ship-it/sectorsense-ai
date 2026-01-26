import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

interface AnalystRatingPanelProps {
  // These would come from real API data
  buyRating?: number;
  holdRating?: number;
  sellRating?: number;
  targetPrice?: number;
  currentPrice: number;
  className?: string;
}

export function AnalystRatingPanel({ 
  buyRating = 65, 
  holdRating = 25, 
  sellRating = 10,
  targetPrice,
  currentPrice,
  className 
}: AnalystRatingPanelProps) {
  const total = buyRating + holdRating + sellRating;
  const buyPercent = (buyRating / total) * 100;
  const holdPercent = (holdRating / total) * 100;
  const sellPercent = (sellRating / total) * 100;

  const getConsensus = () => {
    if (buyPercent >= 60) return { label: 'Strong Buy', color: 'text-success', icon: TrendingUp };
    if (buyPercent >= 45) return { label: 'Buy', color: 'text-emerald-400', icon: TrendingUp };
    if (holdPercent >= 50) return { label: 'Hold', color: 'text-warning', icon: Minus };
    if (sellPercent >= 45) return { label: 'Sell', color: 'text-orange-400', icon: TrendingDown };
    return { label: 'Strong Sell', color: 'text-destructive', icon: TrendingDown };
  };

  const consensus = getConsensus();
  const estimatedTarget = targetPrice || currentPrice * (1 + (buyPercent - sellPercent) / 200);
  const upside = ((estimatedTarget - currentPrice) / currentPrice) * 100;

  return (
    <div className={cn("glass-card p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Analyst Ratings
        </h4>
        <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium", 
          consensus.color,
          "bg-gradient-to-r from-current/10 to-current/5"
        )}>
          <consensus.icon className="h-3.5 w-3.5" />
          {consensus.label}
        </div>
      </div>

      {/* Rating Distribution Bar */}
      <div className="mb-4">
        <div className="h-3 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-gradient-to-r from-success to-emerald-400 transition-all duration-500"
            style={{ width: `${buyPercent}%` }}
          />
          <div 
            className="h-full bg-gradient-to-r from-warning to-yellow-400 transition-all duration-500"
            style={{ width: `${holdPercent}%` }}
          />
          <div 
            className="h-full bg-gradient-to-r from-destructive to-red-400 transition-all duration-500"
            style={{ width: `${sellPercent}%` }}
          />
        </div>
      </div>

      {/* Rating Breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-success/10 border border-success/20">
          <div className="text-lg font-bold text-success">{buyPercent.toFixed(0)}%</div>
          <div className="text-xs text-success/80">Buy</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-warning/10 border border-warning/20">
          <div className="text-lg font-bold text-warning">{holdPercent.toFixed(0)}%</div>
          <div className="text-xs text-warning/80">Hold</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="text-lg font-bold text-destructive">{sellPercent.toFixed(0)}%</div>
          <div className="text-xs text-destructive/80">Sell</div>
        </div>
      </div>

      {/* Target Price */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
        <div>
          <p className="text-xs text-muted-foreground">Target Price</p>
          <p className="font-semibold">₹{estimatedTarget.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Potential</p>
          <p className={cn("font-semibold", upside >= 0 ? 'text-success' : 'text-destructive')}>
            {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
          </p>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mt-3 text-center">
        Based on simulated analyst consensus • Not financial advice
      </p>
    </div>
  );
}
