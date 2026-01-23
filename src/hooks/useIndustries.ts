import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Industry, Company, FilterType } from '@/types/industry';

export function useIndustries(filter: FilterType = 'all', searchQuery: string = '') {
  return useQuery({
    queryKey: ['industries', filter, searchQuery],
    queryFn: async (): Promise<Industry[]> => {
      let query = supabase
        .from('industries')
        .select('*, companies:companies(count)')
        .order('views', { ascending: false });

      // Apply filters
      if (filter === 'trending') {
        query = query.eq('is_trending', true);
      } else if (filter === 'high-growth') {
        query = query.gte('sentiment_score', 0.7);
      } else if (filter === 'low-risk') {
        query = query.lte('sentiment_score', 0.5);
      } else if (filter === 'tech') {
        query = query.in('slug', ['technology', 'artificial-intelligence', 'communication-services']);
      } else if (filter === 'non-tech') {
        query = query.not('slug', 'in', '(technology,artificial-intelligence,communication-services)');
      }

      // Apply search
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((industry: any) => ({
        ...industry,
        company_count: industry.companies?.[0]?.count || 0,
      }));
    },
  });
}

export function useIndustry(slug: string) {
  return useQuery({
    queryKey: ['industry', slug],
    queryFn: async (): Promise<Industry | null> => {
      const { data, error } = await supabase
        .from('industries')
        .select('*, companies:companies(count)')
        .eq('slug', slug)
        .single();

      if (error) throw error;

      return data ? {
        ...data,
        company_count: data.companies?.[0]?.count || 0,
      } : null;
    },
    enabled: !!slug,
  });
}

export function useCompanies(industryId: string) {
  return useQuery({
    queryKey: ['companies', industryId],
    queryFn: async (): Promise<Company[]> => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('industry_id', industryId)
        .order('market_cap', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!industryId,
  });
}

export function useIncrementViews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      // First get the current views
      const { data: industry, error: fetchError } = await supabase
        .from('industries')
        .select('views')
        .eq('slug', slug)
        .single();

      if (fetchError) throw fetchError;

      // Then increment
      const { error } = await supabase
        .from('industries')
        .update({ views: (industry?.views || 0) + 1 })
        .eq('slug', slug);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['industries'] });
      queryClient.invalidateQueries({ queryKey: ['industry'] });
    },
  });
}

export function useAllData() {
  return useQuery({
    queryKey: ['all-data'],
    queryFn: async () => {
      const [industriesRes, companiesRes] = await Promise.all([
        supabase.from('industries').select('*'),
        supabase.from('companies').select('*'),
      ]);

      if (industriesRes.error) throw industriesRes.error;
      if (companiesRes.error) throw companiesRes.error;

      return {
        industries: industriesRes.data || [],
        companies: companiesRes.data || [],
      };
    },
  });
}
