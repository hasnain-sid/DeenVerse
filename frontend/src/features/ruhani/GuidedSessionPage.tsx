import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Moon, BookOpen, Heart, Check } from 'lucide-react';
import { useStartSession, useUpdateSession, useSavePractice } from './api/useRuhani';
import type { SessionSuggestion, SpiritualSession } from './api/ruhaniApi';
import {
    GuidedReflectionForm,
    emptyGuidedValue,
    hasGuidedContent,
    toGuidedAnswers,
    type GuidedReflectionValue,
} from './components/GuidedReflectionForm';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

type Step = 'choose' | 'arrival' | 'tafakkur' | 'tadabbur' | 'tazkia' | 'summary';

const DURATIONS = [
    { minutes: 10, label: '10 minutes' },
    { minutes: 20, label: '20 minutes' },
    { minutes: 40, label: '40 minutes' },
    { minutes: null, label: 'Open-ended' },
] as const;

/** Minutes per practice, from the design doc's allocation table. */
const ALLOCATION: Record<number, [number, number, number]> = {
    10: [3, 5, 2],
    20: [5, 10, 5],
    40: [10, 20, 10],
};

const PRACTICE_STEPS: Step[] = ['tafakkur', 'tadabbur', 'tazkia'];

const STEP_META = {
    tafakkur: { Icon: Moon, title: 'Tafakkur', lead: 'Contemplate this sign in creation.' },
    tadabbur: { Icon: BookOpen, title: 'Tadabbur', lead: 'Now read what Allah says about it.' },
    tazkia: { Icon: Heart, title: 'Tazkia', lead: 'What in you needs to change?' },
} as const;

