import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StockMetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StockMetricCard({ 
  label, 
  value, 
  subValue, 
  icon: Icon, 
  trend,
  className 
}: StockMetricCardProps) {
  return (
    <div className={cn("glass-card p-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className={cn(
          "text-xl font-bold",
          trend === 'up' && 'text-success',
          trend === 'down' && 'text-destructive',
          !trend && 'text-foreground'
        )}>
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-muted-foreground mb-0.5">{subValue}</span>
        )}
      </div>
    </div>
  );
}