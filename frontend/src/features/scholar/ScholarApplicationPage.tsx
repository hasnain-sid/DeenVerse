import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  Plus,
  Trash2,
  Video,
  GraduationCap,
  BookOpen,
  Languages,
  Sparkles,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { scholarApplicationSchema, type ScholarApplication } from '@deenverse/shared';
import { useApplicationStatus, useApplyForScholar } from './useScholar';

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

const SPECIALTIES: Array<{ value: string; label: string }> = [
  { value: 'tafseer', label: 'Tafseer' },
  { value: 'hadith', label: 'Hadith' },
  { value: 'fiqh', label: 'Fiqh' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'tajweed', label: 'Tajweed' },
  { value: 'aqeedah', label: 'Aqeedah' },
  { value: 'seerah', label: 'Seerah' },
  { value: 'dawah', label: "Da'wah" },
];

const LANGUAGES: Array<{ value: string; label: string }> = [
  { value: 'en', label: 'English (EN)' },
  { value: 'ar', label: 'Arabic (AR)' },
  { value: 'ur', label: 'Urdu (UR)' },
  { value: 'fr', label: 'French (FR)' },
  { value: 'tr', label: 'Turkish (TR)' },
  { value: 'bn', label: 'Bengali (BN)' },
];

const STEPS = [
  { id: 1, title: 'Credentials', icon: GraduationCap },
  { id: 2, title: 'Specialties', icon: BookOpen },
  { id: 3, title: 'Bio & Languages', icon: Languages },
  { id: 4, title: 'Video Intro', icon: Video },
];

// ────────────────────────────────────────────────────────────────────────────
// Status banner shown when user has already applied
// ────────────────────────────────────────────────────────────────────────────

