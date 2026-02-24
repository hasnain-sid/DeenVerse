import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Microscope,
    ScrollText,
    BookOpen,
    Landmark,
    Lightbulb,
    Heart,
    X,
    Bookmark,
    Share2,
    Sparkles,
    ExternalLink,
    Copy,
    Check,
    ChevronDown,
    Tag,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { Sign, SignCategory } from './types';
import { useDailySign, useSigns, useSignCategories } from './useSigns';

const categoryConfig: Record<
    SignCategory,
    { label: string; icon: React.FC<{ className?: string }>; color: string; bg: string; border: string }
> = {
    quran_science: {
        label: "Qur'an & Science",
        icon: Microscope,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500',
    },
    prophecy: {
        label: 'Prophecies',
        icon: ScrollText,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500',
    },
    linguistic_miracle: {
        label: 'Linguistic Miracles',
        icon: BookOpen,
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500',
    },
    historical_fact: {
        label: 'Historical Facts',
        icon: Landmark,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500',
    },
    prophetic_wisdom: {
        label: 'Prophetic Wisdom',
        icon: Lightbulb,
        color: 'text-rose-500',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500',
    },
    names_of_allah: {
        label: 'Names of Allah',
        icon: Heart,
        color: 'text-sky-500',
        bg: 'bg-sky-500/10',
        border: 'border-sky-500',
    },
};

// ─── helpers ────────────────────────────────────────────────────────────────

function categoryCount(data: ReturnType<typeof useSignCategories>['data'], cat: SignCategory): number | null {
    if (!data) return null;
    return data.find((c) => c.category === cat)?.count ?? null;
}

// ────────────────────────────────────────────────────────────────────────────

