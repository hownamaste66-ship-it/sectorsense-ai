import { Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';
import { useLiveStockData, useUpdateCountdown } from '@/hooks/useLiveStockData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LiveDataBadgeProps {
  showDetails?: boolean;
  className?: string;
}

export function LiveDataBadge({ showDetails = true, className }: LiveDataBadgeProps) {
  const { isLive, lastUpdate, nextUpdate, error, isRefreshing, refresh } = useLiveStockData(60000);
  const countdown = useUpdateCountdown(nextUpdate);

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        {/* Live Status Badge */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                isLive 
                  ? "bg-success/20 text-success border border-success/30" 
                  : "bg-destructive/20 text-destructive border border-destructive/30"
              )}
            >
              {isLive ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  <span>LIVE</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span>OFFLINE</span>
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="text-xs space-y-1">
              <p>Status: {isLive ? 'Connected to live data' : 'Disconnected'}</p>
              <p>Last update: {formatTime(lastUpdate)}</p>
              {error && <p className="text-destructive">Error: {error}</p>}
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Countdown & Refresh */}
        {showDetails && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatCountdown(countdown)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Next update in {formatCountdown(countdown)}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={refresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn(
                    "h-3.5 w-3.5",
                    isRefreshing && "animate-spin"
                  )} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Refresh now</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}

        {/* Powered By Badge */}
        <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">
          <Wifi className="h-2.5 w-2.5" />
          <span>Powered by Yahoo Finance</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