function ApplicationStatusBanner({
  status,
  rejectionReason,
}: {
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}) {
  if (status === 'pending') {
    return (
      <div className="flex items-start gap-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-5">
        <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-amber-800 dark:text-amber-200">
            Application Under Review
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            Alhamdulillah, your application has been received. Our moderation team will review
            your credentials and contact you within 3–5 business days.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <div className="flex items-start gap-4 rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30 p-5">
        <Check className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-green-800 dark:text-green-200">
            Congratulations — Scholar Verified ✓
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Your application has been approved. You now have full scholar access on DeenVerse.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-5">
      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
      <div>
        <h3 className="font-semibold text-red-800 dark:text-red-200">Application Not Approved</h3>
        {rejectionReason && (
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">{rejectionReason}</p>
        )}
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
          You may re-apply after addressing the feedback above.
        </p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main page component
// ────────────────────────────────────────────────────────────────────────────

export function ScholarApplicationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const { data: statusData, isLoading: statusLoading } = useApplicationStatus();
  const applyMutation = useApplyForScholar();

  // React Hook Form with Zod validation
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ScholarApplication>({
    resolver: zodResolver(scholarApplicationSchema),
    defaultValues: {
      credentials: [{ institution: '', title: '', year: new Date().getFullYear() }],
      specialties: [],
      bio: '',
      teachingLanguages: [],
      videoIntroUrl: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'credentials' });

  const watchedSpecialties = watch('specialties');
  const watchedLanguages = watch('teachingLanguages');

  // ── Toggle helpers ──────────────────────────────
  const toggleSpecialty = (value: string) => {
    const current = getValues('specialties') as string[];
    const updated = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value];
    setValue('specialties', updated as ScholarApplication['specialties'], {
      shouldValidate: true,
    });
  };

  const toggleLanguage = (value: string) => {
    const current = getValues('teachingLanguages');
    const updated = current.includes(value)
      ? current.filter((l) => l !== value)
      : [...current, value];
    setValue('teachingLanguages', updated, { shouldValidate: true });
  };

  // ── Navigation ──────────────────────────────────
  const nextStep = () => setStep((s) => Math.min(4, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  // ── Submit ──────────────────────────────────────
  const onSubmit = async (data: ScholarApplication) => {
    try {
      await applyMutation.mutateAsync(data);
      toast.success("Application submitted! We'll review it within 3-5 business days.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to submit application. Please try again.';
      toast.error(message);
    }
  };

  // ── Already applied states ──────────────────────
  const applicationStatus = statusData?.status;

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Approved — no need to show form
  if (applicationStatus === 'approved') {
    return (
      <div className="max-w-2xl mx-auto w-full py-12 px-4">
        <ApplicationStatusBanner status="approved" />
      </div>
    );
  }

  // Success state after submission
  if (applyMutation.isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center space-y-6 px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
        >
          <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
        </motion.div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-3xl font-bold">Application Submitted</h2>
          <p className="text-muted-foreground">
            Alhamdulillah. We have received your scholar application. Our moderation team will
            review your credentials and get back to you within 3–5 business days.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full py-8 px-4 text-foreground">
      {/* Status banner for pending / rejected */}
      {(applicationStatus === 'pending' || applicationStatus === 'rejected') && (
        <div className="mb-8">
          <ApplicationStatusBanner
            status={applicationStatus}
            rejectionReason={statusData?.rejectionReason}
          />
          {applicationStatus === 'pending' && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              You can update your application below while it is under review.
            </p>
          )}
        </div>
      )}

      {/* Page heading */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Scholar Application</h1>

        {/* Step progress bar */}
        <div className="flex justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -z-10 -translate-y-1/2 rounded-full" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
          {STEPS.map((s) => {
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            return (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 shadow-sm border-2
                    ${isActive
                      ? 'bg-primary text-primary-foreground border-primary scale-110'
                      : isCompleted
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-muted'
                    }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-border/50 shadow-lg relative overflow-hidden">
          {/* Subtle decorative background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2" />

          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* ── STEP 1: CREDENTIALS ─────────────────────────────── */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        Academic &amp; Islamic Credentials
                      </h2>
                      <p className="text-muted-foreground">
                        Please list your verified Ijazahs, degrees, or institutional
                        certifications.
                      </p>
                    </div>

                    {errors.credentials?.root && (
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.credentials.root.message}
                      </p>
                    )}

                    <div className="space-y-6">
                      {fields.map((field, i) => (
                        <div
                          key={field.id}
                          className="p-4 rounded-xl border bg-card relative group"
                        >
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => remove(i)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <Label htmlFor={`credentials.${i}.institution`}>
                                Institution / Sheikh
                              </Label>
                              <Input
                                id={`credentials.${i}.institution`}
                                placeholder="e.g. Al-Azhar University"
                                {...register(`credentials.${i}.institution`)}
                              />
                              {errors.credentials?.[i]?.institution && (
                                <p className="text-xs text-destructive">
                                  {errors.credentials[i]!.institution!.message}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`credentials.${i}.title`}>Title / Degree</Label>
                              <Input
                                id={`credentials.${i}.title`}
                                placeholder="e.g. BA in Islamic Jurisprudence"
                                {...register(`credentials.${i}.title`)}
                              />
                              {errors.credentials?.[i]?.title && (
                                <p className="text-xs text-destructive">
                                  {errors.credentials[i]!.title!.message}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div className="space-y-2">
                              <Label htmlFor={`credentials.${i}.year`}>Year Earned</Label>
                              <Input
                                id={`credentials.${i}.year`}
                                placeholder="YYYY"
                                type="number"
                                {...register(`credentials.${i}.year`, {
                                  valueAsNumber: true,
                                })}
                              />
                              {errors.credentials?.[i]?.year && (
                                <p className="text-xs text-destructive">
                                  {errors.credentials[i]!.year!.message}
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full border-dashed"
                              disabled
                            >
                              <Upload className="w-4 h-4 mr-2" /> Upload Certificate
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          append({ institution: '', title: '', year: new Date().getFullYear() })
                        }
                        className="w-full border-2 border-dashed h-14"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Another Credential
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: SPECIALTIES ─────────────────────────────── */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Areas of Expertise</h2>
                      <p className="text-muted-foreground">
                        Select the primary areas where you are qualified to issue guidance or
                        teach.
                      </p>
                    </div>

                    {errors.specialties && (
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.specialties.message as string}
                      </p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {SPECIALTIES.map(({ value, label }) => {
                        const isSelected = watchedSpecialties?.includes(
                          value as ScholarApplication['specialties'][number]
                        );
                        return (
                          <div
                            key={value}
                            onClick={() => toggleSpecialty(value)}
                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-3 h-32 text-center
                              ${
                                isSelected
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-border/50 hover:border-primary/30'
                              }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <Sparkles className="w-5 h-5" />
                            </div>
                            <span className="font-semibold">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── STEP 3: BIO & LANGUAGES ─────────────────────────── */}
                {step === 3 && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Scholar Biography</h2>
                        <p className="text-muted-foreground">
                          This bio will be visible on your public Scholar profile.
                        </p>
                      </div>
                      <Textarea
                        placeholder="Share your journey, teaching philosophy, and background... (minimum 50 characters)"
                        className="min-h-[150px] resize-y"
                        {...register('bio')}
                      />
                      {errors.bio && (
                        <p className="text-sm text-destructive flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {errors.bio.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold">Teaching Languages</h3>
                        <p className="text-sm text-muted-foreground">
                          Which languages are you comfortable teaching in?
                        </p>
                      </div>

                      {errors.teachingLanguages && (
                        <p className="text-sm text-destructive flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {errors.teachingLanguages.message as string}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {LANGUAGES.map(({ value, label }) => (
                          <Badge
                            key={value}
                            variant={watchedLanguages?.includes(value) ? 'default' : 'outline'}
                            className="cursor-pointer text-sm py-1.5 px-3"
                            onClick={() => toggleLanguage(value)}
                          >
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: VIDEO INTRO & REVIEW ────────────────────── */}
                {step === 4 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Video Introduction</h2>
                      <p className="text-muted-foreground">
                        Optionally provide a link to a short 1–2 minute video introducing
                        yourself to the community. Unlisted YouTube or Vimeo links work best.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="videoIntroUrl">Video URL (optional)</Label>
                      <div className="relative">
                        <Video className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="videoIntroUrl"
                          placeholder="https://youtube.com/watch?v=..."
                          className="pl-10"
                          {...register('videoIntroUrl')}
                        />
                      </div>
                      {errors.videoIntroUrl && (
                        <p className="text-sm text-destructive flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {errors.videoIntroUrl.message}
                        </p>
                      )}
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-200">
                      <strong className="block mb-1">Before you submit:</strong>
                      By submitting this application, you attest that all provided credentials
                      are real and that you agree to abide by the DeenVerse Scholar Code of
                      Ethics. False claims may result in an immediate permanent ban.
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <CardFooter className="p-8 pt-0 flex justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1 || applyMutation.isPending}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            {step < 4 ? (
              <Button type="button" onClick={nextStep} className="px-8">
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={applyMutation.isPending}
                className="px-8 bg-green-600 hover:bg-green-700 text-white"
              >
                {applyMutation.isPending ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Submit Application <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
