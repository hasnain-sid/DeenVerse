import { useFieldArray } from 'react-hook-form';
import type { Control, UseFormRegister } from 'react-hook-form';
import { BookOpen, GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createCourseSchema } from '@deenverse/shared';
import type { z } from 'zod';
import { LessonEditor } from './LessonEditor';

type CourseFormValues = z.infer<typeof createCourseSchema>;

interface ModuleEditorProps {
  moduleIndex: number;
  register: UseFormRegister<CourseFormValues>;
  control: Control<CourseFormValues>;
  lessonTypeOptions: ReadonlyArray<{ value: string; label: string }>;
  onRemove: () => void;
}

export function ModuleEditor({
  moduleIndex,
  register,
  control,
  lessonTypeOptions,
  onRemove,
}: ModuleEditorProps) {
  const lessonsName = `modules.${moduleIndex}.lessons` as const;
  const { fields: lessonFields, append: appendLesson, remove: removeLesson } = useFieldArray({
    control,
    name: lessonsName,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
      <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-3">
        <GripVertical size={16} className="text-muted-foreground" />
        <span className="shrink-0 text-sm text-muted-foreground">Module {moduleIndex + 1}:</span>
        <input
          {...register(`modules.${moduleIndex}.title`)}
          className="flex-1 border-none bg-transparent p-0 font-semibold text-foreground outline-none focus:ring-0"
          placeholder="Module title"
        />
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1.5 text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Module Description
          </label>
          <textarea
            {...register(`modules.${moduleIndex}.description`)}
            rows={3}
            placeholder="Introduce the module, its goals, and what students should focus on."
            className="min-h-[88px] w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {lessonFields.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No lessons yet. Add the first lesson for this module.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessonFields.map((lessonField, lessonIndex) => (
              <LessonEditor
                key={lessonField.id}
                lessonIndex={lessonIndex}
                moduleIndex={moduleIndex}
                register={register}
                control={control}
                lessonTypeOptions={lessonTypeOptions}
                onRemove={() => removeLesson(lessonIndex)}
              />
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            appendLesson({
              title: 'New Lesson',
              type: 'video',
              content: '',
              duration: 0,
              order: lessonFields.length,
              isFree: false,
              resources: [],
            })
          }
          className="w-full gap-2 border-dashed"
        >
          <Plus size={14} />
          Add Lesson
        </Button>
      </div>
    </div>
  );
}
