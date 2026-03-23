import { useFieldArray } from 'react-hook-form';
import type { Control, UseFormRegister } from 'react-hook-form';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createCourseSchema } from '@deenverse/shared';
import type { z } from 'zod';

type CourseFormValues = z.infer<typeof createCourseSchema>;

interface LessonEditorProps {
  lessonIndex: number;
  moduleIndex: number;
  register: UseFormRegister<CourseFormValues>;
  control: Control<CourseFormValues>;
  lessonTypeOptions: ReadonlyArray<{ value: string; label: string }>;
  onRemove: () => void;
}

export function LessonEditor({
  lessonIndex,
  moduleIndex,
  register,
  control,
  lessonTypeOptions,
  onRemove,
}: LessonEditorProps) {
  const resourceName = `modules.${moduleIndex}.lessons.${lessonIndex}.resources` as const;
  const { fields: resourceFields, append: appendResource, remove: removeResource } = useFieldArray({
    control,
    name: resourceName,
  });

  return (
    <div className="rounded-lg border border-border bg-background p-4 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3 lg:flex-1">
          <GripVertical size={16} className="text-muted-foreground" />
          <select
            {...register(`modules.${moduleIndex}.lessons.${lessonIndex}.type`)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none"
          >
            {lessonTypeOptions.map((lessonType) => (
              <option key={lessonType.value} value={lessonType.value}>
                {lessonType.label}
              </option>
            ))}
          </select>
          <input
            {...register(`modules.${moduleIndex}.lessons.${lessonIndex}.title`)}
            placeholder="Lesson title"
            className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:shrink-0">
          <input
            type="number"
            min="0"
            {...register(`modules.${moduleIndex}.lessons.${lessonIndex}.duration`, {
              valueAsNumber: true,
            })}
            placeholder="Minutes"
            className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm outline-none"
          />
          <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer shrink-0">
            <input
              type="checkbox"
              {...register(`modules.${moduleIndex}.lessons.${lessonIndex}.isFree`)}
              className="h-3.5 w-3.5 accent-primary"
            />
            Free preview
          </label>
          <button
            type="button"
            onClick={onRemove}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Lesson Content
          </label>
          <textarea
            {...register(`modules.${moduleIndex}.lessons.${lessonIndex}.content`)}
            rows={4}
            placeholder="Optional lesson notes, outline, or embedded instructions"
            className="min-h-[110px] w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Resources
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendResource({ name: '', url: '', type: 'link' })}
              className="gap-1"
            >
              <Plus size={12} />
              Add
            </Button>
          </div>

          {resourceFields.length === 0 ? (
            <div className="rounded-md border border-dashed border-border px-3 py-4 text-xs text-muted-foreground">
              Add links, PDFs, or worksheets students should open with this lesson.
            </div>
          ) : (
            <div className="space-y-3">
              {resourceFields.map((resourceField, resourceIndex) => (
                <div
                  key={resourceField.id}
                  className={cn('rounded-md border border-border bg-muted/30 p-3 space-y-2')}
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      {...register(
                        `modules.${moduleIndex}.lessons.${lessonIndex}.resources.${resourceIndex}.name`
                      )}
                      placeholder="Resource name"
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none"
                    />
                    <input
                      {...register(
                        `modules.${moduleIndex}.lessons.${lessonIndex}.resources.${resourceIndex}.type`
                      )}
                      placeholder="Type"
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      {...register(
                        `modules.${moduleIndex}.lessons.${lessonIndex}.resources.${resourceIndex}.url`
                      )}
                      placeholder="https://example.com/resource"
                      className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeResource(resourceIndex)}
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
