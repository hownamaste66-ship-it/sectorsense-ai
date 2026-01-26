import { cn } from '@/lib/utils';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface RiskScoreCardProps {
  volatility: number;
  debtToEquity?: number | null;
  pe?: number | null;
  rsi?: number;
  className?: string;
}

export function RiskScoreCard({ volatility, debtToEquity, pe, rsi, className }: RiskScoreCardProps) {
  // Calculate composite risk score (0-100, higher = more risky)
  const calculateRiskScore = () => {
    let score = 0;
    let factors = 0;
    
    // Volatility risk (0-1 scale, higher = more risk)
    score += volatility * 100 * 0.3;
    factors += 0.3;
    
    // Debt/Equity risk
    if (debtToEquity !== null && debtToEquity !== undefined) {
      const debtRisk = Math.min(100, (debtToEquity / 2) * 100);
      score += debtRisk * 0.25;
      factors += 0.25;
    }
    
    // P/E risk (too high = overvalued risk)
    if (pe !== null && pe !== undefined && pe > 0) {
      const peRisk = Math.min(100, (pe / 100) * 100);
      score += peRisk * 0.25;
      factors += 0.25;
    }
    
    // RSI risk (oversold/overbought)
    if (rsi !== undefined) {
      const rsiRisk = rsi > 70 || rsi < 30 ? 70 : 30;
      score += rsiRisk * 0.2;
      factors += 0.2;
    }
    
    return Math.round(score / factors);
  };

  const riskScore = calculateRiskScore();
  
  const getRiskLevel = () => {
    if (riskScore >= 70) return { label: 'High Risk', color: 'text-destructive', icon: XCircle };
    if (riskScore >= 50) return { label: 'Moderate Risk', color: 'text-warning', icon: AlertTriangle };
    if (riskScore >= 30) return { label: 'Low Risk', color: 'text-success', icon: CheckCircle };
    return { label: 'Very Low Risk', color: 'text-primary', icon: Shield };
  };

  const { label, color, icon: Icon } = getRiskLevel();

  const riskFactors = [
    { 
      label: 'Volatility', 
      value: volatility >= 0.7 ? 'High' : volatility >= 0.4 ? 'Medium' : 'Low',
      status: volatility >= 0.7 ? 'bad' : volatility >= 0.4 ? 'warning' : 'good'
    },
    { 
      label: 'Debt Level', 
      value: debtToEquity !== null && debtToEquity !== undefined 
        ? debtToEquity >= 1.5 ? 'High' : debtToEquity >= 0.8 ? 'Medium' : 'Low'
        : 'N/A',
      status: debtToEquity !== null && debtToEquity !== undefined 
        ? debtToEquity >= 1.5 ? 'bad' : debtToEquity >= 0.8 ? 'warning' : 'good'
        : 'neutral'
    },
    { 
      label: 'Valuation', 
      value: pe !== null && pe !== undefined 
        ? pe >= 50 ? 'Expensive' : pe >= 25 ? 'Fair' : 'Cheap'
        : 'N/A',
      status: pe !== null && pe !== undefined 
        ? pe >= 50 ? 'warning' : pe >= 25 ? 'neutral' : 'good'
        : 'neutral'
    },
    { 
      label: 'RSI Signal', 
      value: rsi !== undefined 
        ? rsi >= 70 ? 'Overbought' : rsi <= 30 ? 'Oversold' : 'Neutral'
        : 'N/A',
      status: rsi !== undefined 
        ? rsi >= 70 || rsi <= 30 ? 'warning' : 'good'
        : 'neutral'
    }
  ];

  return (
    <div className={cn("glass-card p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/30">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">Risk Assessment</span>
        </div>
        <div className={cn("flex items-center gap-1.5", color)}>
          <Icon className="h-4 w-4" />
          <span className="text-sm font-semibold">{label}</span>
        </div>
      </div>

      {/* Risk Score Circle */}
      <div className="flex items-center gap-6 mb-4">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke={riskScore >= 70 ? 'hsl(0, 72%, 55%)' : riskScore >= 50 ? 'hsl(38, 95%, 55%)' : 'hsl(145, 80%, 42%)'}
              strokeWidth="3"
              strokeDasharray={`${(100 - riskScore)} 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold">{100 - riskScore}</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">Safety Score</p>
          <p className="text-xs text-muted-foreground">
            Based on volatility, debt, valuation, and momentum analysis
          </p>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="grid grid-cols-2 gap-2">
        {riskFactors.map((factor) => (
          <div key={factor.label} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
            <span className="text-xs text-muted-foreground">{factor.label}</span>
            <span className={cn(
              "text-xs font-medium",
              factor.status === 'good' && 'text-success',
              factor.status === 'warning' && 'text-warning',
              factor.status === 'bad' && 'text-destructive',
              factor.status === 'neutral' && 'text-muted-foreground'
            )}>
              {factor.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