export function ImanBoostPage() {
    const [activeCategory, setActiveCategory] = useState<SignCategory | 'all'>('all');
    const [page, setPage] = useState(1);
    const [allSigns, setAllSigns] = useState<Sign[]>([]);
    const [selectedSign, setSelectedSign] = useState<Sign | null>(null);
    const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
    const [subhanAllahMap, setSubhanAllahMap] = useState<Record<string, number>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const { data: dailySign, isLoading: loadingDaily } = useDailySign();
    const { data: signsResponse, isLoading: loadingSigns } = useSigns(activeCategory, page);
    const { data: categoryCounts } = useSignCategories();

    const totalPages = signsResponse?.totalPages ?? 1;

    // Accumulate pages for "Load More" behaviour.
    // Depend on `signsResponse` (stable TanStack Query reference) to avoid
    // false invalidations from the `?? []` inline fallback pattern.
    useEffect(() => {
        const incoming = signsResponse?.signs ?? [];
        if (page === 1) {
            setAllSigns(incoming);
        } else {
            setAllSigns((prev) => {
                const existingIds = new Set(prev.map((s) => s._id));
                return [...prev, ...incoming.filter((s) => !existingIds.has(s._id))];
            });
        }
    }, [signsResponse, page]);

    // Reset when category changes
    useEffect(() => {
        setPage(1);
        setAllSigns([]);
    }, [activeCategory]);

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = selectedSign ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedSign]);

    // ── actions ──────────────────────────────────────────────────────────────

    const toggleBookmark = useCallback((sign: Sign, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setBookmarked((prev) => {
            const next = new Set(prev);
            if (next.has(sign._id)) {
                next.delete(sign._id);
                toast('Bookmark removed', { icon: '🔖' });
            } else {
                next.add(sign._id);
                toast.success('Bookmarked!');
            }
            return next;
        });
    }, []);

    const handleSubhanAllah = useCallback((sign: Sign, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSubhanAllahMap((prev) => ({ ...prev, [sign._id]: (prev[sign._id] ?? 0) + 1 }));
        toast('SubhanAllah 🌙', { icon: '✨', duration: 1500 });
    }, []);

    const handleShare = useCallback(async (sign: Sign, e?: React.MouseEvent) => {
        e?.stopPropagation();
        const shareText = `${sign.title}\n\n${sign.summary}\n\n— ${sign.reference}`;
        const url = `${window.location.origin}/iman-boost`;
        if (navigator.share) {
            try {
                await navigator.share({ title: sign.title, text: shareText, url });
            } catch {
                // user cancelled — do nothing
            }
        } else {
            await navigator.clipboard.writeText(`${shareText}\n\n${url}`);
            toast.success('Copied to clipboard!');
        }
    }, []);

    const handleCopyLink = useCallback(async (sign: Sign) => {
        const text = `${sign.title}\n\n${sign.summary}\n\n— ${sign.reference}\n\n${window.location.origin}/iman-boost`;
        await navigator.clipboard.writeText(text);
        setCopiedId(sign._id);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopiedId(null), 2000);
    }, []);

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
            {/* ── Header ── */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
                    <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Signs of Islam</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                    Explore the Qur'anic scientific signs, fulfilled prophecies, linguistic miracles, and historical
                    facts that strengthen faith.
                </p>
            </div>

            {/* ── Daily Sign Banner ── */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Sign of the Day</h2>
                {loadingDaily ? (
                    <Skeleton className="w-full h-[350px] rounded-2xl" />
                ) : dailySign ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card
                            className="overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-card to-background shadow-lg cursor-pointer transition-transform hover:scale-[1.01]"
                            onClick={() => setSelectedSign(dailySign)}
                        >
                            <div className="p-8 md:p-12 flex flex-col items-center text-center space-y-6">
                                <div
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium ${categoryConfig[dailySign.category].bg} ${categoryConfig[dailySign.category].color} inline-flex items-center gap-2`}
                                >
                                    {React.createElement(categoryConfig[dailySign.category].icon, {
                                        className: 'w-4 h-4',
                                    })}
                                    {categoryConfig[dailySign.category].label}
                                </div>
                                {dailySign.arabicText && (
                                    <p
                                        className="text-3xl md:text-5xl font-arabic leading-relaxed text-foreground"
                                        dir="rtl"
                                    >
                                        {dailySign.arabicText}
                                    </p>
                                )}
                                {dailySign.translation && (
                                    <p className="text-lg md:text-xl text-muted-foreground italic font-serif">
                                        &ldquo;{dailySign.translation}&rdquo;
                                    </p>
                                )}
                                <h3 className="text-2xl md:text-3xl font-bold max-w-3xl">{dailySign.title}</h3>
                                {dailySign.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {dailySign.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="secondary"
                                                className="rounded-full text-xs capitalize"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                <Button variant="default" className="rounded-full px-8 mt-2">
                                    Explore Sign
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ) : null}
            </section>

            {/* ── Category Tabs ── */}
            <section>
                <div
                    className="flex overflow-x-auto pb-4 gap-2 [&::-webkit-scrollbar]:hidden"
                    style={{ scrollbarWidth: 'none' }}
                >
                    <Button
                        variant={activeCategory === 'all' ? 'default' : 'outline'}
                        className="rounded-full whitespace-nowrap"
                        onClick={() => setActiveCategory('all')}
                    >
                        View All
                        {categoryCounts && (
                            <span className="ml-1.5 opacity-70 text-xs font-normal">
                                ({categoryCounts.reduce((s, c) => s + c.count, 0)})
                            </span>
                        )}
                    </Button>
                    {(Object.keys(categoryConfig) as SignCategory[]).map((cat) => {
                        const config = categoryConfig[cat];
                        const count = categoryCount(categoryCounts, cat);
                        return (
                            <Button
                                key={cat}
                                variant={activeCategory === cat ? 'default' : 'outline'}
                                className={`rounded-full whitespace-nowrap gap-2 ${activeCategory !== cat && 'hover:bg-muted'}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {React.createElement(config.icon, {
                                    className: `w-4 h-4 ${activeCategory !== cat ? config.color : ''}`,
                                })}
                                {config.label}
                                {count !== null && <span className="opacity-70 text-xs font-normal">({count})</span>}
                            </Button>
                        );
                    })}
                </div>
            </section>

            {/* ── Signs Grid ── */}
            <section>
                {loadingSigns && page === 1 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="h-64 rounded-2xl" />
                        ))}
                    </div>
                ) : allSigns.length === 0 ? (
                    <div className="text-center py-24 text-muted-foreground border border-dashed rounded-2xl bg-card/50">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">New signs coming soon to this category.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allSigns.map((sign, i) => {
                                const config = categoryConfig[sign.category];
                                const isBookmark = bookmarked.has(sign._id);
                                const saCount = subhanAllahMap[sign._id] ?? 0;
                                return (
                                    <motion.div
                                        key={sign._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(i, 11) * 0.05, duration: 0.4 }}
                                    >
                                        <Card
                                            className={`h-full flex flex-col cursor-pointer transition-all duration-300 hover:shadow-lg border-t-4 hover:-translate-y-1 bg-card/80 hover:bg-card ${config.border}`}
                                            onClick={() => setSelectedSign(sign)}
                                        >
                                            <div className="p-6 flex-1 flex flex-col">
                                                <div
                                                    className={`inline-flex items-center gap-1.5 text-xs font-semibold mb-4 ${config.color}`}
                                                >
                                                    {React.createElement(config.icon, { className: 'w-3.5 h-3.5' })}
                                                    {config.label}
                                                </div>
                                                <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-snug">
                                                    {sign.title}
                                                </h3>
                                                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1 leading-relaxed">
                                                    {sign.summary}
                                                </p>

                                                {/* Tags */}
                                                {sign.tags?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                                        {sign.tags.slice(0, 3).map((tag) => (
                                                            <Badge
                                                                key={tag}
                                                                variant="outline"
                                                                className="rounded-full text-xs capitalize px-2 py-0 h-5 border-muted-foreground/30"
                                                            >
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                        {sign.tags.length > 3 && (
                                                            <Badge
                                                                variant="outline"
                                                                className="rounded-full text-xs px-2 py-0 h-5 border-muted-foreground/30 text-muted-foreground"
                                                            >
                                                                +{sign.tags.length - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="mt-auto pt-4 border-t border-border/60 flex items-center justify-between text-xs font-medium text-muted-foreground">
                                                    <span className="truncate max-w-[150px] opacity-70">
                                                        {sign.reference}
                                                    </span>
                                                    <div
                                                        className="flex items-center gap-2"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {saCount > 0 && (
                                                            <span className="text-primary text-xs font-semibold">
                                                                {saCount}✨
                                                            </span>
                                                        )}
                                                        <button
                                                            aria-label="Bookmark"
                                                            className={`p-1 rounded transition-colors hover:bg-muted ${isBookmark ? 'text-primary' : 'text-muted-foreground'}`}
                                                            onClick={(e) => toggleBookmark(sign, e)}
                                                        >
                                                            <Bookmark
                                                                className={`w-3.5 h-3.5 ${isBookmark ? 'fill-current' : ''}`}
                                                            />
                                                        </button>
                                                        <button
                                                            aria-label="Share"
                                                            className="p-1 rounded transition-colors hover:bg-muted text-muted-foreground"
                                                            onClick={(e) => handleShare(sign, e)}
                                                        >
                                                            <Share2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Load More */}
                        {page < totalPages && (
                            <div className="flex justify-center mt-10">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="rounded-full px-10 gap-2"
                                    disabled={loadingSigns}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    {loadingSigns ? (
                                        <>Loading…</>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-4 h-4" />
                                            Load More Signs
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                        {page >= totalPages && allSigns.length > 0 && (
                            <p className="text-center text-xs text-muted-foreground mt-8 opacity-60">
                                Showing all {allSigns.length} sign{allSigns.length !== 1 ? 's' : ''} — May Allah
                                increase your faith.
                            </p>
                        )}
                    </>
                )}
            </section>

            {/* ── Detail Modal ── */}
            <AnimatePresence>
                {selectedSign && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                            onClick={() => setSelectedSign(null)}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', duration: 0.5, bounce: 0 }}
                            className="relative w-full max-w-3xl max-h-[90vh] bg-card rounded-2xl shadow-2xl flex flex-col border overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex flex-shrink-0 items-center justify-between p-4 border-b bg-card/95 backdrop-blur z-10">
                                <div
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${categoryConfig[selectedSign.category].bg} ${categoryConfig[selectedSign.category].color}`}
                                >
                                    {React.createElement(categoryConfig[selectedSign.category].icon, {
                                        className: 'w-3.5 h-3.5',
                                    })}
                                    {categoryConfig[selectedSign.category].label}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Bookmark"
                                        className={`h-8 w-8 transition-colors ${bookmarked.has(selectedSign._id) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                        onClick={() => toggleBookmark(selectedSign)}
                                    >
                                        <Bookmark
                                            className={`w-4 h-4 ${bookmarked.has(selectedSign._id) ? 'fill-current' : ''}`}
                                        />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Share"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={(e) => handleShare(selectedSign, e)}
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Close"
                                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ml-1"
                                        onClick={() => setSelectedSign(null)}
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="overflow-y-auto p-6 md:p-10 space-y-8 flex-1">
                                {(selectedSign.arabicText || selectedSign.translation) && (
                                    <div className="text-center space-y-5 bg-muted/20 p-6 rounded-2xl border border-muted/50">
                                        {selectedSign.arabicText && (
                                            <p
                                                className="text-3xl md:text-5xl font-arabic leading-relaxed text-foreground"
                                                dir="rtl"
                                            >
                                                {selectedSign.arabicText}
                                            </p>
                                        )}
                                        {selectedSign.translation && (
                                            <p className="text-lg md:text-xl text-muted-foreground italic font-serif max-w-2xl mx-auto">
                                                &ldquo;{selectedSign.translation}&rdquo;
                                            </p>
                                        )}
                                        <div className="inline-block px-3 py-1 bg-background border text-muted-foreground text-xs font-medium rounded-full shadow-sm">
                                            {selectedSign.reference}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h2 className="text-2xl md:text-4xl font-bold mb-6 text-foreground leading-tight tracking-tight">
                                        {selectedSign.title}
                                    </h2>
                                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {selectedSign.explanation}
                                    </div>
                                </div>

                                {/* Tags in modal */}
                                {selectedSign.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <Tag className="w-4 h-4 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                                        {selectedSign.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="secondary"
                                                className="rounded-full capitalize text-xs"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="flex-shrink-0 p-5 border-t bg-muted/30 flex items-center justify-between flex-wrap gap-3">
                                <a
                                    href={selectedSign.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-primary hover:text-primary/80 hover:underline inline-flex items-center gap-1.5 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Read original source
                                </a>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 rounded-full"
                                        onClick={() => handleCopyLink(selectedSign)}
                                    >
                                        {copiedId === selectedSign._id ? (
                                            <>
                                                <Check className="w-4 h-4 text-green-500" /> Copied
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" /> Copy
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="gap-2 rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                                        onClick={() => handleSubhanAllah(selectedSign)}
                                    >
                                        <Heart className="w-4 h-4" />
                                        SubhanAllah
                                        {(subhanAllahMap[selectedSign._id] ?? 0) > 0 && (
                                            <span className="ml-1 text-xs font-semibold text-primary">
                                                {subhanAllahMap[selectedSign._id]}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
