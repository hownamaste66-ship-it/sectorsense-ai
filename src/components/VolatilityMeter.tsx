import { cn } from '@/lib/utils';
import { Activity } from 'lucide-react';

interface VolatilityMeterProps {
  value: number; // 0-1 scale
  className?: string;
}

export function VolatilityMeter({ value, className }: VolatilityMeterProps) {
  const normalizedValue = Math.min(1, Math.max(0, value)) * 100;
  
  const getVolatilityLabel = () => {
    if (normalizedValue >= 70) return 'High';
    if (normalizedValue >= 40) return 'Medium';
    return 'Low';
  };

  const getVolatilityColor = () => {
    if (normalizedValue >= 70) return 'text-destructive';
    if (normalizedValue >= 40) return 'text-warning';
    return 'text-success';
  };

  const getBgGradient = () => {
    if (normalizedValue >= 70) return 'from-destructive/20 to-orange-500/10';
    if (normalizedValue >= 40) return 'from-warning/20 to-yellow-500/10';
    return 'from-success/20 to-emerald-500/10';
  };

  const getBorderColor = () => {
    if (normalizedValue >= 70) return 'border-destructive/40';
    if (normalizedValue >= 40) return 'border-warning/40';
    return 'border-success/40';
  };

  return (
    <div className={cn("glass-card p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg bg-gradient-to-br", getBgGradient(), getBorderColor(), "border")}>
            <Activity className={cn("h-4 w-4", getVolatilityColor())} />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Volatility</span>
        </div>
        <span className={cn("text-sm font-semibold", getVolatilityColor())}>
          {getVolatilityLabel()}
        </span>
      </div>
      
      {/* Volatility bars */}
      <div className="flex gap-1 h-8 items-end">
        {[...Array(10)].map((_, i) => {
          const isActive = (i + 1) * 10 <= normalizedValue;
          const isPartial = !isActive && i * 10 < normalizedValue;
          
          return (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-sm transition-all duration-300",
                isActive || isPartial
                  ? normalizedValue >= 70
                    ? 'bg-gradient-to-t from-destructive to-orange-500'
                    : normalizedValue >= 40
                    ? 'bg-gradient-to-t from-warning to-yellow-400'
                    : 'bg-gradient-to-t from-success to-emerald-400'
                  : 'bg-muted/50'
              )}
              style={{
                height: `${20 + i * 8}%`,
                opacity: isActive ? 1 : isPartial ? 0.5 : 0.3
              }}
            />
          );
        })}
      </div>
      
      <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
}
