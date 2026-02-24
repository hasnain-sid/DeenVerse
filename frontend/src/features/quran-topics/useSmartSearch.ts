import { useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import type { TopicItem, MoodItem } from './types';

/** A single smart-search result — either a topic or a mood match. */
export interface SmartSearchResult {
    type: 'topic' | 'mood';
    /** Relevance score from Fuse.js (lower = better match, 0 = perfect). */
    score: number;
    topic?: TopicItem;
    mood?: MoodItem;
}

/** Fuse.js options tuned for topic/mood matching. */
const TOPIC_FUSE_OPTIONS: ConstructorParameters<typeof Fuse<TopicItem>>[1] = {
    keys: [
        { name: 'name', weight: 0.4 },
        { name: 'nameArabic', weight: 0.2 },
        { name: 'description', weight: 0.25 },
        { name: 'category', weight: 0.15 },
    ],
    threshold: 0.4,     // Allow fuzzy matches (0 = exact, 1 = anything)
    includeScore: true,
    minMatchCharLength: 2,
};

const MOOD_FUSE_OPTIONS: ConstructorParameters<typeof Fuse<MoodItem>>[1] = {
    keys: [
        { name: 'name', weight: 0.5 },
        { name: 'description', weight: 0.3 },
        { name: 'relatedTopics', weight: 0.2 },
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
};

/**
 * Build Fuse.js indexes from loaded topic/mood data and
 * perform client-side fuzzy search across both collections.
 *
 * Returns a stable `search(query)` function and matched results.
 */
export function useSmartSearch(
    topics: TopicItem[] | undefined,
    moods: MoodItem[] | undefined,
) {
    const topicFuse = useMemo(
        () => (topics ? new Fuse(topics, TOPIC_FUSE_OPTIONS) : null),
        [topics],
    );

    const moodFuse = useMemo(
        () => (moods ? new Fuse(moods, MOOD_FUSE_OPTIONS) : null),
        [moods],
    );

    /**
     * Search both topics and moods, returning a merged, score-sorted list.
     * Returns empty array for queries shorter than 2 characters.
     */
    const search = useCallback((query: string): SmartSearchResult[] => {
        const trimmed = query.trim();
        if (trimmed.length < 2) return [];

        const topicResults: SmartSearchResult[] = (topicFuse?.search(trimmed) ?? []).map((r) => ({
            type: 'topic' as const,
            score: r.score ?? 1,
            topic: r.item,
        }));

        const moodResults: SmartSearchResult[] = (moodFuse?.search(trimmed) ?? []).map((r) => ({
            type: 'mood' as const,
            score: r.score ?? 1,
            mood: r.item,
        }));

        // Merge and sort by score (lower = better match)
        return [...topicResults, ...moodResults].sort((a, b) => a.score - b.score);
    }, [topicFuse, moodFuse]);

    return { search };
}
