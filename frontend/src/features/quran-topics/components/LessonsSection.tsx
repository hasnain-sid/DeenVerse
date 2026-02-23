import { CheckCircle, Lightbulb } from 'lucide-react';
import type { TopicLesson, MoodLesson } from '../types';

interface LessonsSectionProps {
  lessons: TopicLesson | MoodLesson[] | null;
}

export function LessonsSection({ lessons }: LessonsSectionProps) {
  if (!lessons) return null;

  const items = Array.isArray(lessons) ? lessons : [lessons];

  return (
    <div className="space-y-6">
      {items.map((lesson, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">{lesson.title}</h3>
          </div>

          {'topicName' in lesson && (
            <p className="text-xs text-muted-foreground">
              From topic: {(lesson as MoodLesson).topicName}
            </p>
          )}

          <p className="text-sm leading-relaxed text-muted-foreground">{lesson.explanation}</p>

          {lesson.practicalActions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Practical Actions</h4>
              <ul className="space-y-2">
                {lesson.practicalActions.map((action, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
