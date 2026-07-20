interface DraftStatusProps {
    /** Timestamp of the last local draft write, or null when nothing is stored. */
    savedAt: number | null;
    isAuthenticated: boolean;
}

/**
 * A quiet reassurance that unsaved writing is not at risk.
 *
 * Signed-out users get told up front that their work is kept locally — the old
 * behaviour only revealed the auth requirement at the moment of saving, after
 * the writing was already done.
 */
export function DraftStatus({ savedAt, isAuthenticated }: DraftStatusProps) {
    if (!isAuthenticated) {
        return (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xs">
                You're not signed in. Your writing is kept on this device — sign in to keep it in your journal.
            </p>
        );
    }

    if (!savedAt) return <span />;

    return (
        <p className="text-xs text-zinc-500 dark:text-zinc-500" aria-live="polite">
            Draft saved
        </p>
    );
}
