import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { CompanyTable } from '@/components/CompanyTable';
import { useIndustry, useCompanies, useIncrementViews } from '@/hooks/useIndustries';
import { getIcon } from '@/lib/icons';
import { formatNumber, formatRelativeTime, getSentimentLabel } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Eye,
  Building2,
  Clock,
  MessageSquare,
  TrendingUp,
  Loader2,
} from 'lucide-react';

export default function IndustryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: industry, isLoading: industryLoading } = useIndustry(slug || '');
  const { data: companies, isLoading: companiesLoading } = useCompanies(industry?.id || '');
  const incrementViews = useIncrementViews();

  useEffect(() => {
    if (slug) {
      incrementViews.mutate(slug);
    }
  }, [slug]);

  if (industryLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!industry) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Industry not found</h1>
          <Link to="/" className="text-primary hover:underline">
            Back to Discovery
          </Link>
        </div>
      </div>
    );
  }

  const Icon = getIcon(industry.icon);
  const sentiment = getSentimentLabel(industry.sentiment_score);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Discovery
        </Link>

        {/* Industry Header */}
        <div className="glass-card p-6 mb-8 slide-up">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <Icon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{industry.name}</h1>
                  {industry.is_trending && (
                    <span className="trending-badge flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Trending
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground max-w-2xl">{industry.description}</p>
              </div>
            </div>

            <Link to={`/chat?industry=${industry.slug}`}>
              <Button className="gap-2 bg-primary hover:bg-primary/90 rounded-xl">
                <MessageSquare className="h-4 w-4" />
                Ask AI about this Industry
              </Button>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Market Sentiment
              </span>
              <span className={cn('text-lg font-semibold', sentiment.color)}>
                {sentiment.label}
              </span>
              <span className="text-xs text-muted-foreground">
                Score: {(industry.sentiment_score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                <Eye className="h-3 w-3 inline mr-1" />
                Total Views
              </span>
              <span className="text-lg font-semibold">{formatNumber(industry.views)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                <Building2 className="h-3 w-3 inline mr-1" />
                Companies
              </span>
              <span className="text-lg font-semibold">{industry.company_count || 0}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                <Clock className="h-3 w-3 inline mr-1" />
                Last Updated
              </span>
              <span className="text-lg font-semibold">{formatRelativeTime(industry.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Companies Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Companies in this Sector</h2>
          <CompanyTable companies={companies || []} isLoading={companiesLoading} />
        </div>
      </main>

      {/* Floating AI Button (Mobile) */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Link to={`/chat?industry=${industry.slug}`}>
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 pulse-glow"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
