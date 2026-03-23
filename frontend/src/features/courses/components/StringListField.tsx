import { useState } from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import type { z } from 'zod';
import { createCourseSchema } from '@deenverse/shared';
import { Button } from '@/components/ui/button';

type CourseFormValues = z.infer<typeof createCourseSchema>;

interface StringListFieldProps {
  label: string;
  name: 'requirements' | 'learningOutcomes' | 'tags';
  control: Control<CourseFormValues>;
  placeholder?: string;
}

export function StringListField({ label, name, control, placeholder }: StringListFieldProps) {
  const [input, setInput] = useState('');
  const { fields, append, remove } = useFieldArray({ control, name: name as never });

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <div className="space-y-2">
        {(fields as Array<{ id: string }>).map((field, index) => (
          <Controller
            key={field.id}
            control={control}
            name={`${name}.${index}` as never}
            render={({ field: controllerField }) => (
              <div className="flex items-center gap-2">
                <input
                  {...controllerField}
                  className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          />
        ))}

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                if (input.trim()) {
                  append(input.trim() as never);
                  setInput('');
                }
              }
            }}
            placeholder={placeholder}
            className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (input.trim()) {
                append(input.trim() as never);
                setInput('');
              }
            }}
          >
            <Plus size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
