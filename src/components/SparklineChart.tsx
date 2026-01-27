import { cn } from '@/lib/utils';

interface SparklineChartProps {
  data: number[];
  color?: 'primary' | 'success' | 'destructive';
  className?: string;
  height?: number;
}

export function SparklineChart({ data, color = 'primary', className, height }: SparklineChartProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const getColor = () => {
    switch (color) {
      case 'success':
        return 'bg-success';
      case 'destructive':
        return 'bg-destructive';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className={cn("sparkline", className)}>
      {data.map((value, index) => {
        const height = ((value - min) / range) * 100;
        return (
          <div
            key={index}
            className={cn("sparkline-bar", getColor())}
            style={{ 
              height: `${Math.max(10, height)}%`,
              opacity: 0.4 + (index / data.length) * 0.6
            }}
          />
        );
      })}
    </div>
  );
}