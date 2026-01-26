import { cn } from '@/lib/utils';

interface SentimentGaugeProps {
  value: number; // 0-100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SentimentGauge({ value, label = 'Sentiment', size = 'md', className }: SentimentGaugeProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  const rotation = (normalizedValue / 100) * 180 - 90; // -90 to 90 degrees
  
  const getSentimentLabel = () => {
    if (normalizedValue >= 70) return 'Bullish';
    if (normalizedValue >= 55) return 'Optimistic';
    if (normalizedValue >= 45) return 'Neutral';
    if (normalizedValue >= 30) return 'Pessimistic';
    return 'Bearish';
  };

  const getSentimentColor = () => {
    if (normalizedValue >= 70) return 'text-success';
    if (normalizedValue >= 55) return 'text-emerald-400';
    if (normalizedValue >= 45) return 'text-warning';
    if (normalizedValue >= 30) return 'text-orange-400';
    return 'text-destructive';
  };

  const sizeClasses = {
    sm: 'w-24 h-12',
    md: 'w-32 h-16',
    lg: 'w-40 h-20'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        {/* Background arc */}
        <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
          {/* Gradient definition */}
          <defs>
            <linearGradient id="sentimentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(0, 72%, 55%)" />
              <stop offset="25%" stopColor="hsl(38, 95%, 55%)" />
              <stop offset="50%" stopColor="hsl(52, 95%, 55%)" />
              <stop offset="75%" stopColor="hsl(145, 80%, 42%)" />
              <stop offset="100%" stopColor="hsl(168, 80%, 48%)" />
            </linearGradient>
          </defs>
          
          {/* Background arc */}
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Gradient arc */}
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke="url(#sentimentGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(normalizedValue / 100) * 141.4} 141.4`}
          />
          
          {/* Needle */}
          <g transform={`rotate(${rotation}, 50, 50)`}>
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="12"
              stroke="hsl(var(--foreground))"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="50" cy="50" r="4" fill="hsl(var(--foreground))" />
          </g>
        </svg>
      </div>
      
      <div className="text-center">
        <p className={cn("font-semibold", textSizes[size], getSentimentColor())}>
          {getSentimentLabel()}
        </p>
        <p className={cn("text-muted-foreground", size === 'sm' ? 'text-[10px]' : 'text-xs')}>
          {label}: {normalizedValue.toFixed(0)}%
        </p>
      </div>
    </div>
  );
}
