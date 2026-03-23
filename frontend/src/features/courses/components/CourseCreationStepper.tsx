import { CheckCircle2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface CourseCreationStepperProps {
  currentStep: string;
  steps: StepperItem[];
  onStepSelect: (step: string) => void;
}

export function CourseCreationStepper({
  currentStep,
  steps,
  onStepSelect,
}: CourseCreationStepperProps) {
  const stepIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="mb-10">
      <div className="relative flex justify-between">
        <div className="absolute left-0 top-5 -z-10 h-1 w-full rounded-full bg-border" />
        <div
          className="absolute left-0 top-5 -z-10 h-1 rounded-full bg-primary transition-all duration-300"
          style={{ width: `${(stepIndex / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isPast = stepIndex > index;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => onStepSelect(step.id)}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                  isActive
                    ? 'border-primary bg-background text-primary'
                    : isPast
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground'
                )}
              >
                {isPast ? <CheckCircle2 size={18} /> : <Icon size={18} />}
              </button>
              <span className={cn('text-xs font-medium', isActive ? 'text-primary' : 'text-muted-foreground')}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
