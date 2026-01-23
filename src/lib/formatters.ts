export function formatMarketCap(value: number): string {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  }
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  return `$${value.toLocaleString()}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString();
}

export function formatPercentage(value: number | null): string {
  if (value === null) return 'N/A';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return formatDate(dateString);
}

export function getRiskLabel(score: number): { label: string; color: string } {
  if (score <= 0.35) {
    return { label: 'Low Risk', color: 'text-success' };
  }
  if (score <= 0.6) {
    return { label: 'Moderate', color: 'text-warning' };
  }
  return { label: 'High Risk', color: 'text-destructive' };
}

export function getSentimentLabel(score: number): { label: string; color: string } {
  if (score >= 0.75) {
    return { label: 'Very Bullish', color: 'text-success' };
  }
  if (score >= 0.6) {
    return { label: 'Bullish', color: 'text-primary' };
  }
  if (score >= 0.45) {
    return { label: 'Neutral', color: 'text-muted-foreground' };
  }
  return { label: 'Bearish', color: 'text-destructive' };
}