export function GuidedSessionPage() {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    const { mutate: startSession, isPending: isStarting } = useStartSession();
    const { mutate: updateSession } = useUpdateSession();
    const { mutate: savePractice, isPending: isSaving } = useSavePractice();

    const [step, setStep] = useState<Step>('choose');
    const [session, setSession] = useState<SpiritualSession | null>(null);
    const [content, setContent] = useState<SessionSuggestion | null>(null);
    const [value, setValue] = useState<GuidedReflectionValue>(emptyGuidedValue(0));
    /** Each step's saved practice id, so the spiral is chained end to end. */
    const [practiceIds, setPracticeIds] = useState<Record<string, string>>({});
    const [startedAt, setStartedAt] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    // Ambient progress only — no countdown, no numbers, no chime. A visible clock
    // during contemplation contradicts the whole point of the space.
    useEffect(() => {
        if (!startedAt || step === 'choose' || step === 'summary') return;
        const id = setInterval(() => setElapsed(Date.now() - startedAt), 15_000);
        return () => clearInterval(id);
    }, [startedAt, step]);

    // Move focus to the top of each new step for keyboard and screen-reader users
    useEffect(() => {
        contentRef.current?.focus();
    }, [step]);

    const prompts =
        step === 'tafakkur' ? content?.topic.guidedQuestions ?? []
            : step === 'tadabbur' ? content?.ayah.guidedQuestions ?? []
                : step === 'tazkia' ? content?.trait.muhasabaPrompts ?? []
                    : [];

    const handleBegin = (duration: number | null) => {
        if (!isAuthenticated) {
            toast.error('Please log in to begin a guided session.');
            navigate('/login', { state: { from: { pathname: '/ruhani/session' } } });
            return;
        }

        startSession(duration, {
            onSuccess: (data) => {
                setSession(data.session);
                setContent({
                    topic: data.topic,
                    ayah: data.ayah,
                    trait: data.trait,
                    revisitingTrait: data.revisitingTrait,
                });
                setStartedAt(Date.now());
                setStep('arrival');
            },
        });
    };

    const goToStep = (next: Step) => {
        setValue(emptyGuidedValue(0));
        setStep(next);
    };

    const handleSaveStep = () => {
        if (!content || !session) return;
        const current = step as 'tafakkur' | 'tadabbur' | 'tazkia';

        const source =
            current === 'tafakkur' ? { ref: content.topic.slug, title: content.topic.title }
                : current === 'tadabbur' ? { ref: content.ayah.verseKey, title: `Quran ${content.ayah.verseKey}` }
                    : { ref: content.trait.slug, title: content.trait.title };

        // Chain to the previous step so the journal can read the session as one thread
        const previous = current === 'tadabbur' ? practiceIds.tafakkur
            : current === 'tazkia' ? practiceIds.tadabbur
                : undefined;

        savePractice(
            {
                practiceType: current,
                sourceRef: source.ref,
                sourceTitle: source.title,
                guidedAnswers: toGuidedAnswers(prompts, value),
                reflectionText: value.freeform.trim() || undefined,
                linkedPracticeId: previous,
            },
            {
                onSuccess: (saved) => {
                    const id = saved?._id;
                    if (id) {
                        setPracticeIds((prev) => ({ ...prev, [current]: id }));
                        updateSession({ id: session._id, payload: { step: current, practiceId: id } });
                    }

                    const index = PRACTICE_STEPS.indexOf(current);
                    const next = PRACTICE_STEPS[index + 1];

                    if (next) {
                        goToStep(next);
                    } else {
                        updateSession({
                            id: session._id,
                            payload: { status: 'completed', sessionAction: value.freeform.trim() },
                        });
                        setStep('summary');
                    }
                },
            }
        );
    };

    const handleLeave = () => {
        // No penalty for stopping — but record it honestly rather than leaving it open
        if (session && step !== 'summary' && step !== 'choose') {
            updateSession({ id: session._id, payload: { status: 'abandoned' } });
        }
        navigate('/ruhani');
    };

    const allocation = session?.duration ? ALLOCATION[session.duration] : null;
    const stepIndex = PRACTICE_STEPS.indexOf(step as never);
    const suggestedMinutes = allocation && stepIndex >= 0 ? allocation[stepIndex] : null;

    const shell = (children: React.ReactNode) => (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans transition-colors duration-500">
            <div className="max-w-3xl mx-auto py-12 px-6">
                <button
                    onClick={handleLeave}
                    className="flex items-center text-sm tracking-wider text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 mb-12 transition-colors uppercase rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {step === 'choose' || step === 'summary' ? 'Back to Hub' : 'Leave session'}
                </button>

                <div ref={contentRef} tabIndex={-1} className="focus:outline-none animate-in fade-in duration-500">
                    {children}
                </div>
            </div>
        </div>
    );

    // ── Time selection ──────────────────────────────────────────────
    if (step === 'choose') {
        return shell(
            <div className="text-center space-y-10">
                <div className="space-y-4">
                    <h1 className="text-3xl font-light text-zinc-900 dark:text-zinc-100">A Guided Session</h1>
                    <p className="text-zinc-600 dark:text-zinc-400 font-light max-w-md mx-auto leading-relaxed">
                        We'll weave Tafakkur, Tadabbur and Tazkia into one journey. How much time do you have
                        with yourself today?
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {DURATIONS.map(({ minutes, label }) => (
                        <button
                            key={label}
                            onClick={() => handleBegin(minutes)}
                            disabled={isStarting}
                            className="px-4 py-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/20 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all duration-300 text-sm text-zinc-800 dark:text-zinc-200 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {isStarting && (
                    <p className="text-sm text-zinc-500" role="status" aria-live="polite">Preparing your session…</p>
                )}
            </div>
        );
    }

    if (!content || !session) return shell(<div />);

    // ── Arrival ─────────────────────────────────────────────────────
    if (step === 'arrival') {
        return shell(
            <div className="text-center space-y-10 py-12">
                <div className="h-16 w-16 mx-auto rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                    <Moon className="w-6 h-6 text-zinc-400" aria-hidden="true" />
                </div>
                <div className="space-y-5">
                    <h1 className="text-2xl font-light text-zinc-900 dark:text-zinc-100">Take a few breaths.</h1>
                    <p className="text-zinc-600 dark:text-zinc-400 font-light max-w-md mx-auto leading-relaxed">
                        {session.duration
                            ? `You've set aside ${session.duration} minutes. Nothing else needs your attention right now.`
                            : "You've set this time aside. Nothing else needs your attention right now."}
                    </p>
                </div>
                <button
                    onClick={() => goToStep('tafakkur')}
                    className="px-10 py-3 rounded-full text-sm tracking-widest uppercase font-semibold bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-950"
                >
                    Begin
                </button>
            </div>
        );
    }

    // ── Summary ─────────────────────────────────────────────────────
    if (step === 'summary') {
        const minutes = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 60_000)) : null;
        return shell(
            <div className="space-y-10">
                <div className="text-center space-y-4">
                    <div className="h-14 w-14 mx-auto rounded-full border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                        <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-500" aria-hidden="true" />
                    </div>
                    <h1 className="text-2xl font-light text-zinc-900 dark:text-zinc-100">Your session is complete</h1>
                    {minutes && (
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                            {minutes} {minutes === 1 ? 'minute' : 'minutes'} with yourself.
                        </p>
                    )}
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-900/20 divide-y divide-zinc-200 dark:divide-zinc-800/50">
                    {[
                        { label: 'Contemplated', value: content.topic.title },
                        { label: 'Pondered', value: `Quran ${content.ayah.verseKey}` },
                        { label: 'Worked on', value: content.trait.title },
                    ].map(({ label, value: v }) => (
                        <div key={label} className="px-6 py-5 flex items-baseline justify-between gap-6">
                            <span className="text-xs tracking-widest uppercase text-zinc-500 dark:text-zinc-500 font-semibold shrink-0">{label}</span>
                            <span className="text-zinc-800 dark:text-zinc-200 text-right">{v}</span>
                        </div>
                    ))}
                </div>

                {content.trait.transitionPrompt && (
                    <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/40 bg-zinc-50 dark:bg-zinc-900/20">
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-center font-light">
                            {content.trait.transitionPrompt}
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <button
                        onClick={() => navigate('/ruhani/journal')}
                        className="px-6 py-3 rounded-full text-sm tracking-widest uppercase font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                    >
                        View Journal
                    </button>
                    <button
                        onClick={() => navigate('/ruhani')}
                        className="px-8 py-3 rounded-full text-sm tracking-widest uppercase font-semibold bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-950"
                    >
                        Return to Hub
                    </button>
                </div>
            </div>
        );
    }

    // ── A practice step ─────────────────────────────────────────────
    const meta = STEP_META[step as 'tafakkur' | 'tadabbur' | 'tazkia'];
    const { Icon } = meta;
    const isLast = step === 'tazkia';

    return shell(
        <div className="space-y-10">
            {/* Progress — position in the journey, not a countdown */}
            <div className="flex items-center gap-3" role="group" aria-label={`Step ${stepIndex + 1} of 3`}>
                {PRACTICE_STEPS.map((s, i) => (
                    <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-colors duration-700 ${i <= stepIndex ? 'bg-zinc-700 dark:bg-zinc-300' : 'bg-zinc-200 dark:bg-zinc-800'
                            }`}
                        aria-hidden="true"
                    />
                ))}
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span className="text-xs tracking-widest uppercase font-semibold">{meta.title}</span>
                    {suggestedMinutes && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-500">· about {suggestedMinutes} min</span>
                    )}
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 font-light">{meta.lead}</p>
            </div>

            {/* The content for this step */}
            {step === 'tafakkur' && (
                <div className="text-center space-y-5 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800/40 bg-white dark:bg-zinc-900/20">
                    <div className="text-4xl opacity-80" aria-hidden="true">{content.topic.icon}</div>
                    <h2 className="text-2xl font-light text-zinc-900 dark:text-zinc-100">{content.topic.title}</h2>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-xl mx-auto font-light">
                        {content.topic.contemplate}
                    </p>
                </div>
            )}

            {step === 'tadabbur' && (
                <div className="space-y-4">
                    {/* The bridge that makes this a spiral rather than three tabs */}
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">
                        You just reflected on {content.topic.title.toLowerCase()}. Now read what Allah says about it.
                    </p>
                    <div className="text-center space-y-6 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800/40 bg-white dark:bg-zinc-900/20">
                        <div className="text-zinc-600 dark:text-zinc-400 text-sm tracking-widest uppercase font-semibold">
                            Quran {content.ayah.verseKey}
                        </div>
                        <p lang="ar" dir="rtl" className="text-3xl font-arabic text-zinc-900 dark:text-zinc-100 leading-loose mx-auto max-w-2xl">
                            {content.ayah.arabicText}
                        </p>
                        <p className="text-zinc-700 dark:text-zinc-300 text-lg italic font-serif opacity-90 mx-auto max-w-xl">
                            "{content.ayah.translation}"
                        </p>
                        {content.ayah.context && (
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-xl mx-auto pt-4 border-t border-zinc-200 dark:border-zinc-800/50">
                                {content.ayah.context}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {step === 'tazkia' && (
                <div className="space-y-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">
                        {content.revisitingTrait
                            ? `${content.trait.title} felt hard recently. Let's sit with it again.`
                            : `This verse points toward ${content.trait.title.toLowerCase()}.`}
                    </p>
                    <div className="text-center space-y-5 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800/40 bg-white dark:bg-zinc-900/20">
                        <h2 className="text-2xl font-light text-zinc-900 dark:text-zinc-100">{content.trait.title}</h2>
                        <p lang="ar" dir="rtl" className="font-arabic text-zinc-600 dark:text-zinc-400">{content.trait.arabicTitle}</p>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-xl mx-auto font-light">
                            {content.trait.description}
                        </p>
                        <p className="text-zinc-700 dark:text-zinc-300 text-base leading-loose font-serif italic pt-4 border-t border-zinc-200 dark:border-zinc-800/50">
                            "{content.trait.primaryHadith}"
                        </p>
                    </div>
                </div>
            )}

            <GuidedReflectionForm
                prompts={prompts}
                value={value}
                onChange={setValue}
                idPrefix={`session-${step}`}
                disabled={isSaving}
                freeformLabel={isLast ? 'Your commitment — what will you do differently?' : 'Anything else?'}
                freeformPlaceholder={isLast ? `Example: ${content.trait.actionTemplate}` : 'Optional.'}
            />

            <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    {elapsed > 0 && session.duration
                        ? 'Take the time you need.'
                        : 'Nothing here is required.'}
                </p>
                <button
                    onClick={handleSaveStep}
                    disabled={!hasGuidedContent(value) || isSaving}
                    className={`px-8 py-3 rounded-full text-sm tracking-widest uppercase font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-offset-zinc-950 ${hasGuidedContent(value)
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed'
                        }`}
                >
                    {isSaving ? 'Saving…' : isLast ? 'Complete Session' : `Continue to ${STEP_META[PRACTICE_STEPS[stepIndex + 1] as 'tadabbur' | 'tazkia'].title}`}
                </button>
            </div>
        </div>
    );
}
