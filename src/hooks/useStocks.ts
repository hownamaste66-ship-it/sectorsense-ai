import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Stock, Theme, MarketSentiment, ScannerFilter } from '@/types/stock';

export function useStocks() {
  return useQuery({
    queryKey: ['stocks'],
    queryFn: async (): Promise<Stock[]> => {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .order('market_cap', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useTrendingStocks() {
  return useQuery({
    queryKey: ['stocks', 'trending'],
    queryFn: async (): Promise<Stock[]> => {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .eq('is_trending', true)
        .order('price_change', { ascending: false })
        .limit(8);

      if (error) throw error;
      return data || [];
    },
  });
}

export function useStock(ticker: string) {
  return useQuery({
    queryKey: ['stock', ticker],
    queryFn: async (): Promise<Stock | null> => {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .ilike('ticker', ticker)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!ticker,
  });
}

export function useStocksByIndustry(industryId: string) {
  return useQuery({
    queryKey: ['stocks', 'industry', industryId],
    queryFn: async (): Promise<Stock[]> => {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .eq('industry_id', industryId)
        .order('market_cap', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!industryId,
  });
}

export function useScannerStocks(filter: ScannerFilter) {
  return useQuery({
    queryKey: ['stocks', 'scanner', filter],
    queryFn: async (): Promise<Stock[]> => {
      let query = supabase.from('stocks').select('*');

      switch (filter) {
        case 'high-growth':
          query = query.gte('revenue_yoy', 15).order('revenue_yoy', { ascending: false });
          break;
        case 'low-debt':
          query = query.lte('debt_to_equity', 0.5).order('debt_to_equity', { ascending: true });
          break;
        case 'breakout':
          query = query.gte('rsi', 60).lte('rsi', 75).order('volume', { ascending: false });
          break;
        case 'oversold':
          query = query.lte('rsi', 30).order('rsi', { ascending: true });
          break;
        case 'overbought':
          query = query.gte('rsi', 70).order('rsi', { ascending: false });
          break;
        case 'volume-surge':
          query = query.order('volume', { ascending: false });
          break;
        case 'strong-momentum':
          query = query.gte('sentiment', 0.7).order('sentiment', { ascending: false });
          break;
        case 'undervalued':
          query = query.lte('pe', 20).order('pe', { ascending: true });
          break;
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useThemes() {
  return useQuery({
    queryKey: ['themes'],
    queryFn: async (): Promise<Theme[]> => {
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('performance', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useMarketSentiment() {
  return useQuery({
    queryKey: ['market-sentiment'],
    queryFn: async (): Promise<MarketSentiment | null> => {
      const { data, error } = await supabase
        .from('market_sentiment')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}

export function useAllStockData() {
  return useQuery({
    queryKey: ['all-stock-data'],
    queryFn: async () => {
      const [stocksRes, themesRes, sentimentRes] = await Promise.all([
        supabase.from('stocks').select('*'),
        supabase.from('themes').select('*'),
        supabase.from('market_sentiment').select('*').order('date', { ascending: false }).limit(1),
      ]);

      if (stocksRes.error) throw stocksRes.error;
      if (themesRes.error) throw themesRes.error;
      if (sentimentRes.error) throw sentimentRes.error;

      return {
        stocks: stocksRes.data || [],
        themes: themesRes.data || [],
        sentiment: sentimentRes.data?.[0] || null,
      };
    },
  });
}