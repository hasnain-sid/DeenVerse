import { Calendar } from 'lucide-react';
import { LearningProgress } from '../types';

interface SpacedRepetitionCardProps {
    progress?: LearningProgress;
}

export function SpacedRepetitionCard({ progress }: SpacedRepetitionCardProps) {
    if (!progress) return null;

    return (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between mb-8 animate-fade-in">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-medium text-sm">Spaced Repetition</h3>
                    <p className="text-xs text-muted-foreground">
                        Level {progress.repetitionLevel} • Next review: {progress.nextReviewDate ? new Date(progress.nextReviewDate).toLocaleDateString() : 'Not scheduled'}
                    </p>
                </div>
            </div>
            <span className="bg-primary/5 border border-primary/20 text-primary text-xs px-2 py-0.5 rounded font-semibold hidden sm:inline-block">
                Phase 3 Feature
            </span>
        </div>
    );
}
