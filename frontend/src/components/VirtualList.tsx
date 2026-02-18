import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Estimated height of each row in pixels */
  estimateSize?: number;
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Overscan — number of items to render outside the visible area */
  overscan?: number;
  /** Height of the scrollable container (CSS value or number in px) */
  height?: string | number;
  /** Optional className for the scroll container */
  className?: string;
  /** Called when scroll reaches near the bottom — use for infinite scroll */
  onEndReached?: () => void;
  /** Distance from bottom (px) to trigger onEndReached */
  endReachedThreshold?: number;
  /** Key extractor */
  getItemKey?: (index: number) => string | number;
}

/**
 * VirtualList — renders only the visible items in a long list.
 *
 * Wraps @tanstack/react-virtual for DOM recycling, dramatically reducing
 * memory and rendering cost for feeds, search results, follower lists, etc.
 */
export function VirtualList<T>({
  items,
  estimateSize = 120,
  renderItem,
  overscan = 5,
  height = '100%',
  className = '',
  onEndReached,
  endReachedThreshold = 300,
  getItemKey,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    getItemKey,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Infinite scroll detection
  React.useEffect(() => {
    if (!onEndReached || virtualItems.length === 0) return;

    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    const scrollEl = parentRef.current;
    if (!scrollEl) return;

    const distanceFromBottom =
      virtualizer.getTotalSize() - (scrollEl.scrollTop + scrollEl.clientHeight);

    if (distanceFromBottom < endReachedThreshold) {
      onEndReached();
    }
  }, [virtualItems, onEndReached, endReachedThreshold, virtualizer]);

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height, contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
