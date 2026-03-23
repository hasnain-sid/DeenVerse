import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye,
  GripVertical,
  Plus,
  Save,
  Send,
} from 'lucide-react';
import type { z } from 'zod';
import { createCourseSchema } from '@deenverse/shared';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { CourseBasicsStep } from './components/CourseBasicsStep';
import { CourseCreationStepper } from './components/CourseCreationStepper';
import { ModuleEditor } from './components/ModuleEditor';
import { CoursePreviewStep } from './components/CoursePreviewStep';
import { PricingForm } from './components/PricingForm';
import { StringListField } from './components/StringListField';
import { useCreateCourse, type CreateCourseInput } from './useCourses';

type FormValues = z.infer<typeof createCourseSchema>; type Step = 'basic' | 'content' | 'pricing' | 'preview';
const STEPS: Array<{ id: Step; label: string; icon: typeof BookOpen }> = [
  { id: 'basic', label: 'Basic Info', icon: BookOpen },
  { id: 'content', label: 'Modules & Lessons', icon: GripVertical },
  { id: 'pricing', label: 'Pricing & Settings', icon: DollarSign },
  { id: 'preview', label: 'Preview & Publish', icon: Eye },
];

const LESSON_TYPE_OPTIONS = [
  { value: 'video', label: 'Video' },
  { value: 'text', label: 'Text' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'live-session', label: 'Live Session' },
  { value: 'assignment', label: 'Assignment' },
] as const;
export function CreateCoursePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const createCourse = useCreateCourse();
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormValues>({
    resolver: zodResolver(createCourseSchema) as unknown as Resolver<FormValues>,
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

  const pricingType = useWatch({ control, name: 'pricing.type' });
  const title = useWatch({ control, name: 'title' });
  const description = useWatch({ control, name: 'description' });
  const category = useWatch({ control, name: 'category' });
  const level = useWatch({ control, name: 'level' });
  const stepIndex = STEPS.findIndex((step) => step.id === currentStep);

  if (user && user.role !== 'scholar' && user.role !== 'admin') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-amber-500" />
        <h2 className="mb-2 text-xl font-bold">Scholar Access Required</h2>
        <p className="mb-4 text-muted-foreground">Only verified scholars can create courses.</p>
        <Button onClick={() => navigate('/scholar/apply')}>Apply to Become a Scholar</Button>
      </div>
    );
  }

  const goToStep = (step: Step) => setCurrentStep(step);
  const nextStep = () => {
    const nextIndex = STEPS.findIndex((step) => step.id === currentStep) + 1;
    if (nextIndex < STEPS.length) setCurrentStep(STEPS[nextIndex].id);
  };
  const prevStep = () => {
    const prevIndex = STEPS.findIndex((step) => step.id === currentStep) - 1;
    if (prevIndex >= 0) setCurrentStep(STEPS[prevIndex].id);
  };

  const buildCourseInput = (values: FormValues): CreateCourseInput => ({
    ...values,
    modules: values.modules?.map((module, moduleIndex) => ({
      ...module,
      order: moduleIndex,
      lessons: module.lessons.map((lesson, lessonIndex) => ({
        ...lesson,
        order: lessonIndex,
      })),
    })),
  });

  const onSubmit = async (values: FormValues) => {
    const result = await createCourse.mutateAsync(buildCourseInput(values));
    navigate(`/scholar/courses/${result.course.slug}/edit`);
  };

  const handleSaveDraft = async () => {
    await createCourse.mutateAsync(buildCourseInput(getValues()));
    navigate('/scholar/courses');
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/scholar/courses')}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold">Create New Course</h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              Draft
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveDraft}
              disabled={createCourse.isPending}
              className="gap-2"
            >
              <Save size={16} />
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit(onSubmit)}
              disabled={createCourse.isPending}
              className="gap-2"
            >
              <Send size={16} />
              {createCourse.isPending ? 'Creating...' : 'Submit for Review'}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-4xl px-4">
        <CourseCreationStepper
          currentStep={currentStep}
          steps={STEPS}
          onStepSelect={(step) => goToStep(step as Step)}
        />

        <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
          <AnimatePresence mode="wait">
            {currentStep === 'basic' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 p-6 md:p-8"
              >
                <CourseBasicsStep register={register} errors={errors} />
              </motion.div>
            )}

            {currentStep === 'content' && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 p-6 md:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="mb-1 text-2xl font-bold">Curriculum Builder</h2>
                    <p className="text-sm text-muted-foreground">
                      Organize your course into modules and lessons.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      appendModule({
                        title: 'New Module',
                        description: '',
                        order: moduleFields.length,
                        lessons: [],
                      })
                    }
                  >
                    <Plus size={16} />
                    Add Module
                  </Button>
                </div>

                {moduleFields.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
                    <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No modules yet. Click &quot;Add Module&quot; to start building your curriculum.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {moduleFields.map((moduleField, moduleIndex) => (
                      <ModuleEditor
                        key={moduleField.id}
                        moduleIndex={moduleIndex}
                        register={register}
                        control={control}
                        lessonTypeOptions={LESSON_TYPE_OPTIONS}
                        onRemove={() => removeModule(moduleIndex)}
                      />
                    ))}
                  </div>
                )}

                <StringListField
                  label="Requirements"
                  name="requirements"
                  control={control}
                  placeholder="E.g. Basic Arabic reading"
                />
                <StringListField
                  label="Learning Outcomes"
                  name="learningOutcomes"
                  control={control}
                  placeholder="E.g. Understand rules of Tajweed"
                />
                <StringListField
                  label="Tags"
                  name="tags"
                  control={control}
                  placeholder="E.g. tajweed"
                />
              </motion.div>
            )}

            {currentStep === 'pricing' && (
              <motion.div
                key="pricing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 p-6 md:p-8"
              >
                <div>
                  <h2 className="mb-1 text-2xl font-bold">Pricing &amp; Settings</h2>
                  <p className="text-sm text-muted-foreground">
                    Configure how students access your course.
                  </p>
                </div>
                <PricingForm pricingType={pricingType} register={register} />
              </motion.div>
            )}

            {currentStep === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 p-6 md:p-8"
              >
                <CoursePreviewStep
                  title={title}
                  description={description}
                  category={category}
                  level={level}
                  moduleCount={moduleFields.length}
                  isPending={createCourse.isPending}
                  onSubmit={handleSubmit(onSubmit)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={stepIndex === 0} className="gap-2">
            <ChevronLeft size={16} />
            Previous
          </Button>
          {currentStep !== 'preview' && (
            <Button onClick={nextStep} className="gap-2">
              Next
              <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
