import { cn } from '@/lib/utils';

interface FearGreedGaugeProps {
  score: number; // 0-100
}

export function FearGreedGauge({ score }: FearGreedGaugeProps) {
  const getLabel = () => {
    if (score >= 80) return 'Extreme Greed';
    if (score >= 60) return 'Greed';
    if (score >= 40) return 'Neutral';
    if (score >= 20) return 'Fear';
    return 'Extreme Fear';
  };

  const getColor = () => {
    if (score >= 60) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  // Calculate needle rotation (-90 to 90 degrees)
  const rotation = (score / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Gauge background */}
        <div className="absolute inset-0 rounded-t-full overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              background: `conic-gradient(
                from 180deg,
                hsl(0 72% 55%) 0deg,
                hsl(38 95% 55%) 60deg,
                hsl(52 95% 55%) 90deg,
                hsl(145 80% 42%) 180deg
              )`,
              opacity: 0.3,
            }}
          />
        </div>

        {/* Gauge segments */}
        <div className="absolute inset-2 rounded-t-full bg-card/80" />

        {/* Needle */}
        <div 
          className="absolute bottom-0 left-1/2 w-1 h-20 origin-bottom transform -translate-x-1/2 transition-transform duration-700"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className="w-full h-full bg-gradient-to-t from-primary to-transparent rounded-full" />
        </div>

        {/* Center dot */}
        <div className="absolute bottom-0 left-1/2 w-4 h-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary border-2 border-background" />
      </div>

      <div className="mt-4 text-center">
        <span className={cn("text-3xl font-bold", getColor())}>{score}</span>
        <p className={cn("text-sm font-medium mt-1", getColor())}>{getLabel()}</p>
      </div>

      {/* Labels */}
      <div className="flex justify-between w-48 mt-2 text-xs text-muted-foreground">
        <span>Fear</span>
        <span>Neutral</span>
        <span>Greed</span>
      </div>
    </div>
  );
}