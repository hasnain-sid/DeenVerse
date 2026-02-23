import { useState } from 'react';
import { BookOpen, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DailyLearningTabs } from './components/DailyLearningTabs';
import { ReflectionSplitView, type LearningUnitType } from './components/ReflectionSplitView';
import { useDailyLearningContent, useSaveReflection } from './useDailyLearning';
import { useAuthStore } from '@/stores/authStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export function DailyLearningPage() {
    const [activeUnit, setActiveUnit] = useState<LearningUnitType>('ayah');
    const { data: content, isLoading, isError } = useDailyLearningContent(activeUnit);
    const saveReflection = useSaveReflection();
    const { isAuthenticated } = useAuthStore();

    const handleComplete = () => {
        if (!content) return;

        if (!isAuthenticated) {
            // For unauthenticated users, just show a visual confirmation
            return;
        }

        saveReflection.mutate({
            learningType: content.type,
            referenceId: content.referenceId,
            title: content.title,
            reflectionText: 'Completed daily reflection',
            isPrivate: true,
        });
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <BookOpen className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Daily Learning</h2>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link to="/daily-learning-prototypes" className="flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            View Prototypes
                        </Link>
                    </Button>
                    <DailyLearningTabs activeUnit={activeUnit} onChange={setActiveUnit} />
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-5 space-y-4 p-6">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="md:col-span-7 space-y-4 p-6">
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            ) : isError ? (
                <div className="text-center py-16 text-muted-foreground">
                    Failed to load today's learning content. Please try again later.
                </div>
            ) : (
                <ReflectionSplitView content={content ?? null} onComplete={handleComplete} />
            )}
        </div>
    );
}
