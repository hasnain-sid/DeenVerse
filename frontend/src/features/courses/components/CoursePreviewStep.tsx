import { AlertCircle, BookOpen, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CoursePreviewStepProps {
  title?: string;
  description?: string;
  category?: string;
  level?: string;
  moduleCount: number;
  isPending: boolean;
  onSubmit: () => void;
}

export function CoursePreviewStep({
  title,
  description,
  category,
  level,
  moduleCount,
  isPending,
  onSubmit,
}: CoursePreviewStepProps) {
  return (
    <>
      <div>
        <h2 className="mb-1 text-2xl font-bold">Preview &amp; Publish</h2>
        <p className="text-sm text-muted-foreground">Review your course before submitting for review.</p>
      </div>

      <div className="space-y-4 rounded-xl bg-muted/30 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-muted">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {title || <span className="italic text-muted-foreground">No title yet</span>}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {description || 'No description yet'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {category && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary">
              {category}
            </span>
          )}
          {level && (
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize text-secondary-foreground">
              {level}
            </span>
          )}
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">
            {moduleCount} module{moduleCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          After submitting, your course will be reviewed by our team before becoming visible to students. This typically takes 1-2 business days.
        </p>
      </div>

      <Button className="w-full gap-2" onClick={onSubmit} disabled={isPending}>
        <Send size={16} />
        {isPending ? 'Creating course...' : 'Submit Course for Review'}
      </Button>
    </>
  );
}
