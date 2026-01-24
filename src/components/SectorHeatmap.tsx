import { cn } from '@/lib/utils';
import { useIndustries } from '@/hooks/useIndustries';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

interface HeatmapCell {
  name: string;
  slug: string;
  value: number;
}

export function SectorHeatmap() {
  const { data: industries, isLoading } = useIndustries('all', '');

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!industries || industries.length === 0) {
    return <p className="text-muted-foreground">No sector data available</p>;
  }

  // Convert sentiment scores to heatmap values (-50 to +50)
  const heatmapData: HeatmapCell[] = industries.map(ind => ({
    name: ind.name,
    slug: ind.slug,
    value: ((ind.sentiment_score || 0.5) - 0.5) * 100, // Convert 0-1 to -50 to +50
  }));

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
      {heatmapData.map((cell) => {
        const intensity = Math.abs(cell.value) / 50; // 0-1 intensity
        const isPositive = cell.value >= 0;

        return (
          <Link
            key={cell.slug}
            to={`/industry/${cell.slug}`}
            className={cn(
              "p-3 rounded-lg text-center transition-all duration-300 hover:scale-105",
              isPositive ? 'heatmap-positive' : cell.value < -15 ? 'heatmap-negative' : 'heatmap-neutral'
            )}
            style={{
              opacity: 0.5 + intensity * 0.5,
            }}
          >
            <p className="text-xs font-medium text-foreground truncate">{cell.name}</p>
            <p className={cn(
              "text-sm font-bold mt-1",
              isPositive ? 'text-success' : cell.value < -15 ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {isPositive ? '+' : ''}{cell.value.toFixed(1)}%
            </p>
          </Link>
        );
      })}
    </div>
  );
}