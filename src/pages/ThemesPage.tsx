import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useThemes } from '@/hooks/useStocks';
import { getIcon } from '@/lib/icons';
import { 
  Sparkles, Loader2, TrendingUp, Building2, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ThemesPage() {
  const { data: themes, isLoading } = useThemes();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <Header />

      <main className="container py-8">
        {/* Hero */}
        <div className="text-center mb-10 slide-up">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="gradient-text-premium">Investment Themes</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover high-growth thematic opportunities across global markets
          </p>
        </div>

        {/* Themes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes?.map((theme, index) => {
            const Icon = getIcon(theme.icon);
            const isPositive = theme.performance >= 0;

            return (
              <div
                key={theme.id}
                className="premium-card p-6 fade-in group cursor-pointer hover:scale-[1.02] transition-transform"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Icon & Title */}
                <div className="flex items-start gap-4 mb-4">
                  <div 
                    className="p-3 rounded-xl"
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.color}30, ${theme.color}10)`,
                      border: `1px solid ${theme.color}50`,
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: theme.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {theme.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {theme.description}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{theme.stock_count} stocks</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5 text-sm font-medium",
                      isPositive ? 'text-success' : 'text-destructive'
                    )}>
                      <TrendingUp className={cn(
                        "h-4 w-4",
                        !isPositive && 'rotate-180'
                      )} />
                      <span>{isPositive ? '+' : ''}{theme.performance.toFixed(1)}%</span>
                    </div>
                  </div>

                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {(!themes || themes.length === 0) && (
          <div className="text-center py-20 glass-card max-w-md mx-auto">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Themes Available</h3>
            <p className="text-muted-foreground">
              Investment themes will appear here once configured.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}