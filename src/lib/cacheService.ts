import { QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

class CacheService {
  private memoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  // Memory cache with TTL
  set(key: string, data: any, ttlMinutes = 5) {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    });
  }

  get(key: string): any | null {
    const cached = this.memoryCache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(key?: string) {
    if (key) {
      this.memoryCache.delete(key);
    } else {
      this.memoryCache.clear();
    }
  }

  // Supabase subscription cache invalidation
  subscribeToTable(table: string, filter?: string) {
    const channel = supabase
      .channel(`cache-${table}-${Date.now()}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
        filter
      }, () => {
        // Invalidate related cache entries
        this.invalidateTableCache(table);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  private invalidateTableCache(table: string) {
    // Invalidate React Query cache for related keys
    this.queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey as string[];
        return queryKey.some(key => typeof key === 'string' && key.includes(table));
      }
    });

    // Clear memory cache for this table
    for (const key of this.memoryCache.keys()) {
      if (key.includes(table)) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Prefetch common data
  async prefetchCompanyData(empresaId: string) {
    if (!empresaId) return;

    // Prefetch recent leads
    await this.queryClient.prefetchQuery({
      queryKey: ['leads', 'recent', empresaId],
      queryFn: async () => {
        const { data } = await supabase
          .from('novos_leads')
          .select('id,name,number,etapa,created_at')
          .eq('empresa_id', parseInt(empresaId))
          .order('created_at', { ascending: false })
          .limit(10);
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });

    // Prefetch basic metrics
    await this.queryClient.prefetchQuery({
      queryKey: ['metrics', 'basic', empresaId],
      queryFn: async () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { count } = await supabase
          .from('novos_leads')
          .select('id', { count: 'exact', head: true })
          .eq('empresa_id', parseInt(empresaId))
          .gte('created_at', sevenDaysAgo.toISOString());
        
        return { recentLeads: count || 0 };
      },
      staleTime: 10 * 60 * 1000,
    });
  }

  // Cache warming for critical paths
  warmCacheForRoute(route: string, empresaId: string) {
    switch (route) {
      case '/leads':
        this.prefetchCompanyData(empresaId);
        this.prefetchLeadsMetrics(empresaId);
        break;
      case '/oportunidades':
        this.prefetchKanbanData(empresaId);
        break;
      case '/whatsapp':
        this.prefetchWhatsAppData(empresaId);
        break;
      case '/metricas':
        this.prefetchMetricsData(empresaId);
        break;
    }
  }

  // Prefetch específicos para performance
  private async prefetchLeadsMetrics(empresaId: string) {
    await this.queryClient.prefetchQuery({
      queryKey: ['leads', 'metrics', empresaId],
      queryFn: async () => {
        const today = new Date().toISOString().split('T')[0];
        const { count } = await supabase
          .from('novos_leads')
          .select('id', { count: 'exact', head: true })
          .eq('empresa_id', parseInt(empresaId))
          .gte('created_at', today);
        return { todayCount: count || 0 };
      },
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  }

  private async prefetchKanbanData(empresaId: string) {
    await this.queryClient.prefetchQuery({
      queryKey: ['pipelines'],
      queryFn: async () => {
        const { data } = await supabase.from('pipelines').select('*');
        return data;
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  }

  private async prefetchWhatsAppData(empresaId: string) {
    await this.queryClient.prefetchQuery({
      queryKey: ['whatsapp', 'leads', empresaId],
      queryFn: async () => {
        const { data } = await supabase
          .from('memoria_ai')
          .select('session_id, message, created_at')
          .eq('empresa_id', parseInt(empresaId))
          .order('created_at', { ascending: false })
          .limit(50);
        return data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }

  private async prefetchMetricsData(empresaId: string) {
    await this.queryClient.prefetchQuery({
      queryKey: ['metrics', 'overview', empresaId],
      queryFn: async () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count } = await supabase
          .from('novos_leads')
          .select('id', { count: 'exact', head: true })
          .eq('empresa_id', parseInt(empresaId))
          .gte('created_at', thirtyDaysAgo.toISOString());
        
        return { monthlyLeads: count || 0 };
      },
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  }
}

// Singleton instance
import { queryClient } from './cache';
export const cacheService = new CacheService(queryClient);