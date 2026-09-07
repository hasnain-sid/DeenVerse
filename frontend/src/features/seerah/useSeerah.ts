import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { SegmentResponse, EventResponse } from './types';

/**
 * The whole segment in one request.
 *
 * Deliberately not paginated: Badr is 10 events and 38 edges, so the entire graph
 * is one small cacheable payload. Splitting it would cost an N+1 per event and
 * push graph assembly into the browser.
 */
export function useSeerahSegment(segment = 'badr') {
  return useQuery<SegmentResponse>({
    queryKey: ['seerah-segment', segment],
    queryFn: async () => {
      const { data } = await api.get(`/seerah/segments/${segment}`);
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 min — reference content, changes only on a reseed
  });
}

/** One event by slug. */
export function useSeerahEvent(slug: string | undefined) {
  return useQuery<EventResponse>({
    queryKey: ['seerah-event', slug],
    queryFn: async () => {
      const { data } = await api.get(`/seerah/events/${slug}`);
      return data;
    },
    enabled: !!slug,
    staleTime: 30 * 60 * 1000,
  });
}
