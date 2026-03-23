import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UpdateClassroom } from '@deenverse/shared';
import { updateClassroomSchema } from '@deenverse/shared';
import {
  BookOpen,
  Calendar,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Hand,
  MessageSquare,
  Mic,
  Monitor,
  Settings,
  Type,
  Users,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { useMyTeaching } from '@/features/courses/useCourses';
import { useClassroomDetail, useUpdateClassroom } from './useClassroom';

const CLASSROOM_TYPES = [
  { id: 'lecture', label: 'Lecture', icon: BookOpen },
  { id: 'halaqa', label: 'Halaqa', icon: Users },
  { id: 'quran-session', label: 'Quran Session', icon: BookOpen },
  { id: 'qa-session', label: 'Q&A Session', icon: MessageSquare },
  { id: 'workshop', label: 'Workshop', icon: Settings },
  { id: 'open', label: 'Open Discussion', icon: Users },
] as const;

const DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240] as const;

const SETTING_TOGGLES = [
  { id: 'chatEnabled', label: 'Enable Chat', icon: MessageSquare },
  { id: 'handRaiseEnabled', label: 'Allow Hand Raising', icon: Hand },
  { id: 'whiteboardEnabled', label: 'Enable Whiteboard', icon: Monitor },
  { id: 'recordingEnabled', label: 'Record Session', icon: Video },
  { id: 'participantAudio', label: 'Participants can unmute', icon: Mic },
  { id: 'participantVideo', label: 'Participants can share video', icon: Camera },
  { id: 'autoAdmit', label: 'Auto-admit (No waiting room)', icon: Users },
] as const;

type SettingKey = (typeof SETTING_TOGGLES)[number]['id'];

