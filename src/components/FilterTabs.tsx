import type { FilterType } from '@/types/industry';
import { cn } from '@/lib/utils';
import { TrendingUp, Sparkles, Shield, Cpu, Package } from 'lucide-react';

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { value: FilterType; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All Sectors', icon: Package },
  { value: 'trending', label: 'Trending', icon: TrendingUp },
  { value: 'high-growth', label: 'High Growth', icon: Sparkles },
  { value: 'low-risk', label: 'Low Risk', icon: Shield },
  { value: 'tech', label: 'Tech', icon: Cpu },
  { value: 'non-tech', label: 'Non-Tech', icon: Package },
];

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.value;

        return (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              isActive
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
