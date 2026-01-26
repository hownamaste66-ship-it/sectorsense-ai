import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KeyMetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  className?: string;
}

export function KeyMetricCard({ 
  label, 
  value, 
  subValue, 
  icon: Icon, 
  trend,
  description,
  className 
}: KeyMetricCardProps) {
  return (
    <div className={cn(
      "group glass-card p-4 transition-all duration-300 hover:border-primary/40",
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/20 group-hover:border-primary/40 transition-colors">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        {trend && (
          <div className={cn(
            "px-2 py-0.5 rounded text-[10px] font-medium",
            trend === 'up' && 'bg-success/10 text-success border border-success/20',
            trend === 'down' && 'bg-destructive/10 text-destructive border border-destructive/20',
            trend === 'neutral' && 'bg-muted text-muted-foreground border border-border'
          )}>
            {trend === 'up' ? '▲ Good' : trend === 'down' ? '▼ Concern' : '◆ Neutral'}
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
        {label}
      </p>
      
      <div className="flex items-baseline gap-2">
        <span className={cn(
          "text-2xl font-bold",
          trend === 'up' && 'text-success',
          trend === 'down' && 'text-destructive',
          !trend && 'text-foreground'
        )}>
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-muted-foreground">{subValue}</span>
        )}
      </div>
      
      {description && (
        <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2">
          {description}
        </p>
      )}
    </div>
  );
}
