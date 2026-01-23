import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { FilterTabs } from '@/components/FilterTabs';
import { IndustryCard } from '@/components/IndustryCard';
import { useIndustries } from '@/hooks/useIndustries';
import type { FilterType } from '@/types/industry';
import { Loader2, TrendingUp, Building2, Eye } from 'lucide-react';

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const { data: industries, isLoading, error } = useIndustries(activeFilter, searchQuery);

  const stats = useMemo(() => {
    if (!industries) return { total: 0, trending: 0, totalViews: 0 };
    return {
      total: industries.length,
      trending: industries.filter((i) => i.is_trending).length,
      totalViews: industries.reduce((acc, i) => acc + i.views, 0),
    };
  }, [industries]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Hero Section */}
        <div className="text-center mb-10 slide-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Discover Market Sectors</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-powered industry intelligence. Explore sectors, analyze trends, and make informed decisions.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Building2 className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">Sectors</span>
            </div>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">Trending</span>
            </div>
            <span className="stat-value">{stats.trending}</span>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Eye className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wide">Total Views</span>
            </div>
            <span className="stat-value">{stats.totalViews.toLocaleString()}</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-8">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* Industries Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive">Failed to load industries. Please try again.</p>
          </div>
        ) : industries && industries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industries.map((industry, index) => (
              <IndustryCard key={industry.id} industry={industry} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No industries found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
}
