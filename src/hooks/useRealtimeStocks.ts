import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Stock, MarketSentiment } from '@/types/stock';

export function useRealtimeStocks() {
  const queryClient = useQueryClient();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const channel = supabase
      .channel('stocks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stocks',
        },
        (payload) => {
          console.log('Stock update:', payload);
          setLastUpdate(new Date());
          
          // Invalidate related queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: ['stocks'] });
          queryClient.invalidateQueries({ queryKey: ['stock'] });
          queryClient.invalidateQueries({ queryKey: ['all-stock-data'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { lastUpdate };
}

export function useRealtimeMarketSentiment() {
  const queryClient = useQueryClient();
  const [sentiment, setSentiment] = useState<MarketSentiment | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Initial fetch
  useEffect(() => {
    const fetchSentiment = async () => {
      const { data, error } = await supabase
        .from('market_sentiment')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setSentiment(data);
      }
    };

    fetchSentiment();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('market-sentiment-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_sentiment',
        },
        (payload) => {
          console.log('Market sentiment update:', payload);
          setLastUpdate(new Date());
          
          if (payload.new) {
            setSentiment(payload.new as MarketSentiment);
          }
          
          queryClient.invalidateQueries({ queryKey: ['market-sentiment'] });
          queryClient.invalidateQueries({ queryKey: ['all-stock-data'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { sentiment, lastUpdate };
}

export function useRealtimeStock(ticker: string) {
  const [stock, setStock] = useState<Stock | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Initial fetch
  useEffect(() => {
    if (!ticker) {
      setStock(null);
      setIsLoading(false);
      return;
    }

    const fetchStock = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .ilike('ticker', ticker)
        .maybeSingle();

      if (!error) {
        setStock(data);
      }
      setIsLoading(false);
    };

    fetchStock();
  }, [ticker]);

  // Realtime subscription for specific stock
  useEffect(() => {
    if (!ticker) return;

    const channel = supabase
      .channel(`stock-${ticker}-realtime`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stocks',
          filter: `ticker=eq.${ticker.toUpperCase()}`,
        },
        (payload) => {
          console.log(`Stock ${ticker} update:`, payload);
          setLastUpdate(new Date());
          if (payload.new) {
            setStock(payload.new as Stock);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticker]);

  return { stock, isLoading, lastUpdate };
}
