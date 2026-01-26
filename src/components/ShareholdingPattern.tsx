import { cn } from '@/lib/utils';
import { PieChart, Users, Building2 } from 'lucide-react';

interface ShareholdingPatternProps {
  promoterHolding?: number;
  fiiHolding?: number;
  diiHolding?: number;
  publicHolding?: number;
  className?: string;
}

export function ShareholdingPattern({
  promoterHolding = 52.5,
  fiiHolding = 18.2,
  diiHolding = 12.8,
  publicHolding = 16.5,
  className
}: ShareholdingPatternProps) {
  const holdings = [
    { label: 'Promoters', value: promoterHolding, color: 'bg-primary', textColor: 'text-primary' },
    { label: 'FII', value: fiiHolding, color: 'bg-accent', textColor: 'text-accent' },
    { label: 'DII', value: diiHolding, color: 'bg-success', textColor: 'text-success' },
    { label: 'Public', value: publicHolding, color: 'bg-warning', textColor: 'text-warning' },
  ];

  // Calculate cumulative percentages for the ring chart
  let cumulative = 0;
  const segments = holdings.map(h => {
    const start = cumulative;
    cumulative += h.value;
    return { ...h, start, end: cumulative };
  });

  return (
    <div className={cn("glass-card p-5", className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/30">
          <PieChart className="h-4 w-4 text-primary" />
        </div>
        <h4 className="font-semibold">Shareholding Pattern</h4>
      </div>

      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {segments.map((segment, index) => {
              const circumference = 2 * Math.PI * 40;
              const strokeDasharray = (segment.value / 100) * circumference;
              const strokeDashoffset = -((segment.start / 100) * circumference);
              
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={
                    index === 0 ? 'hsl(168, 80%, 48%)' :
                    index === 1 ? 'hsl(252, 85%, 60%)' :
                    index === 2 ? 'hsl(145, 80%, 42%)' :
                    'hsl(38, 95%, 55%)'
                  }
                  strokeWidth="12"
                  strokeDasharray={`${strokeDasharray} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Users className="h-5 w-5 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">100%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {holdings.map((holding) => (
            <div key={holding.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("w-2.5 h-2.5 rounded-full", holding.color)} />
                <span className="text-sm text-muted-foreground">{holding.label}</span>
              </div>
              <span className={cn("text-sm font-semibold", holding.textColor)}>
                {holding.value.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insight */}
      <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            {promoterHolding >= 50 
              ? 'Strong promoter holding indicates confidence' 
              : promoterHolding >= 30 
              ? 'Moderate promoter holding with institutional interest'
              : 'Low promoter holding - evaluate institutional confidence'}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mt-3 text-center">
        Simulated data • Updates quarterly
      </p>
    </div>
  );
}
