import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Image as ImageIcon } from 'lucide-react';
import type { z } from 'zod';
import { createCourseSchema } from '@deenverse/shared';

type CourseFormValues = z.infer<typeof createCourseSchema>;

const CATEGORY_OPTIONS = [
  { value: 'quran', label: 'Quran' },
  { value: 'hadith', label: 'Hadith' },
  { value: 'fiqh', label: 'Fiqh' },
  { value: 'aqeedah', label: 'Aqeedah' },
  { value: 'seerah', label: 'Seerah' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'tajweed', label: 'Tajweed' },
  { value: 'tafseer', label: 'Tafseer' },
  { value: 'dawah', label: 'Dawah' },
  { value: 'other', label: 'Other' },
] as const;

const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;

const TYPE_OPTIONS = [
  { value: 'self-paced', label: 'Self-paced (On-demand)' },
  { value: 'instructor-led', label: 'Instructor-led (Live)' },
  { value: 'hybrid', label: 'Hybrid' },
] as const;

interface CourseBasicsStepProps {
  register: UseFormRegister<CourseFormValues>;
  errors: FieldErrors<CourseFormValues>;
}

export function CourseBasicsStep({ register, errors }: CourseBasicsStepProps) {
  return (
    <>
      <div>
        <h2 className="mb-1 text-2xl font-bold">Basic Information</h2>
        <p className="text-sm text-muted-foreground">Core details about your course.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Course Title <span className="text-destructive">*</span>
          </label>
          <input
            {...register('title')}
            placeholder="E.g. Introduction to Fiqh"
            className="h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Short Description</label>
          <input
            {...register('shortDescription')}
            placeholder="A brief summary (max 200 chars)"
            maxLength={200}
            className="h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Detailed Description <span className="text-destructive">*</span>
          </label>
          <textarea
            {...register('description')}
            placeholder="What will students learn? Why should they take this course?"
            className="min-h-[140px] w-full resize-y rounded-md border border-input bg-background p-3 outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Category <span className="text-destructive">*</span>
            </label>
            <select
              {...register('category')}
              className="h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select category</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Level <span className="text-destructive">*</span>
            </label>
            <select
              {...register('level')}
              className="h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select level</option>
              {LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.level && <p className="mt-1 text-xs text-destructive">{errors.level.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Course Format <span className="text-destructive">*</span>
            </label>
            <select
              {...register('type')}
              className="h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select format</option>
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-xs text-destructive">{errors.type.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Language</label>
            <select
              {...register('language')}
              className="h-10 w-full rounded-md border border-input bg-background px-3 outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="ur">Urdu</option>
              <option value="fr">French</option>
              <option value="tr">Turkish</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Course Thumbnail</label>
          <div className="cursor-pointer rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:bg-muted/50">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mb-1 text-sm font-medium">Click to upload thumbnail</p>
            <p className="text-xs text-muted-foreground">16:9 aspect ratio recommended. Max 5MB.</p>
          </div>
        </div>
      </div>
    </>
  );
}
