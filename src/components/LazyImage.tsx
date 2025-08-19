import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  blur?: boolean;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder,
  blur = true,
  loading = 'lazy',
  onLoad,
  onError,
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    
    const handleLoad = () => {
      setImageSrc(src);
      setIsLoading(false);
      setError(false);
      onLoad?.();
    };

    const handleError = () => {
      setIsLoading(false);
      setError(true);
      onError?.();
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    
    if (loading === 'eager') {
      img.src = src;
    } else {
      // Use Intersection Observer for lazy loading
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            img.src = src;
            observerRef.current?.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      if (imageRef.current) {
        observerRef.current.observe(imageRef.current);
      }
    }

    return () => {
      observerRef.current?.disconnect();
      img.onload = null;
      img.onerror = null;
    };
  }, [src, loading, onLoad, onError]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}
           style={{ width, height }}>
        <div className="text-gray-400 text-sm">{alt.charAt(0).toUpperCase()}</div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      {isLoading && (
        <Skeleton 
          className={`absolute inset-0 ${className}`}
          style={{ width, height }}
        />
      )}
      <img
        ref={imageRef}
        src={imageSrc}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${blur ? 'filter blur-sm' : ''}`}
        style={{ width, height }}
        loading={loading}
      />
    </div>
  );
};

// Image optimization utilities
export const getOptimizedImageUrl = (
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg';
  } = {}
): string => {
  // If using external image service (like Cloudinary)
  if (src.includes('cloudinary.com')) {
    const params = new URLSearchParams();
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    
    return `${src}?${params.toString()}`;
  }

  // For local images, return as-is (Vite handles optimization)
  return src;
};

// Hook for preloading images
export const useImagePreloader = (imageUrls: string[]) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    setLoadedCount(0);
    setAllLoaded(false);

    if (imageUrls.length === 0) {
      setAllLoaded(true);
      return;
    }

    const promises = imageUrls.map(
      (url) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = url;
        })
    );

    Promise.allSettled(promises).then(() => {
      setAllLoaded(true);
    });
  }, [imageUrls]);

  return { allLoaded, loadedCount, total: imageUrls.length };
};