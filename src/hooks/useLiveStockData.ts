import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LiveDataStatus {
  isLive: boolean;
  lastUpdate: Date | null;
  nextUpdate: Date | null;
  error: string | null;
  isRefreshing: boolean;
}

export function useLiveStockData(refreshInterval = 60000) { // Default: 1 minute
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<LiveDataStatus>({
    isLive: false,
    lastUpdate: null,
    nextUpdate: null,
    error: null,
    isRefreshing: false,
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLiveData = useCallback(async () => {
    setStatus(prev => ({ ...prev, isRefreshing: true, error: null }));
    
    try {
      console.log('Fetching live stock data...');
      
      const { data, error } = await supabase.functions.invoke('fetch-stock-prices', {
        method: 'POST',
      });

      if (error) {
        console.error('Live data fetch error:', error);
        setStatus(prev => ({
          ...prev,
          isLive: false,
          error: error.message,
          isRefreshing: false,
        }));
        return;
      }

      console.log('Live data response:', data);

      // Invalidate all stock-related queries to trigger UI refresh
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['all-stock-data'] });
      queryClient.invalidateQueries({ queryKey: ['market-sentiment'] });

      const now = new Date();
      setStatus({
        isLive: true,
        lastUpdate: now,
        nextUpdate: new Date(now.getTime() + refreshInterval),
        error: null,
        isRefreshing: false,
      });

    } catch (err) {
      console.error('Live data error:', err);
      setStatus(prev => ({
        ...prev,
        isLive: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        isRefreshing: false,
      }));
    }
  }, [queryClient, refreshInterval]);

  const manualRefresh = useCallback(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  useEffect(() => {
    // Initial fetch
    fetchLiveData();

    // Set up interval for periodic updates
    intervalRef.current = setInterval(fetchLiveData, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchLiveData, refreshInterval]);

  return {
    ...status,
    refresh: manualRefresh,
  };
}

// Hook for countdown timer to next update
export function useUpdateCountdown(nextUpdate: Date | null) {
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    if (!nextUpdate) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((nextUpdate.getTime() - now.getTime()) / 1000));
      setCountdown(diff);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextUpdate]);

  return countdown;
}
