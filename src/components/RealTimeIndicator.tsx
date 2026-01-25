import { useState, useEffect } from 'react';
import { Radio, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealTimeIndicatorProps {
  lastUpdate: Date;
  className?: string;
}

export function RealTimeIndicator({ lastUpdate, className }: RealTimeIndicatorProps) {
  const [timeSince, setTimeSince] = useState('just now');
  const [isRecent, setIsRecent] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const diffMs = now.getTime() - lastUpdate.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);

      if (diffSec < 5) {
        setTimeSince('just now');
        setIsRecent(true);
      } else if (diffSec < 60) {
        setTimeSince(`${diffSec}s ago`);
        setIsRecent(diffSec < 30);
      } else if (diffMin < 60) {
        setTimeSince(`${diffMin}m ago`);
        setIsRecent(false);
      } else {
        setTimeSince('1h+ ago');
        setIsRecent(false);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
      isRecent 
        ? "bg-success/10 text-success border border-success/20" 
        : "bg-muted text-muted-foreground border border-border",
      className
    )}>
      <div className="relative">
        <Wifi className="h-3 w-3" />
        {isRecent && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
        )}
      </div>
      <span>Live</span>
      <span className="text-muted-foreground">• {timeSince}</span>
    </div>
  );
}
