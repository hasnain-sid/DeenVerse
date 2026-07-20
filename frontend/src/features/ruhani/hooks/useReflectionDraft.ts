import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Local draft persistence for in-progress reflections.
 *
 * A Ruhani reflection can take twenty minutes to write. Before this existed, that
 * work was lost to a refresh, a backgrounded mobile tab, or — most commonly — the
 * login redirect that fires when an unauthenticated user finally hits Save.
 *
 * Drafts are per-practice + per-source, stored locally only. They are never sent
 * anywhere; a draft is not a saved reflection.
 */

const DRAFT_PREFIX = 'ruhani-draft-';
const DEBOUNCE_MS = 600;
/** Drafts older than this are swept on next access, so storage can't grow forever. */
const MAX_DRAFT_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export interface DraftRecord<T> {
    value: T;
    /** Kept so a future "continue where you left off" surface can label drafts. */
    practiceType: string;
    sourceRef: string;
    sourceTitle: string;
    updatedAt: number;
}

function draftKey(practiceType: string, sourceRef: string) {
    return `${DRAFT_PREFIX}${practiceType}-${sourceRef}`;
}

/** True when the value holds nothing worth keeping. */
function isEmpty(value: unknown): boolean {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.every(isEmpty);
    if (typeof value === 'object') return Object.values(value as object).every(isEmpty);
    return false;
}

/** Removes expired drafts. Cheap, and keeps a long-lived browser tidy. */
function sweepExpiredDrafts() {
    try {
        const now = Date.now();
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (!key?.startsWith(DRAFT_PREFIX)) continue;
            try {
                const record = JSON.parse(localStorage.getItem(key) ?? '{}');
                if (!record.updatedAt || now - record.updatedAt > MAX_DRAFT_AGE_MS) {
                    localStorage.removeItem(key);
                }
            } catch {
                localStorage.removeItem(key); // unparseable — drop it
            }
        }
    } catch {
        /* storage unavailable (private mode, quota) — drafts are best-effort */
    }
}

export function readDraft<T>(practiceType: string, sourceRef: string): DraftRecord<T> | null {
    try {
        const raw = localStorage.getItem(draftKey(practiceType, sourceRef));
        if (!raw) return null;
        const record = JSON.parse(raw) as DraftRecord<T>;
        if (Date.now() - record.updatedAt > MAX_DRAFT_AGE_MS) {
            localStorage.removeItem(draftKey(practiceType, sourceRef));
            return null;
        }
        return record;
    } catch {
        return null;
    }
}

/**
 * All live drafts, newest first. Used by the hub to offer "continue where you
 * left off" — reads local storage only, so it works signed out.
 */
export function listDrafts(): DraftRecord<unknown>[] {
    const records: DraftRecord<unknown>[] = [];
    try {
        const now = Date.now();
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key?.startsWith(DRAFT_PREFIX)) continue;
            try {
                const record = JSON.parse(localStorage.getItem(key) ?? '{}') as DraftRecord<unknown>;
                if (!record.updatedAt || now - record.updatedAt > MAX_DRAFT_AGE_MS) continue;
                if (isEmpty(record.value)) continue;
                records.push(record);
            } catch {
                /* skip unparseable */
            }
        }
    } catch {
        return [];
    }
    return records.sort((a, b) => b.updatedAt - a.updatedAt);
}

interface UseReflectionDraftOptions {
    practiceType: string;
    /** Null while the user hasn't chosen a topic/ayah/trait yet. */
    sourceRef: string | null;
    sourceTitle?: string;
}

/**
 * @param value the current in-progress value (string, or an object of answers)
 * @returns `restored` — the draft found on mount, for the caller to apply to its state
 */
export function useReflectionDraft<T>(
    { practiceType, sourceRef, sourceTitle = '' }: UseReflectionDraftOptions,
    value: T
) {
    const [restored, setRestored] = useState<T | null>(null);
    const [savedAt, setSavedAt] = useState<number | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    /** Guards against the mount-time write racing the restore. */
    const hasRestoredRef = useRef(false);

    useEffect(() => {
        sweepExpiredDrafts();
    }, []);

    // Restore whenever the source changes (e.g. user picks a different topic)
    useEffect(() => {
        hasRestoredRef.current = false;
        if (!sourceRef) {
            setRestored(null);
            setSavedAt(null);
            return;
        }
        const record = readDraft<T>(practiceType, sourceRef);
        setRestored(record?.value ?? null);
        setSavedAt(record?.updatedAt ?? null);
        hasRestoredRef.current = true;
    }, [practiceType, sourceRef]);

    // Persist, debounced
    useEffect(() => {
        if (!sourceRef || !hasRestoredRef.current) return;

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            try {
                const key = draftKey(practiceType, sourceRef);
                if (isEmpty(value)) {
                    localStorage.removeItem(key);
                    setSavedAt(null);
                    return;
                }
                const record: DraftRecord<T> = {
                    value,
                    practiceType,
                    sourceRef,
                    sourceTitle,
                    updatedAt: Date.now(),
                };
                localStorage.setItem(key, JSON.stringify(record));
                setSavedAt(record.updatedAt);
            } catch {
                /* quota exceeded or storage disabled — the user still has their text on screen */
            }
        }, DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [value, practiceType, sourceRef, sourceTitle]);

    /** Call after a successful server save — the draft has served its purpose. */
    const clearDraft = useCallback(() => {
        if (!sourceRef) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        try {
            localStorage.removeItem(draftKey(practiceType, sourceRef));
        } catch {
            /* ignore */
        }
        setSavedAt(null);
    }, [practiceType, sourceRef]);

    return { restored, savedAt, clearDraft };
}
