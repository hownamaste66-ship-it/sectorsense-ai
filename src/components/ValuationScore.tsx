import { cn } from '@/lib/utils';
import { Gauge, Star } from 'lucide-react';

interface ValuationScoreProps {
  pe?: number | null;
  roe?: number | null;
  roce?: number | null;
  debtToEquity?: number | null;
  revenueYoy?: number | null;
  profitYoy?: number | null;
  className?: string;
}

export function ValuationScore({
  pe,
  roe,
  roce,
  debtToEquity,
  revenueYoy,
  profitYoy,
  className
}: ValuationScoreProps) {
  // Calculate individual scores
  const scores = {
    peScore: pe !== null && pe !== undefined ? (pe < 15 ? 100 : pe < 25 ? 80 : pe < 40 ? 60 : pe < 60 ? 40 : 20) : null,
    roeScore: roe !== null && roe !== undefined ? (roe > 20 ? 100 : roe > 15 ? 80 : roe > 10 ? 60 : roe > 5 ? 40 : 20) : null,
    roceScore: roce !== null && roce !== undefined ? (roce > 20 ? 100 : roce > 15 ? 80 : roce > 10 ? 60 : roce > 5 ? 40 : 20) : null,
    debtScore: debtToEquity !== null && debtToEquity !== undefined ? (debtToEquity < 0.3 ? 100 : debtToEquity < 0.5 ? 80 : debtToEquity < 1 ? 60 : debtToEquity < 1.5 ? 40 : 20) : null,
    growthScore: revenueYoy !== null && revenueYoy !== undefined ? (revenueYoy > 20 ? 100 : revenueYoy > 15 ? 80 : revenueYoy > 10 ? 60 : revenueYoy > 0 ? 40 : 20) : null,
    profitScore: profitYoy !== null && profitYoy !== undefined ? (profitYoy > 25 ? 100 : profitYoy > 15 ? 80 : profitYoy > 5 ? 60 : profitYoy > 0 ? 40 : 20) : null,
  };

  const validScores = Object.values(scores).filter(s => s !== null) as number[];
  const overallScore = validScores.length > 0 
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : 50;

  const getGrade = () => {
    if (overallScore >= 85) return { grade: 'A+', label: 'Excellent', color: 'text-primary' };
    if (overallScore >= 75) return { grade: 'A', label: 'Very Good', color: 'text-success' };
    if (overallScore >= 65) return { grade: 'B+', label: 'Good', color: 'text-emerald-400' };
    if (overallScore >= 55) return { grade: 'B', label: 'Fair', color: 'text-warning' };
    if (overallScore >= 45) return { grade: 'C', label: 'Average', color: 'text-orange-400' };
    return { grade: 'D', label: 'Below Average', color: 'text-destructive' };
  };

  const { grade, label, color } = getGrade();

  const metrics = [
    { name: 'Valuation (P/E)', score: scores.peScore, value: pe !== null && pe !== undefined ? `${pe.toFixed(1)}x` : 'N/A' },
    { name: 'ROE', score: scores.roeScore, value: roe !== null && roe !== undefined ? `${roe.toFixed(1)}%` : 'N/A' },
    { name: 'ROCE', score: scores.roceScore, value: roce !== null && roce !== undefined ? `${roce.toFixed(1)}%` : 'N/A' },
    { name: 'Debt Level', score: scores.debtScore, value: debtToEquity !== null && debtToEquity !== undefined ? `${debtToEquity.toFixed(2)}` : 'N/A' },
    { name: 'Revenue Growth', score: scores.growthScore, value: revenueYoy !== null && revenueYoy !== undefined ? `${revenueYoy.toFixed(1)}%` : 'N/A' },
    { name: 'Profit Growth', score: scores.profitScore, value: profitYoy !== null && profitYoy !== undefined ? `${profitYoy.toFixed(1)}%` : 'N/A' },
  ];

  return (
    <div className={cn("glass-card p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/30">
            <Gauge className="h-4 w-4 text-primary" />
          </div>
          <h4 className="font-semibold">Valuation Score</h4>
        </div>
        <div className="flex items-center gap-2">
          <Star className={cn("h-4 w-4", color)} />
          <span className={cn("text-lg font-bold", color)}>{grade}</span>
        </div>
      </div>

      {/* Score Dial */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-24 h-12">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(0, 72%, 55%)" />
                <stop offset="50%" stopColor="hsl(38, 95%, 55%)" />
                <stop offset="100%" stopColor="hsl(168, 80%, 48%)" />
              </linearGradient>
            </defs>
            <path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M 5 50 A 45 45 0 0 1 95 50"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(overallScore / 100) * 141.4} 141.4`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pt-2">
            <span className="text-xl font-bold">{overallScore}</span>
          </div>
        </div>
        <div>
          <p className={cn("font-semibold", color)}>{label}</p>
          <p className="text-xs text-muted-foreground">Based on {validScores.length} metrics</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-2">
        {metrics.map((metric) => (
          <div key={metric.name} className="flex items-center gap-2">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{metric.name}</span>
                <span className="font-medium">{metric.value}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    metric.score !== null && metric.score >= 80 && "bg-gradient-to-r from-primary to-success",
                    metric.score !== null && metric.score >= 60 && metric.score < 80 && "bg-gradient-to-r from-success to-warning",
                    metric.score !== null && metric.score >= 40 && metric.score < 60 && "bg-warning",
                    metric.score !== null && metric.score < 40 && "bg-destructive",
                    metric.score === null && "bg-muted"
                  )}
                  style={{ width: `${metric.score || 0}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
