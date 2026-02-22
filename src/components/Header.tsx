import { Link, useLocation } from 'react-router-dom';
import { Brain, LayoutGrid, MessageSquare, TrendingUp, BarChart3, Scan, Activity, Sparkles, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();

  const navItems = [
    { href: '/', label: 'Discovery', icon: LayoutGrid },
    { href: '/analyze', label: 'Analyzer', icon: BarChart3 },
    { href: '/predict', label: 'Predictor', icon: TrendingUp },
    { href: '/scanner', label: 'Scanner', icon: Scan },
    { href: '/sentiment', label: 'Sentiment', icon: Activity },
    { href: '/themes', label: 'Themes', icon: Sparkles },
    { href: '/pricing', label: 'Premium', icon: Crown },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Brain className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 blur-lg bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold gradient-text">SectorSense</span>
            <span className="text-[10px] text-muted-foreground -mt-1">AI Market Intelligence</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link to="/chat" className="btn-ai-glow flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Ask AI</span>
        </Link>
      </div>
    </header>
  );
}
