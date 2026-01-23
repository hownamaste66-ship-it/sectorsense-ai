import { Link } from 'react-router-dom';
import { Eye, Building2, Clock } from 'lucide-react';
import type { Industry } from '@/types/industry';
import { getIcon } from '@/lib/icons';
import { formatNumber, formatRelativeTime, getSentimentLabel } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface IndustryCardProps {
  industry: Industry;
  index: number;
}

export function IndustryCard({ industry, index }: IndustryCardProps) {
  const Icon = getIcon(industry.icon);
  const sentiment = getSentimentLabel(industry.sentiment_score);

  return (
    <Link
      to={`/industry/${industry.slug}`}
      className="glass-card-hover p-5 flex flex-col gap-4 fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {industry.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn('text-xs font-medium', sentiment.color)}>
                {sentiment.label}
              </span>
              {industry.is_trending && (
                <span className="trending-badge">
                  🔥 Trending
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2">
        {industry.description}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            <span>{formatNumber(industry.views)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" />
            <span>{industry.company_count || 0} companies</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatRelativeTime(industry.updated_at)}</span>
        </div>
      </div>
    </Link>
  );
}
