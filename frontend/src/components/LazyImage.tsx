import React, { useState, useRef, useEffect, useCallback } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Fallback displayed while loading (e.g. blurhash placeholder) */
  placeholder?: React.ReactNode;
  /** Threshold for IntersectionObserver (0–1). Default 0.1 */
  threshold?: number;
  /** Root margin for earlier/later loading. Default "200px" */
  rootMargin?: string;
}

/**
 * LazyImage – only loads the `src` when the element scrolls into viewport.
 *
 * Uses IntersectionObserver (no layout shift thanks to width/height or aspect-ratio).
 * Adds a fade-in transition once loaded.
 */
export function LazyImage({
  src,
  alt = '',
  placeholder,
  threshold = 0.1,
  rootMargin = '200px',
  className = '',
  style,
  ...rest
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = imgRef.current;
    if (!node || !('IntersectionObserver' in window)) {
      // Fallback: just load immediately
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(node);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const handleLoad = useCallback(() => setIsLoaded(true), []);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} style={style}>
      {/* Placeholder */}
      {!isLoaded && (
        placeholder || (
          <div className="absolute inset-0 bg-muted animate-pulse rounded-inherit" />
        )
      )}

      {/* Real image — only set src once in viewport */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...rest}
        />
      )}
    </div>
  );
}
