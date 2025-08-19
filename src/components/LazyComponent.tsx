import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components
export const LazyAgendamentos = lazy(() => 
  import('./AgendamentosTable').then(module => ({ 
    default: module.AgendamentosTable 
  }))
);

export const LazyKanbanBoard = lazy(() => 
  import('./KanbanBoard').then(module => ({ 
    default: module.KanbanBoard 
  }))
);

export const LazyWhatsAppCRM = lazy(() => 
  import('./whatsapp/WhatsAppCRM').then(module => ({ 
    default: module.WhatsAppCRM 
  }))
);

export const LazyAdvancedMetrics = lazy(() => 
  import('./AIInsightsDashboard').then(module => ({ 
    default: module.AIInsightsDashboard 
  }))
);

// Loading components
export const TableSkeleton = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
);

export const KanbanSkeleton = () => (
  <div className="flex gap-4 overflow-x-auto">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex-shrink-0 w-80">
        <Skeleton className="h-8 w-32 mb-2" />
        <div className="space-y-2">
          {[...Array(3)].map((_, j) => (
            <Skeleton key={j} className="h-24 w-full" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const MetricsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <Skeleton key={i} className="h-24 w-full" />
    ))}
  </div>
);

// Hook for component visibility detection
export const useComponentVisibility = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

// Higher-order component for lazy loading
export const withLazyLoad = (
  Component: React.ComponentType,
  LoadingComponent?: React.ComponentType
) => {
  return function LazyLoadedComponent(props: any) {
    const { ref, isVisible } = useComponentVisibility();
    
    return (
      <div ref={ref}>
        {isVisible ? (
          <Suspense fallback={LoadingComponent ? <LoadingComponent /> : <div>Loading...</div>}>
            <Component {...props} />
          </Suspense>
        ) : (
          LoadingComponent ? <LoadingComponent /> : <div>Loading...</div>
        )}
      </div>
    );
  };
};

// Progressive enhancement hook
export const useProgressiveEnhancement = () => {
  const [isEnhanced, setIsEnhanced] = React.useState(false);

  React.useEffect(() => {
    // Enable progressive enhancement after initial load
    const timer = setTimeout(() => {
      setIsEnhanced(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return isEnhanced;
};