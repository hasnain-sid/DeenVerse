import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Moon, Heart, Compass, Download, Trash2, Pencil, X, Search } from 'lucide-react';
import {
    useRuhaniJournal,
    useDeletePractice,
    useUpdatePractice,
    useExportJournal,
} from './api/useRuhani';
import type { SpiritualPracticeEntry } from './types';

const PAGE_SIZE = 20;

const FILTERS = [
    { value: undefined, label: 'All' },
    { value: 'tafakkur', label: 'Tafakkur' },
    { value: 'tadabbur', label: 'Tadabbur' },
    { value: 'tazkia', label: 'Tazkia' },
] as const;

export function RuhaniJournalPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
    const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    /** Mirrors the entry being edited: one answer per original prompt, plus the free note. */
    const [editAnswers, setEditAnswers] = useState<string[]>([]);
    const [editText, setEditText] = useState('');

    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');

    // Debounced so each keystroke isn't a request
    useEffect(() => {
        const t = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 350);
        return () => clearTimeout(t);
    }, [searchInput]);

    const { data, isLoading, isError } = useRuhaniJournal(
        page, PAGE_SIZE, typeFilter, true, search || undefined
    );
    const { mutate: deletePractice, isPending: isDeleting } = useDeletePractice();
    const { mutate: updatePractice, isPending: isUpdating } = useUpdatePractice();
    const { mutate: exportJournal, isPending: isExporting } = useExportJournal();

    const entries: SpiritualPracticeEntry[] = data?.practices || [];

    const getIcon = (type: string) => {
        switch (type) {
            case 'tafakkur': return <Moon className="w-4 h-4" />;
            case 'tazkia': return <Heart className="w-4 h-4" />;
            case 'tadabbur': return <Compass className="w-4 h-4" />;
            default: return <Moon className="w-4 h-4" />;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleFilterChange = (value: string | undefined) => {
        setTypeFilter(value);
        setPage(1);
        setConfirmingDelete(null);
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        deletePractice(id, {
            onSuccess: () => {
                setConfirmingDelete(null);
                // Stepping back avoids landing on a page that no longer exists
                if (entries.length === 1 && page > 1) setPage((p) => p - 1);
            },
        });
    };

    const startEditing = (entry: SpiritualPracticeEntry) => {
        setEditingId(entry._id);
        setEditAnswers((entry.guidedAnswers ?? []).map((qa) => qa.answer));
        setEditText(entry.reflectionText ?? '');
        setConfirmingDelete(null);
    };

    const handleUpdate = (entry: SpiritualPracticeEntry) => {
        // Prompts are preserved from the original entry — only the answers are the user's to revise
        const guidedAnswers = (entry.guidedAnswers ?? [])
            .map((qa, i) => ({ prompt: qa.prompt, answer: (editAnswers[i] ?? '').trim() }))
            .filter((qa) => qa.answer.length > 0);

        updatePractice(
            {
                id: entry._id,
                payload: {
                    guidedAnswers,
                    reflectionText: editText.trim(),
                },
            },
            { onSuccess: () => setEditingId(null) }
        );
    };

    const editHasContent = (entry: SpiritualPracticeEntry) =>
        editAnswers.some((a) => a.trim()) || editText.trim().length > 0 ||
        // An entry that never had structured answers is edited via the note alone
        (entry.guidedAnswers ?? []).length === 0;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center transition-colors duration-500">
                <div role="status" aria-live="polite">
                    <div className="h-6 w-6 rounded-full border-2 border-zinc-500 dark:border-zinc-500 border-t-transparent animate-spin" />
                    <span className="sr-only">Loading your journal…</span>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center transition-colors duration-500">
                <div className="text-center">
                    <p className="text-zinc-700 dark:text-zinc-300 mb-2">Failed to load journal.</p>
                    <button onClick={() => window.location.reload()} className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 underline">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800/50 transition-colors duration-500">
            <div className="max-w-3xl mx-auto py-12 px-6 animate-in fade-in duration-500">
                <button
                    onClick={() => navigate('/ruhani')}
                    className="flex items-center text-sm tracking-wider text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 mb-12 transition-colors uppercase rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Hub
                </button>

                <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h2 className="text-2xl font-light text-zinc-900 dark:text-zinc-100 mb-2">My Ruhani Journal</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 font-light">
                            Only you can read this. It is never shown to anyone else.
                        </p>
                    </div>

                    <button
                        onClick={() => exportJournal()}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs tracking-widest uppercase font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                    >
                        <Download className="w-4 h-4" />
                        {isExporting ? 'Preparing…' : 'Export'}
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <label htmlFor="journal-search" className="sr-only">Search your reflections</label>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" aria-hidden="true" />
                    <input
                        id="journal-search"
                        type="search"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search your reflections…"
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/30 text-sm text-zinc-900 dark:text-zinc-300 placeholder:text-zinc-500 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600/50 transition-colors"
                    />
                </div>

                {/* Type filter */}
                <div className="flex items-center gap-2 mb-12 flex-wrap" role="group" aria-label="Filter by practice type">
                    {FILTERS.map((f) => {
                        const active = typeFilter === f.value;
                        return (
                            <button
                                key={f.label}
                                onClick={() => handleFilterChange(f.value)}
                                aria-pressed={active}
                                className={`px-4 py-2 rounded-full text-xs tracking-widest uppercase font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${active
                                    ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950'
                                    : 'border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                                    }`}
                            >
                                {f.label}
                            </button>
                        );
                    })}
                </div>

                {entries.length === 0 ? (
                    <div className="text-center py-20 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl bg-white dark:bg-zinc-900/10">
                        <p className="text-zinc-700 dark:text-zinc-400">
                            {search
                                ? `Nothing matches "${search}".`
                                : typeFilter
                                    ? `No ${typeFilter} entries yet.`
                                    : 'Your journal is empty.'}
                        </p>
                        <p className="text-zinc-600 dark:text-zinc-500 text-sm mt-2">
                            {search ? 'Try a different word.' : 'Complete a practice to see it here.'}
                        </p>
                    </div>
                ) : (
                    <div className="relative border-l border-zinc-200 dark:border-zinc-800/50 pl-8 ml-4 space-y-12">
                        {entries.map((entry) => (
                            <div key={entry._id} className="relative group">
                                {/* Timeline dot */}
                                <div className="absolute -left-[41px] top-6 w-5 h-5 rounded-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-colors duration-500" aria-hidden="true">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 group-hover:bg-zinc-600 dark:group-hover:bg-zinc-400 transition-colors"></div>
                                </div>

                                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/30 bg-white dark:bg-zinc-900/10 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700/50 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2 text-zinc-600 dark:text-zinc-400 text-xs tracking-widest uppercase font-semibold">
                                            <span aria-hidden="true">{getIcon(entry.practiceType)}</span>
                                            <span>{entry.practiceType}</span>
                                        </div>
                                        <div className="text-zinc-600 dark:text-zinc-500 text-sm flex gap-4 items-center">
                                            {entry.traitRating && (
                                                <span className="bg-zinc-100 dark:bg-zinc-800/50 px-2 py-1 rounded text-xs">Score: {entry.traitRating}/5</span>
                                            )}
                                            <span>{formatDate(entry.createdAt)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg text-zinc-800 dark:text-zinc-200 font-medium">{entry.sourceTitle}</h3>

                                            {editingId === entry._id ? (
                                                <div className="mt-3 space-y-4">
                                                    {(entry.guidedAnswers ?? []).map((qa, i) => (
                                                        <div key={i} className="space-y-1">
                                                            <label
                                                                htmlFor={`edit-${entry._id}-q${i}`}
                                                                className="block text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed"
                                                            >
                                                                {qa.prompt}
                                                            </label>
                                                            <textarea
                                                                id={`edit-${entry._id}-q${i}`}
                                                                value={editAnswers[i] ?? ''}
                                                                onChange={(e) => {
                                                                    const next = [...editAnswers];
                                                                    next[i] = e.target.value;
                                                                    setEditAnswers(next);
                                                                }}
                                                                className="w-full bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4 text-sm text-zinc-900 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600/50 min-h-[90px] resize-y"
                                                            />
                                                        </div>
                                                    ))}

                                                    <div className="space-y-1">
                                                        <label htmlFor={`edit-${entry._id}`} className="block text-xs text-zinc-500 dark:text-zinc-500">
                                                            {(entry.guidedAnswers ?? []).length > 0 ? 'Additional note' : 'Your reflection'}
                                                        </label>
                                                        <textarea
                                                            id={`edit-${entry._id}`}
                                                            value={editText}
                                                            onChange={(e) => setEditText(e.target.value)}
                                                            className="w-full bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 rounded-xl p-4 text-sm text-zinc-900 dark:text-zinc-300 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600/50 min-h-[100px] resize-y"
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-3 justify-end">
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="text-xs tracking-widest uppercase font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdate(entry)}
                                                            disabled={isUpdating || !editHasContent(entry)}
                                                            className="px-5 py-2 rounded-full text-xs tracking-widest uppercase font-semibold bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white transition-colors disabled:opacity-40"
                                                        >
                                                            {isUpdating ? 'Saving…' : 'Save'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-3 space-y-4">
                                                    {/* Structured answers — the prompt is what makes an old
                                                        entry re-readable months later */}
                                                    {entry.guidedAnswers?.map((qa, i) => (
                                                        <div key={i} className="space-y-1">
                                                            <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
                                                                {qa.prompt}
                                                            </p>
                                                            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-light text-sm whitespace-pre-wrap">
                                                                {qa.answer}
                                                            </p>
                                                        </div>
                                                    ))}

                                                    {entry.reflectionText && (
                                                        <p className={`text-zinc-700 dark:text-zinc-400 leading-relaxed font-light text-sm whitespace-pre-wrap ${entry.guidedAnswers?.length
                                                            ? 'pt-3 border-t border-zinc-200 dark:border-zinc-800/50'
                                                            : ''
                                                            }`}>
                                                            {entry.reflectionText}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {entry.habitChecks && entry.habitChecks.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/50">
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2">Habits checked</p>
                                                <ul className="space-y-1">
                                                    {entry.habitChecks.filter((h) => h.completed).map((h, i) => (
                                                        <li key={i} className="text-sm text-zinc-700 dark:text-zinc-400 flex items-center gap-2">
                                                            <div className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600" aria-hidden="true"></div>
                                                            {h.habit}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Entry actions — this is the user's own record to revise or erase */}
                                        {editingId !== entry._id && (
                                            <div className="pt-3 flex items-center justify-end gap-2">
                                                {confirmingDelete === entry._id ? (
                                                    <div className="flex items-center gap-3 animate-in fade-in">
                                                        <span className="text-xs text-zinc-700 dark:text-zinc-300">
                                                            Delete permanently?
                                                        </span>
                                                        <button
                                                            onClick={() => setConfirmingDelete(null)}
                                                            className="p-1.5 rounded-full text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                                                            aria-label="Cancel deletion"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(entry._id)}
                                                            disabled={isDeleting}
                                                            className="px-4 py-1.5 rounded-full text-xs tracking-widest uppercase font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                                        >
                                                            {isDeleting ? 'Deleting…' : 'Delete'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => startEditing(entry)}
                                                            className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                                                            aria-label={`Edit reflection on ${entry.sourceTitle}`}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmingDelete(entry._id)}
                                                            className="p-2 rounded-full text-zinc-500 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                                                            aria-label={`Delete reflection on ${entry.sourceTitle}`}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Start of timeline (only on last page) */}
                        {data && page >= data.totalPages && (
                            <div className="relative">
                                <div className="absolute -left-[41px] top-2 w-5 h-5 rounded-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-colors duration-500" aria-hidden="true">
                                    <div className="w-2 h-2 rounded-full border border-zinc-400 dark:border-zinc-600"></div>
                                </div>
                                <p className="text-zinc-600 dark:text-zinc-600 text-sm italic py-2">Beginning of your journey</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800/30">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="flex items-center gap-1 px-4 py-2 text-sm tracking-wider uppercase text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Prev
                        </button>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400 tabular-nums">
                            {page} / {data.totalPages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                            disabled={page >= data.totalPages}
                            className="flex items-center gap-1 px-4 py-2 text-sm tracking-wider uppercase text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
