import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  DollarSign,
  Eye,
  Save,
  Send,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useCourseDetail, useUpdateCourse, usePublishCourse, type CreateCourseInput } from './useCourses';
import { updateCourseSchema } from '@deenverse/shared';
import type { z } from 'zod';

type FormValues = z.infer<typeof updateCourseSchema>;
type Step = 'basic' | 'content' | 'pricing' | 'preview';

const STEPS: { id: Step; label: string; icon: typeof BookOpen }[] = [
  { id: 'basic', label: 'Basic Info', icon: BookOpen },
  { id: 'content', label: 'Modules & Lessons', icon: GripVertical },
  { id: 'pricing', label: 'Pricing & Settings', icon: DollarSign },
  { id: 'preview', label: 'Preview & Publish', icon: Eye },
];

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
];

const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const TYPE_OPTIONS = [
  { value: 'self-paced', label: 'Self-paced (On-demand)' },
  { value: 'instructor-led', label: 'Instructor-led (Live)' },
  { value: 'hybrid', label: 'Hybrid' },
];

const LESSON_TYPE_OPTIONS = [
  { value: 'video', label: 'Video' },
  { value: 'text', label: 'Text' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'live-session', label: 'Live Session' },
  { value: 'assignment', label: 'Assignment' },
];

export function EditCoursePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, isLoading, error } = useCourseDetail(slug ?? '');
  const updateCourse = useUpdateCourse();
  const publishCourse = usePublishCourse();
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
    getValues,
  } = useForm<FormValues>({
    resolver: zodResolver(updateCourseSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      language: 'en',
      pricing: { type: 'free', amount: 0, currency: 'usd' },
      modules: [],
      requirements: [],
      learningOutcomes: [],
      tags: [],
      certificateOnCompletion: false,
    },
  });

  const { fields: moduleFields, append: appendModule, remove: removeModule } = useFieldArray({
    control,
    name: 'modules',
  });

  // Pre-fill form with existing course data
  useEffect(() => {
    if (data?.course && !isInitialized) {
      const course = data.course;
      reset({
        title: course.title,
        description: course.description,
        shortDescription: course.shortDescription,
        category: course.category,
        level: course.level,
        language: course.language ?? 'en',
        type: course.type,
        pricing: {
          type: course.pricing.type,
          amount: course.pricing.amount ?? 0,
          currency: course.pricing.currency ?? 'usd',
        },
        modules: course.modules?.map((m, mIdx) => ({
          title: m.title,
          description: m.description ?? '',
          order: mIdx,
          lessons: m.lessons.map((l, lIdx) => ({
            title: l.title,
            type: l.type,
            order: lIdx,
            isFree: l.isFree ?? false,
            duration: l.durationMinutes,
          })),
        })) ?? [],
        requirements: (course as unknown as { requirements?: string[] }).requirements ?? [],
        learningOutcomes: course.learningOutcomes ?? [],
        tags: course.tags ?? [],
        certificateOnCompletion: course.certificateOnCompletion ?? false,
      });
      setIsInitialized(true);
    }
  }, [data, isInitialized, reset]);

  const pricingType = watch('pricing.type');
  const title = watch('title');
  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Course Not Found</h2>
        <Button onClick={() => navigate('/scholar/courses')}>Back to My Courses</Button>
      </div>
    );
  }

  const course = data.course;

  // Ownership guard
  const isOwner =
    user?._id === (course.instructor as unknown as { _id: string })?._id ||
    user?.role === 'admin';

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">You don't have permission to edit this course.</p>
        <Button onClick={() => navigate('/scholar/courses')}>Back to My Courses</Button>
      </div>
    );
  }

  const goToStep = (step: Step) => setCurrentStep(step);
  const nextStep = () => {
    const idx = STEPS.findIndex((s) => s.id === currentStep);
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1].id);
  };
  const prevStep = () => {
    const idx = STEPS.findIndex((s) => s.id === currentStep);
    if (idx > 0) setCurrentStep(STEPS[idx - 1].id);
  };

  const onSave = async (values: FormValues) => {
    if (!slug) return;
    const input: Partial<CreateCourseInput> = {
      ...values,
      modules: values.modules?.map((mod, mIdx) => ({
        ...mod,
        order: mIdx,
        lessons: (mod.lessons || []).map((l, lIdx) => ({ ...l, order: lIdx })),
      })),
    };
    await updateCourse.mutateAsync({ slug, data: input });
  };

  const handlePublish = async () => {
    if (!slug) return;
    // Save current form first if dirty
    if (isDirty) {
      await onSave(getValues());
    }
    await publishCourse.mutateAsync({ slug });
    navigate('/scholar/courses');
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    'pending-review': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    archived: 'bg-secondary text-secondary-foreground',
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/scholar/courses')}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold line-clamp-1">Edit: {course.title}</h1>
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                statusColors[course.status ?? 'draft']
              )}
            >
              {course.status ?? 'draft'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSubmit(onSave)}
              disabled={updateCourse.isPending || !isDirty}
              className="gap-2"
            >
              <Save size={16} />
              {updateCourse.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            {(course.status === 'draft' || course.status === 'archived') && (
              <Button
                size="sm"
                onClick={handlePublish}
                disabled={publishCourse.isPending || updateCourse.isPending}
                className="gap-2"
              >
                <Send size={16} />
                {publishCourse.isPending ? 'Submitting...' : 'Submit for Review'}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        {/* Progress Stepper */}
        <div className="mb-10">
          <div className="flex justify-between relative">
            <div className="absolute left-0 top-5 w-full h-1 bg-border rounded-full -z-10" />
            <div
              className="absolute left-0 top-5 h-1 bg-primary rounded-full -z-10 transition-all duration-300"
              style={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isPast = stepIndex > index;
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToStep(step.id)}
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                      isActive
                        ? 'bg-background border-primary text-primary'
                        : isPast
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-background border-border text-muted-foreground'
                    )}
                  >
                    {isPast ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                  </button>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
          <AnimatePresence mode="wait">
            {/* STEP 1: Basic Info */}
            {currentStep === 'basic' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 md:p-8 space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-1">Basic Information</h2>
                  <p className="text-muted-foreground text-sm">Core details about your course.</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Course Title <span className="text-destructive">*</span>
                    </label>
                    <input
                      {...register('title')}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-1 focus:ring-primary outline-none"
                    />
                    {errors.title && (
                      <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Short Description</label>
                    <input
                      {...register('shortDescription')}
                      maxLength={200}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Detailed Description <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      {...register('description')}
                      className="w-full p-3 min-h-[140px] rounded-md border border-input bg-background focus:ring-1 focus:ring-primary outline-none resize-y"
                    />
                    {errors.description && (
                      <p className="text-xs text-destructive mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        {...register('category')}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-1 focus:ring-primary outline-none"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Level</label>
                      <select
                        {...register('level')}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-1 focus:ring-primary outline-none"
                      >
                        {LEVEL_OPTIONS.map((l) => (
                          <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Course Format</label>
                      <select
                        {...register('type')}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-1 focus:ring-primary outline-none"
                      >
                        {TYPE_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Language</label>
                      <select
                        {...register('language')}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-1 focus:ring-primary outline-none"
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
                    <label className="block text-sm font-medium mb-2">Course Thumbnail</label>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium mb-1">Click to change thumbnail</p>
                      <p className="text-xs text-muted-foreground">16:9 aspect ratio recommended</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Modules & Lessons */}
            {currentStep === 'content' && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 md:p-8 space-y-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Curriculum Builder</h2>
                    <p className="text-muted-foreground text-sm">Organize your course into modules and lessons.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      appendModule({ title: 'New Module', description: '', order: moduleFields.length, lessons: [] })
                    }
                  >
                    <Plus size={16} /> Add Module
                  </Button>
                </div>

                {moduleFields.length === 0 ? (
                  <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
                    <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No modules yet. Click "Add Module" to start.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {moduleFields.map((_modField, mIdx) => (
                      <EditModuleBlock
                        key={_modField.id}
                        mIdx={mIdx}
                        register={register}
                        control={control}
                        onRemove={() => removeModule(mIdx)}
                      />
                    ))}
                  </div>
                )}

                <EditStringListField label="Requirements" name="requirements" control={control} placeholder="E.g. Basic Arabic reading" />
                <EditStringListField label="Learning Outcomes" name="learningOutcomes" control={control} placeholder="E.g. Understand Tajweed rules" />
                <EditStringListField label="Tags" name="tags" control={control} placeholder="E.g. tajweed" />
              </motion.div>
            )}

            {/* STEP 3: Pricing & Settings */}
            {currentStep === 'pricing' && (
              <motion.div
                key="pricing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 md:p-8 space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-1">Pricing & Settings</h2>
                  <p className="text-muted-foreground text-sm">Configure access to your course.</p>
                </div>

                {course.status === 'published' && (
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      Pricing type cannot be changed on a published course.
                    </p>
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">Pricing Type</label>
                    <div className="flex gap-3 flex-wrap">
                      {(['free', 'paid', 'subscription'] as const).map((pt) => (
                        <label key={pt} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            {...register('pricing.type')}
                            value={pt}
                            disabled={course.status === 'published'}
                            className="accent-primary"
                          />
                          <span className="text-sm capitalize">{pt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {pricingType === 'paid' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Price</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register('pricing.amount', { valueAsNumber: true })}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-1 focus:ring-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Currency</label>
                        <select
                          {...register('pricing.currency')}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-1 focus:ring-primary outline-none"
                        >
                          <option value="usd">USD ($)</option>
                          <option value="eur">EUR (€)</option>
                          <option value="gbp">GBP (£)</option>
                          <option value="sar">SAR (ر.س)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">Max Students (0 = unlimited)</label>
                    <input
                      type="number"
                      min="0"
                      {...register('maxStudents', { valueAsNumber: true })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('certificateOnCompletion')}
                      className="rounded h-4 w-4 accent-primary"
                    />
                    <span className="text-sm font-medium">Issue certificate on completion</span>
                  </label>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Preview & Publish */}
            {currentStep === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 md:p-8 space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-1">Preview & Actions</h2>
                  <p className="text-muted-foreground text-sm">Current state of your course.</p>
                </div>

                <div className="bg-muted/30 rounded-xl p-6 space-y-3">
                  <h3 className="font-bold text-lg">{title || course.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium capitalize', statusColors[course.status ?? 'draft'])}>
                      {course.status ?? 'draft'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium capitalize">
                      {course.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground font-medium capitalize">
                      {course.level}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-medium">
                      {moduleFields.length} module{moduleFields.length !== 1 ? 's' : ''}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-muted text-muted-foreground font-medium">
                      {course.enrollmentCount} enrolled
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {isDirty && (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={handleSubmit(onSave)}
                      disabled={updateCourse.isPending}
                    >
                      <Save size={16} />
                      {updateCourse.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
                  {(course.status === 'draft' || course.status === 'archived') && (
                    <Button
                      className="w-full gap-2"
                      onClick={handlePublish}
                      disabled={publishCourse.isPending || updateCourse.isPending}
                    >
                      <Send size={16} />
                      {publishCourse.isPending ? 'Submitting...' : 'Submit for Review'}
                    </Button>
                  )}
                  {course.status === 'published' && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <CheckCircle2 size={16} />
                      This course is live and visible to students.
                    </div>
                  )}
                  {course.status === 'pending-review' && (
                    <div className="flex items-center gap-2 text-amber-600 text-sm font-medium p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <AlertCircle size={16} />
                      Under review — our team will respond within 1–2 business days.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevStep} disabled={stepIndex === 0} className="gap-2">
            <ChevronLeft size={16} /> Previous
          </Button>
          {currentStep !== 'preview' && (
            <Button onClick={nextStep} className="gap-2">
              Next <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Module Block ──────────────────────────────────────

interface EditModuleBlockProps {
  mIdx: number;
  register: ReturnType<typeof useForm<FormValues>>['register'];
  control: ReturnType<typeof useForm<FormValues>>['control'];
  onRemove: () => void;
}

function EditModuleBlock({ mIdx, register, control, onRemove }: EditModuleBlockProps) {
  const { fields, append, remove } = useFieldArray({ control, name: `modules.${mIdx}.lessons` });

  return (
    <div className="border border-border rounded-xl bg-muted/20 overflow-hidden">
      <div className="px-4 py-3 bg-muted/40 border-b flex items-center gap-3">
        <GripVertical size={16} className="text-muted-foreground" />
        <span className="text-sm text-muted-foreground shrink-0">Module {mIdx + 1}:</span>
        <input
          {...register(`modules.${mIdx}.title`)}
          className="bg-transparent border-none outline-none p-0 text-foreground flex-1 font-semibold"
          placeholder="Module title"
        />
        <button type="button" onClick={onRemove} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded">
          <Trash2 size={16} />
        </button>
      </div>
      <div className="p-4 space-y-3">
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No lessons yet.</p>
        ) : (
          fields.map((lField, lIdx) => (
            <div key={lField.id} className="flex items-center gap-3 bg-background border border-border p-3 rounded-lg">
              <GripVertical size={16} className="text-muted-foreground" />
              <select
                {...register(`modules.${mIdx}.lessons.${lIdx}.type`)}
                className="h-8 px-2 text-sm rounded-md border border-input bg-background outline-none"
              >
                {LESSON_TYPE_OPTIONS.map((lt) => (
                  <option key={lt.value} value={lt.value}>{lt.label}</option>
                ))}
              </select>
              <input
                {...register(`modules.${mIdx}.lessons.${lIdx}.title`)}
                className="flex-1 h-8 px-2 text-sm rounded-md border border-input bg-background outline-none"
                placeholder="Lesson title"
              />
              <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer shrink-0">
                <input type="checkbox" {...register(`modules.${mIdx}.lessons.${lIdx}.isFree`)} className="accent-primary h-3.5 w-3.5" />
                Free preview
              </label>
              <button type="button" onClick={() => remove(lIdx)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
        <button
          type="button"
          onClick={() => append({ title: 'New Lesson', type: 'video', order: fields.length, isFree: false })}
          className="w-full py-2 text-sm text-primary border border-dashed border-primary/40 rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Add Lesson
        </button>
      </div>
    </div>
  );
}

// ── String List Field ─────────────────────────────────

interface EditStringListFieldProps {
  label: string;
  name: 'requirements' | 'learningOutcomes' | 'tags';
  control: ReturnType<typeof useForm<FormValues>>['control'];
  placeholder?: string;
}

function EditStringListField({ label, name, control, placeholder }: EditStringListFieldProps) {
  const [input, setInput] = useState('');
  const { fields, append, remove } = useFieldArray({ control, name: name as never });

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="space-y-2">
        {(fields as Array<{ id: string }>).map((field, idx) => (
          <Controller
            key={field.id}
            control={control}
            name={`${name}.${idx}` as never}
            render={({ field: f }) => (
              <div className="flex items-center gap-2">
                <input {...f} className="flex-1 h-9 px-3 text-sm rounded-md border border-input bg-background outline-none" />
                <button type="button" onClick={() => remove(idx)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          />
        ))}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (input.trim()) { append(input.trim() as never); setInput(''); }
              }
            }}
            placeholder={placeholder}
            className="flex-1 h-9 px-3 text-sm rounded-md border border-input bg-background outline-none"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => { if (input.trim()) { append(input.trim() as never); setInput(''); } }}>
            <Plus size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
