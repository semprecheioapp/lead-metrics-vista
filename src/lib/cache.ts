import { QueryClient } from '@tanstack/react-query';

// Cache configuration
export const CACHE_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  REFETCH_ON_WINDOW_FOCUS: false,
  REFETCH_ON_RECONNECT: true,
};

// Optimized query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_CONFIG.STALE_TIME,
      gcTime: CACHE_CONFIG.CACHE_TIME,
      refetchOnWindowFocus: CACHE_CONFIG.REFETCH_ON_WINDOW_FOCUS,
      refetchOnReconnect: CACHE_CONFIG.REFETCH_ON_RECONNECT,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Cache keys factory
export const cacheKeys = {
  leads: {
    all: (empresaId: string) => ['leads', 'all', empresaId] as const,
    recent: (empresaId: string, limit: number) => ['leads', 'recent', empresaId, limit] as const,
    count: (empresaId: string, period: string) => ['leads', 'count', empresaId, period] as const,
    kanban: (pipelineId: number) => ['kanban-leads', pipelineId] as const,
  },
  whatsapp: {
    leads: (empresaId: string) => ['whatsapp', 'leads', empresaId] as const,
    chats: (empresaId: string) => ['whatsapp', 'chats', empresaId] as const,
    messages: (sessionId: string) => ['whatsapp', 'messages', sessionId] as const,
  },
  metrics: {
    advanced: (empresaId: string) => ['metrics', 'advanced', empresaId] as const,
    stats: (empresaId: string) => ['metrics', 'stats', empresaId] as const,
  },
};

// Utility to invalidate cache
export const invalidateCache = (keys: readonly unknown[]) => {
  return queryClient.invalidateQueries({ queryKey: keys });
};

// Prefetch utility
export const prefetchData = async <T>(
  key: readonly unknown[],
  fetcher: () => Promise<T>
) => {
  await queryClient.prefetchQuery({
    queryKey: key,
    queryFn: fetcher,
    staleTime: CACHE_CONFIG.STALE_TIME,
  });
};