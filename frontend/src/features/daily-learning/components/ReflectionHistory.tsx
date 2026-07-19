import { History, Lock, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLearningHistory } from '../useDailyLearning';
import type { LearningUnitType } from './ReflectionSplitView';

export interface Reflection {
    _id: string;
    learningType: LearningUnitType;
    referenceId: string;
    title?: string;
    reflectionText: string;
    isPrivate: boolean;
    createdAt: string;
}

const TYPE_LABELS: Record<LearningUnitType, string> = {
    ayah: 'Ayah',
    ruku: 'Ruku',
    juzz: 'Juzz',
};

export function ReflectionHistory({ type }: { type?: LearningUnitType }) {
    const { data, isLoading } = useLearningHistory(type);
    const reflections: Reflection[] = data?.reflections ?? [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="w-4 h-4 text-muted-foreground" />
                    Your Past Reflections
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                        ))}
                    </div>
                ) : reflections.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                        No reflections yet — complete today's learning to start your journal.
                    </p>
                ) : (
                    <div className="space-y-5">
                        {reflections.map((r) => (
                            <div key={r._id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                        {TYPE_LABELS[r.learningType] ?? r.learningType}
                                    </Badge>
                                    <span className="text-sm font-medium">
                                        {r.title || r.referenceId}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1.5">
                                        {r.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                                        {new Date(r.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {r.reflectionText}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
