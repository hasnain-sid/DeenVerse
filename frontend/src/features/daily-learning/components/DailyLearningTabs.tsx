import { type LearningUnitType } from './ReflectionSplitView';

interface DailyLearningTabsProps {
    activeUnit: LearningUnitType;
    onChange: (unit: LearningUnitType) => void;
}

const units: Array<{ id: LearningUnitType; label: string }> = [
    { id: 'ayah', label: 'Ayah' },
    { id: 'ruku', label: 'Ruku' },
    { id: 'juzz', label: 'Juzz' },
];

export function DailyLearningTabs({ activeUnit, onChange }: DailyLearningTabsProps) {
    return (
        <div className="flex items-center bg-card p-1 rounded-xl border border-border overflow-x-auto hide-scroll">
            {units.map((unit) => (
                <button
                    key={unit.id}
                    onClick={() => onChange(unit.id)}
                    className={`px-5 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${activeUnit === unit.id
                            ? 'bg-primary text-primary-foreground font-semibold shadow'
                            : 'text-muted-foreground hover:text-foreground font-medium'
                        }`}
                >
                    {unit.label}
                </button>
            ))}
        </div>
    );
}
