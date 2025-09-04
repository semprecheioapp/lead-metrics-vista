import { useEffect } from "react";

interface MobileOptimizationsProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente que aplica otimizações específicas para mobile
 * - Previne zoom em inputs
 * - Otimiza scrolling
 * - Melhora performance de touch
 */
export function MobileOptimizations({ children, className }: MobileOptimizationsProps) {
  useEffect(() => {
    // Prevenir zoom em inputs no iOS
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (input instanceof HTMLElement) {
        input.style.fontSize = '16px'; // Previne zoom no iOS
      }
    });

    // Otimizar scrolling no mobile
    (document.body.style as any).webkitOverflowScrolling = 'touch';
    
    // Prevenir pull-to-refresh no Chrome mobile
    document.body.style.overscrollBehavior = 'none';
    
    return () => {
      (document.body.style as any).webkitOverflowScrolling = '';
      document.body.style.overscrollBehavior = '';
    };
  }, []);

  return (
    <div 
      className={className}
      style={{
        // Melhora performance de animações
        willChange: 'transform',
        // Otimiza rendering
        contain: 'layout style paint',
        // Suaviza scrolling
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {children}
    </div>
  );
}

/**
 * Hook para detectar gestos de swipe
 */
export function useSwipeGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold = 50
) {
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;
      
      // Verificar se é um swipe rápido e horizontal
      if (deltaTime < 300 && Math.abs(deltaX) > threshold && Math.abs(deltaY) < Math.abs(deltaX) * 0.5) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold]);
}

/**
 * Hook para otimizar renderização de listas longas
 */
export function useVirtualization(itemCount: number, itemHeight: number, containerHeight: number) {
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // Buffer
  
  return {
    visibleCount,
    getVisibleRange: (scrollTop: number) => {
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(start + visibleCount, itemCount);
      return { start, end };
    }
  };
}