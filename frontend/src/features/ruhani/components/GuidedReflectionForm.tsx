export interface GuidedReflectionValue {
    /** One answer per prompt, index-aligned with `prompts`. */
    answers: string[];
    /** Optional free-form space for anything the scaffold doesn't hold. */
    freeform: string;
}

interface GuidedReflectionFormProps {
    prompts: string[];
    value: GuidedReflectionValue;
    onChange: (next: GuidedReflectionValue) => void;
    idPrefix: string;
    disabled?: boolean;
    freeformLabel?: string;
    freeformPlaceholder?: string;
}

export function emptyGuidedValue(promptCount: number): GuidedReflectionValue {
    return { answers: Array.from({ length: promptCount }, () => ''), freeform: '' };
}

/** True once the user has written anything at all — used to gate saving. */
export function hasGuidedContent(value: GuidedReflectionValue): boolean {
    return value.answers.some((a) => a.trim().length > 0) || value.freeform.trim().length > 0;
}

/**
 * Builds the `guidedAnswers` payload, dropping prompts the user left blank.
 * Answering one of three is a complete reflection, not a partial one.
 */
export function toGuidedAnswers(prompts: string[], value: GuidedReflectionValue) {
    return prompts
        .map((prompt, i) => ({ prompt, answer: (value.answers[i] ?? '').trim() }))
        .filter((a) => a.answer.length > 0);
}

/**
 * The guided questions rendered as answerable fields rather than decoration.
 *
 * Each practice ships carefully-sequenced prompts — Tadabbur's three follow a real
 * methodology (comprehension → application → action). Previously they were printed
 * above one undifferentiated textarea, which discards the sequence and reproduces
 * the blank-page paralysis the scaffolding exists to prevent.
 *
 * Nothing here is required. Requiring every field would turn reflection into
 * homework, which is precisely the performance pressure this feature rejects.
 */
export function GuidedReflectionForm({
    prompts,
    value,
    onChange,
    idPrefix,
    disabled = false,
    freeformLabel = 'Anything else?',
    freeformPlaceholder = 'Optional — whatever else came up.',
}: GuidedReflectionFormProps) {
    const setAnswer = (index: number, answer: string) => {
        const answers = [...value.answers];
        answers[index] = answer;
        onChange({ ...value, answers });
    };

    return (
        <div className="space-y-8">
            {prompts.map((prompt, i) => (
                <div key={i} className="space-y-3">
                    <label
                        htmlFor={`${idPrefix}-q${i}`}
                        className="block text-zinc-700 dark:text-zinc-300 leading-relaxed"
                    >
                        <span
                            className="text-xs tracking-widest text-zinc-500 dark:text-zinc-500 mr-3 tabular-nums font-semibold"
                            aria-hidden="true"
                        >
                            {String(i + 1).padStart(2, '0')}
                        </span>
                        {prompt}
                    </label>
                    <textarea
                        id={`${idPrefix}-q${i}`}
                        value={value.answers[i] ?? ''}
                        onChange={(e) => setAnswer(i, e.target.value)}
                        disabled={disabled}
                        placeholder="Take your time…"
                        className="w-full bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-5 text-zinc-900 dark:text-zinc-300 placeholder:text-zinc-500 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600/50 focus:bg-zinc-50 dark:focus:bg-zinc-900/50 transition-all min-h-[120px] resize-y disabled:opacity-60"
                    />
                </div>
            ))}

            <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800/50">
                <label
                    htmlFor={`${idPrefix}-freeform`}
                    className="block text-zinc-600 dark:text-zinc-400 text-sm"
                >
                    {freeformLabel}
                </label>
                <textarea
                    id={`${idPrefix}-freeform`}
                    value={value.freeform}
                    onChange={(e) => onChange({ ...value, freeform: e.target.value })}
                    disabled={disabled}
                    placeholder={freeformPlaceholder}
                    className="w-full bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 rounded-2xl p-5 text-zinc-900 dark:text-zinc-300 placeholder:text-zinc-500 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600/50 focus:bg-zinc-50 dark:focus:bg-zinc-900/50 transition-all min-h-[100px] resize-y disabled:opacity-60"
                />
            </div>
        </div>
    );
}