export function EditClassroomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState(1);
  const [linkCourse, setLinkCourse] = useState(false);

  const { data: classroomData, isLoading } = useClassroomDetail(id ?? '');
  const { data: teachingData } = useMyTeaching('published');
  const updateMutation = useUpdateClassroom();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateClassroom>({
    resolver: zodResolver(updateClassroomSchema) as unknown as Resolver<UpdateClassroom>,
  });

  // Pre-fill form when classroom data loads
  useEffect(() => {
    if (!classroomData?.classroom) return;
    const c = classroomData.classroom;
    const courseSlug =
      typeof c.course === 'object' && c.course ? c.course.slug : undefined;

    reset({
      title: c.title,
      description: c.description ?? '',
      type: c.type,
      scheduledAt: c.scheduledAt,
      duration: c.duration,
      maxParticipants: c.maxParticipants,
      access: c.access,
      courseSlug,
      lessonId: c.lessonId,
      settings: c.settings ?? {},
    });

    if (courseSlug) setLinkCourse(true);

    // Pre-fill date/time inputs
    if (c.scheduledAt) {
      const dt = new Date(c.scheduledAt);
      const dateEl = document.getElementById('date') as HTMLInputElement | null;
      const timeEl = document.getElementById('time') as HTMLInputElement | null;
      if (dateEl) dateEl.value = dt.toISOString().slice(0, 10);
      if (timeEl) timeEl.value = dt.toISOString().slice(11, 16);
    }
  }, [classroomData, reset]);

  const selectedType = useWatch({ control, name: 'type' });
  const selectedCourseSlug = useWatch({ control, name: 'courseSlug' });
  const settings = useWatch({ control, name: 'settings' });

  if (user && user.role !== 'scholar' && user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Only scholars can edit classroom sessions.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const selectedCourse = teachingData?.courses.find((c) => c.slug === selectedCourseSlug);
  const lessons =
    selectedCourse?.modules?.flatMap((m) =>
      m.lessons.map((l) => ({ id: l._id, title: `${m.title} — ${l.title}` })),
    ) ?? [];

  const handleDateTimeChange = (date: string, time: string) => {
    if (date && time) {
      const iso = new Date(`${date}T${time}`).toISOString();
      setValue('scheduledAt', iso);
    }
  };

  const onSubmit = (data: UpdateClassroom) => {
    if (!id) return;
    const payload = { ...data };
    if (!linkCourse) {
      delete payload.courseSlug;
      delete payload.lessonId;
    }
    updateMutation.mutate(
      { id, data: payload },
      { onSuccess: () => navigate('/scholar/classrooms') },
    );
  };

  return (
    <div className="min-h-full p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Edit Session</h1>
          <p className="text-muted-foreground text-sm mt-1">Update your classroom session details</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
            {[
              { num: 1, label: 'Basic Info' },
              { num: 2, label: 'Schedule' },
              { num: 3, label: 'Settings' },
            ].map(({ num, label }) => (
              <div key={num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium border-2 transition-colors duration-300 ${
                    step >= num
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-background border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  {step > num ? <Check className="w-5 h-5" /> : num}
                </div>
                <span
                  className={`absolute top-12 text-xs font-medium whitespace-nowrap ${
                    step >= num ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-card rounded-xl shadow-sm border p-6 md:p-8 min-h-[480px] flex flex-col mt-8">
            <div className="flex-1">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Type className="w-5 h-5 text-primary" />
                    Basic Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Session Title *</Label>
                      <Input
                        id="title"
                        {...register('title')}
                        placeholder="e.g. Introduction to Tajweed Rules"
                      />
                      {errors.title && (
                        <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...register('description')}
                        rows={4}
                        placeholder="What will students learn in this session?"
                      />
                    </div>

                    <div>
                      <Label>Session Type</Label>
                      <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                            {CLASSROOM_TYPES.map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => field.onChange(t.id)}
                                className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                                  selectedType === t.id
                                    ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                    : 'border-border hover:border-primary/30 hover:bg-muted text-muted-foreground'
                                }`}
                              >
                                <t.icon
                                  className={`w-5 h-5 ${
                                    selectedType === t.id
                                      ? 'text-primary'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                                <span className="text-sm font-medium">{t.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Schedule & Course Link */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Schedule &amp; Course Link
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        onChange={(e) => {
                          const timeEl = document.getElementById('time') as HTMLInputElement;
                          handleDateTimeChange(e.target.value, timeEl?.value ?? '');
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time *</Label>
                      <Input
                        id="time"
                        type="time"
                        onChange={(e) => {
                          const dateEl = document.getElementById('date') as HTMLInputElement;
                          handleDateTimeChange(dateEl?.value ?? '', e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  {errors.scheduledAt && (
                    <p className="text-sm text-destructive">{errors.scheduledAt.message}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Duration</Label>
                      <Controller
                        name="duration"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value != null ? String(field.value) : '60'}
                            onValueChange={(v) => field.onChange(Number(v))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              {DURATIONS.map((d) => (
                                <SelectItem key={d} value={String(d)}>
                                  {d} minutes
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div>
                      <Label>Max Participants</Label>
                      <Input
                        type="number"
                        {...register('maxParticipants', { valueAsNumber: true })}
                        min={2}
                        max={500}
                      />
                    </div>
                  </div>

                  {/* Course Link Toggle */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        id="linkCourse"
                        checked={linkCourse}
                        onChange={(e) => {
                          setLinkCourse(e.target.checked);
                          if (!e.target.checked) {
                            setValue('courseSlug', undefined);
                            setValue('lessonId', undefined);
                          }
                        }}
                        className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                      />
                      <Label htmlFor="linkCourse" className="cursor-pointer">
                        Link to Course
                      </Label>
                    </div>

                    {linkCourse && (
                      <div className="space-y-3 pl-7">
                        <div>
                          <Label>Course</Label>
                          <Controller
                            name="courseSlug"
                            control={control}
                            render={({ field }) => (
                              <Select
                                value={field.value ?? ''}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                  {teachingData?.courses.map((c) => (
                                    <SelectItem key={c.slug} value={c.slug ?? c._id}>
                                      {c.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        {lessons.length > 0 && (
                          <div>
                            <Label>Lesson (optional)</Label>
                            <Controller
                              name="lessonId"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  value={field.value ?? ''}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a lesson" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {lessons.map((l) => (
                                      <SelectItem key={l.id} value={l.id}>
                                        {l.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Settings */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Classroom Settings
                  </h2>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <Label>Access Control</Label>
                      <Controller
                        name="access"
                        control={control}
                        render={({ field }) => (
                          <div className="space-y-2">
                            {[
                              {
                                id: 'course-only' as const,
                                label: 'Course Students Only',
                                desc: 'Only enrolled students can join',
                              },
                              {
                                id: 'followers' as const,
                                label: 'My Followers',
                                desc: 'Anyone following your profile',
                              },
                              {
                                id: 'public' as const,
                                label: 'Public Open',
                                desc: 'Any registered user on DeenVerse',
                              },
                            ].map((acc) => (
                              <label
                                key={acc.id}
                                className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                                  field.value === acc.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:bg-muted'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="access"
                                  value={acc.id}
                                  checked={field.value === acc.id}
                                  onChange={() => field.onChange(acc.id)}
                                  className="mt-1 text-primary focus:ring-primary"
                                />
                                <div className="ml-3">
                                  <span className="block text-sm font-medium">{acc.label}</span>
                                  <span className="block text-xs text-muted-foreground">
                                    {acc.desc}
                                  </span>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      />
                    </div>

                    <div>
                      <Label>Features &amp; Privacy</Label>
                      <div className="space-y-3 bg-muted/50 p-4 rounded-xl border mt-2">
                        {SETTING_TOGGLES.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between p-2"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-background rounded-md shadow-sm text-muted-foreground">
                                <s.icon className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium">{s.label}</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings?.[s.id as SettingKey] ?? false}
                                onChange={(e) =>
                                  setValue(`settings.${s.id as SettingKey}`, e.target.checked)
                                }
                              />
                              <div className="w-9 h-5 bg-muted-foreground/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="mt-8 pt-6 border-t flex items-center justify-between">
              {step > 1 ? (
                <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/scholar/classrooms')}
                >
                  Cancel
                </Button>
              )}

              {step < 3 ? (
                <Button type="button" onClick={() => setStep((s) => s + 1)}>
                  Next Step <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={updateMutation.isPending}>
                  <Check className="w-4 h-4 mr-1" />
                  {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
