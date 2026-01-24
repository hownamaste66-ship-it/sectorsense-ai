import { cn } from '@/lib/utils';

interface RatingMeterProps {
  label: string;
  value: number; // 0-100
  type?: 'bullish' | 'bearish' | 'neutral';
  showLabel?: boolean;
}

export function RatingMeter({ label, value, type = 'neutral', showLabel = true }: RatingMeterProps) {
  const getRatingLabel = () => {
    if (value >= 70) return 'Strong';
    if (value >= 50) return 'Moderate';
    if (value >= 30) return 'Weak';
    return 'Low';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {showLabel && (
          <span className={cn(
            "text-sm font-medium",
            type === 'bullish' && 'text-success',
            type === 'bearish' && 'text-destructive',
            type === 'neutral' && 'text-warning'
          )}>
            {getRatingLabel()} ({value}%)
          </span>
        )}
      </div>
      <div className="rating-meter">
        <div 
          className={cn(
            "rating-meter-fill",
            type === 'bullish' && 'rating-bullish',
            type === 'bearish' && 'rating-bearish',
            type === 'neutral' && 'rating-neutral'
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}