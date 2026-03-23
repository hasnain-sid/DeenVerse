import { useDeferredValue, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe,
  Lock,
  Radio,
  Search,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import type { ClassroomType } from '@deenverse/shared';
import { addDays, format, formatDistanceToNow, isSameDay, startOfWeek } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useClassrooms, useUpcomingClassrooms, type ClassroomSummary } from './useClassroom';

interface ClassroomTypeOption {
  value: ClassroomType | 'all';
  label: string;
}

interface ClassroomTypeMeta {
  label: string;
  badgeClassName: string;
}

const CLASSROOM_TYPE_OPTIONS: ClassroomTypeOption[] = [
  { value: 'all', label: 'All Types' },
  { value: 'lecture', label: 'Lectures' },
  { value: 'halaqa', label: 'Halaqas' },
  { value: 'quran-session', label: 'Quran' },
  { value: 'qa-session', label: 'Q&A' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'open', label: 'Open' },
];

const CLASSROOM_TYPE_META: Record<ClassroomType, ClassroomTypeMeta> = {
  lecture: {
    label: 'Lecture',
    badgeClassName: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
  },
  halaqa: {
    label: 'Halaqa',
    badgeClassName: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  'quran-session': {
    label: 'Quran Session',
    badgeClassName: 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300',
  },
  'qa-session': {
    label: 'Q&A',
    badgeClassName: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  },
  workshop: {
    label: 'Workshop',
    badgeClassName: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
  },
  open: {
    label: 'Open',
    badgeClassName: 'bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300',
  },
};

const ACCESS_META = {
  public: {
    label: 'Public',
    icon: Globe,
    className: 'text-emerald-700 dark:text-emerald-300',
  },
  followers: {
    label: 'Followers',
    icon: UserRound,
    className: 'text-slate-600 dark:text-slate-300',
  },
  'course-only': {
    label: 'Course Only',
    icon: Lock,
    className: 'text-amber-700 dark:text-amber-300',
  },
} as const;

function getAccessMeta(access: string) {
  if (access in ACCESS_META) {
    return ACCESS_META[access as keyof typeof ACCESS_META];
  }

  return ACCESS_META.public;
}

function asDate(value?: string) {
  return value ? new Date(value) : null;
}

function formatLiveDuration(classroom: ClassroomSummary) {
  const startedAt = asDate(classroom.startedAt ?? classroom.scheduledAt);
  if (!startedAt) {
    return 'Live now';
  }

  return `Started ${formatDistanceToNow(startedAt, { addSuffix: true })}`;
}

function formatStartsIn(classroom: ClassroomSummary) {
  const scheduledAt = asDate(classroom.scheduledAt);
  if (!scheduledAt) {
    return 'Scheduled soon';
  }

  return `Starts ${formatDistanceToNow(scheduledAt, { addSuffix: true })}`;
}

function formatScheduleTime(classroom: ClassroomSummary) {
  const scheduledAt = asDate(classroom.scheduledAt);
  if (!scheduledAt) {
    return 'Time pending';
  }

  return format(scheduledAt, 'h:mm a');
}

function formatScheduleDate(classroom: ClassroomSummary) {
  const scheduledAt = asDate(classroom.scheduledAt);
  if (!scheduledAt) {
    return 'Date pending';
  }

  return format(scheduledAt, 'EEEE, MMM d');
}

function formatCalendarDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function buildGoogleCalendarUrl(classroom: ClassroomSummary) {
  const start = asDate(classroom.scheduledAt);
  if (!start) {
    return null;
  }

  const end = new Date(start.getTime() + classroom.duration * 60 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: classroom.title,
    dates: `${formatCalendarDate(start)}/${formatCalendarDate(end)}`,
    details: classroom.description ?? 'Join this DeenVerse classroom session.',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function getCourseLabel(classroom: ClassroomSummary) {
  if (!classroom.course) {
    return null;
  }

  if (typeof classroom.course === 'string') {
    return 'Course-linked session';
  }

  return classroom.course.title ?? classroom.course.slug ?? 'Course-linked session';
}

interface LiveSidebarCardProps {
  classroom: ClassroomSummary;
  onOpen: (classroom: ClassroomSummary) => void;
}

function LiveSidebarCard({ classroom, onOpen }: LiveSidebarCardProps) {
  const typeMeta = CLASSROOM_TYPE_META[classroom.type];

  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      onClick={() => onOpen(classroom)}
      className="w-full text-left"
    >
      <Card className="overflow-hidden border-l-4 border-l-red-500 bg-card/95 shadow-sm transition-all hover:border-l-red-600 hover:shadow-lg">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <Badge className={cn('border-none', typeMeta.badgeClassName)}>{typeMeta.label}</Badge>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-red-600 dark:bg-red-950/40 dark:text-red-300">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Live
            </span>
          </div>

          <div>
            <h3 className="line-clamp-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary">
              {classroom.title}
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">{formatLiveDuration(classroom)}</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar
                src={classroom.host.avatar}
                alt={classroom.host.name}
                fallback={classroom.host.name}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{classroom.host.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {classroom.host.username ? `@${classroom.host.username}` : 'Verified host'}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
              <Users className="h-3 w-3" />
              {classroom.participantCount}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.button>
  );
}

interface ScheduleCardProps {
  classroom: ClassroomSummary;
  onOpen: (classroom: ClassroomSummary) => void;
}

function ScheduleCard({ classroom, onOpen }: ScheduleCardProps) {
  const typeMeta = CLASSROOM_TYPE_META[classroom.type];
  const accessMeta = getAccessMeta(classroom.access);
  const courseLabel = getCourseLabel(classroom);
  const AccessIcon = accessMeta.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3 text-sm font-medium text-foreground sm:hidden">
              <Clock3 className="h-4 w-4 text-primary" />
              {formatScheduleTime(classroom)}
            </div>

            <div className="flex-1 space-y-4 p-4 md:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn('border-none', typeMeta.badgeClassName)}>{typeMeta.label}</Badge>
                {courseLabel && (
                  <Badge variant="secondary" className="bg-secondary/80 text-secondary-foreground">
                    {courseLabel}
                  </Badge>
                )}
                <span className={cn('ml-auto inline-flex items-center gap-1 text-xs font-medium', accessMeta.className)}>
                  <AccessIcon className="h-3.5 w-3.5" />
                  {accessMeta.label}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold leading-tight text-foreground">{classroom.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{formatStartsIn(classroom)}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    src={classroom.host.avatar}
                    alt={classroom.host.name}
                    fallback={classroom.host.name}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{classroom.host.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {classroom.host.username ? `@${classroom.host.username}` : 'Scholar session'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {classroom.duration} min
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {classroom.maxParticipants} seats
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={() => onOpen(classroom)} className="sm:w-auto">
                  View Session
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const url = buildGoogleCalendarUrl(classroom);
                    if (url) {
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  className="sm:w-auto"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Add Reminder
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LiveSidebarSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="overflow-hidden border-l-4 border-l-muted">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-14" />
            </div>
            <Skeleton className="h-12 w-full" />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ScheduleSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-8 w-3/4" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-36" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/70 px-6 py-14 text-center">
      <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground/50" />
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

interface ClassroomDetailPanelProps {
  classroom: ClassroomSummary | null;
  isAuthenticated: boolean;
  onClose: () => void;
  onJoin: (classroom: ClassroomSummary) => void;
  onSignIn: () => void;
}

function ClassroomDetailPanel({
  classroom,
  isAuthenticated,
  onClose,
  onJoin,
  onSignIn,
}: ClassroomDetailPanelProps) {
  const courseLabel = classroom ? getCourseLabel(classroom) : null;

  return (
    <AnimatePresence>
      {classroom ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close classroom details"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto border-l bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b px-5 py-4 md:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Classroom Details
                </p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">{classroom.title}</h2>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6 px-5 py-6 md:px-6">
              <div className="rounded-2xl border bg-[linear-gradient(135deg,rgba(2,44,34,0.98),rgba(15,23,42,0.96))] p-5 text-slate-50 shadow-lg">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={cn('border-none', CLASSROOM_TYPE_META[classroom.type].badgeClassName)}>
                    {CLASSROOM_TYPE_META[classroom.type].label}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/10 text-white">
                    {classroom.status === 'live' ? 'Live right now' : 'Scheduled'}
                  </Badge>
                </div>

                <p className="mt-4 text-sm text-slate-200">
                  {classroom.description ?? 'A live learning session designed for real-time teaching, questions, and community participation.'}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">When</p>
                    <p className="mt-1 font-medium text-white">{formatScheduleDate(classroom)}</p>
                    <p className="text-sm text-slate-300">{formatScheduleTime(classroom)}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Seats</p>
                    <p className="mt-1 font-medium text-white">{classroom.maxParticipants} max participants</p>
                    <p className="text-sm text-slate-300">{classroom.participantCount} currently inside</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={classroom.host.avatar}
                    alt={classroom.host.name}
                    fallback={classroom.host.name}
                    size="lg"
                  />
                  <div>
                    <p className="text-sm text-muted-foreground">Hosted by</p>
                    <h3 className="text-lg font-semibold text-foreground">{classroom.host.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {classroom.host.username ? `@${classroom.host.username}` : 'DeenVerse scholar'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Access</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{getAccessMeta(classroom.access).label}</p>
                </div>
                <div className="rounded-2xl border bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Format</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{classroom.duration} minute session</p>
                </div>
                <div className="rounded-2xl border bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Status</p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {classroom.status === 'live' ? formatLiveDuration(classroom) : formatStartsIn(classroom)}
                  </p>
                </div>
                <div className="rounded-2xl border bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Course</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{courseLabel ?? 'Standalone session'}</p>
                </div>
              </div>

              {classroom.tags && classroom.tags.length > 0 && (
                <div className="rounded-2xl border bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tags</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {classroom.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-secondary/80 text-secondary-foreground">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Join Flow</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {classroom.status === 'live'
                    ? 'Jump straight into the room if you have access. Authentication is required to enter.'
                    : 'Save the date now and come back here when the room goes live.'}
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  {classroom.status === 'live' ? (
                    isAuthenticated ? (
                      <Button onClick={() => onJoin(classroom)} className="sm:w-auto">
                        Join Live Classroom
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button onClick={onSignIn} className="sm:w-auto">
                        Sign In To Join
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const url = buildGoogleCalendarUrl(classroom);
                        if (url) {
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className="sm:w-auto"
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Add To Calendar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export function ClassroomLobbyPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [selectedType, setSelectedType] = useState<ClassroomType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomSummary | null>(null);

  const deferredSearch = useDeferredValue(search.trim());
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const daysOfWeek = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  );

  const classroomFilters = useMemo(
    () => ({
      status: 'live' as const,
      type: selectedType === 'all' ? undefined : selectedType,
      search: deferredSearch || undefined,
      page: 1,
      limit: 8,
    }),
    [deferredSearch, selectedType]
  );

  const liveClassroomsQuery = useClassrooms(classroomFilters);
  const upcomingClassroomsQuery = useUpcomingClassrooms();

  const liveClassrooms = liveClassroomsQuery.data?.classrooms ?? [];
  const filteredUpcoming = useMemo(() => {
    return (upcomingClassroomsQuery.data?.classrooms ?? [])
      .filter((classroom) => {
        if (selectedType !== 'all' && classroom.type !== selectedType) {
          return false;
        }

        if (!deferredSearch) {
          return true;
        }

        const haystack = [
          classroom.title,
          classroom.description,
          classroom.host.name,
          classroom.host.username,
          getCourseLabel(classroom),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(deferredSearch.toLowerCase());
      })
      .sort((left, right) => {
        const leftDate = asDate(left.scheduledAt)?.getTime() ?? 0;
        const rightDate = asDate(right.scheduledAt)?.getTime() ?? 0;
        return leftDate - rightDate;
      });
  }, [deferredSearch, selectedType, upcomingClassroomsQuery.data?.classrooms]);

  const selectedDayClassrooms = useMemo(
    () => filteredUpcoming.filter((classroom) => {
      const scheduledAt = asDate(classroom.scheduledAt);
      return scheduledAt ? isSameDay(scheduledAt, selectedDay) : false;
    }),
    [filteredUpcoming, selectedDay]
  );

  const weeklyCounts = useMemo(
    () =>
      daysOfWeek.map((day) =>
        filteredUpcoming.filter((classroom) => {
          const scheduledAt = asDate(classroom.scheduledAt);
          return scheduledAt ? isSameDay(scheduledAt, day) : false;
        }).length
      ),
    [daysOfWeek, filteredUpcoming]
  );

  const activeTypeLabel = CLASSROOM_TYPE_OPTIONS.find((option) => option.value === selectedType)?.label ?? 'All Types';

  const shiftWeek = (direction: -1 | 1) => {
    setCurrentDate((previousDate) => addDays(previousDate, direction * 7));
    setSelectedDay((previousDate) => addDays(previousDate, direction * 7));
  };

  const openClassroom = (classroom: ClassroomSummary) => {
    setSelectedClassroom(classroom);
  };

  const joinClassroom = (classroom: ClassroomSummary) => {
    navigate(`/classrooms/${classroom._id}/live`);
    setSelectedClassroom(null);
  };

  const signInToJoin = () => {
    if (!selectedClassroom) {
      navigate('/login');
      return;
    }

    navigate('/login', {
      state: {
        from: `/classrooms/${selectedClassroom._id}/live`,
      },
    });
  };

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.08),_transparent_36%),linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,0.88))] dark:bg-[radial-gradient(circle_at_top,_rgba(20,83,45,0.2),_transparent_32%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(15,23,42,0.94))]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:flex-row lg:gap-8 lg:px-8">
          <aside className="w-full lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-80 lg:self-start xl:w-96">
            <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-xl backdrop-blur">
              <div className="border-b px-6 py-5">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-red-500">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                  </span>
                  Live Now
                </div>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Interactive Classrooms</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Join live teaching rooms and browse the weekly schedule without leaving the learning flow.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                {liveClassroomsQuery.isLoading ? (
                  <LiveSidebarSkeleton />
                ) : liveClassroomsQuery.isError ? (
                  <EmptyState
                    title="Live sessions unavailable"
                    description="The live classroom feed could not be loaded right now. Please try again in a moment."
                  />
                ) : liveClassrooms.length === 0 ? (
                  <EmptyState
                    title="No live classrooms right now"
                    description="When a scholar starts a room it will appear here immediately, ready for quick join."
                  />
                ) : (
                  <div className="space-y-4">
                    {liveClassrooms.map((classroom) => (
                      <LiveSidebarCard
                        key={classroom._id}
                        classroom={classroom}
                        onOpen={openClassroom}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1 overflow-hidden rounded-3xl border border-border/60 bg-card/85 shadow-xl backdrop-blur">
            <div className="border-b bg-background/60 px-4 py-4 md:px-8 md:py-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Calendar View</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                    Weekly classroom schedule
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Filter by session type, search scholars or topics, then inspect a single day in detail.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                  <div className="relative min-w-0 flex-1 sm:min-w-[18rem]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search sessions, scholars, or courses"
                      className="h-11 rounded-xl border-border/70 bg-background pl-10"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CLASSROOM_TYPE_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={selectedType === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedType(option.value)}
                        className="rounded-full"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b bg-background/50 px-4 py-4 md:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="button" variant="outline" size="icon" onClick={() => shiftWeek(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="min-w-[16rem] text-center">
                    <p className="text-sm font-medium text-foreground">
                      {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">Showing {activeTypeLabel.toLowerCase()} across the current week</p>
                  </div>
                  <Button type="button" variant="outline" size="icon" onClick={() => shiftWeek(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setCurrentDate(new Date());
                      setSelectedDay(new Date());
                    }}
                    className="rounded-full"
                  >
                    Today
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
                    <Radio className="h-4 w-4 text-red-500" />
                    {liveClassrooms.length} live now
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {filteredUpcoming.length} upcoming this feed
                  </span>
                </div>
              </div>
            </div>

            <div className="border-b bg-background/40 px-4 py-4 md:px-8">
              <div className="flex min-w-max items-center gap-2 overflow-x-auto pb-1">
                {daysOfWeek.map((day, index) => {
                  const isActive = isSameDay(day, selectedDay);
                  const isToday = isSameDay(day, new Date());
                  const count = weeklyCounts[index];

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        'min-w-[6rem] rounded-2xl border px-4 py-3 text-left transition-all',
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground shadow-md'
                          : 'border-border/70 bg-card hover:border-primary/40 hover:bg-secondary/70'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn('text-[11px] font-semibold uppercase tracking-[0.2em]', isActive ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                          {format(day, 'EEE')}
                        </span>
                        {isToday && (
                          <span className={cn('h-2 w-2 rounded-full', isActive ? 'bg-primary-foreground' : 'bg-primary')} />
                        )}
                      </div>
                      <p className="mt-2 text-2xl font-semibold">{format(day, 'd')}</p>
                      <p className={cn('mt-1 text-xs', isActive ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                        {count} session{count === 1 ? '' : 's'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-[linear-gradient(180deg,transparent,rgba(148,163,184,0.03))] px-4 py-6 md:px-8 md:py-8">
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                    {isSameDay(selectedDay, new Date())
                      ? "Today's schedule"
                      : format(selectedDay, 'EEEE, MMMM do')}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Sessions remain grouped by day so students can scan what is coming next without switching views.
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedDayClassrooms.length} result{selectedDayClassrooms.length === 1 ? '' : 's'}
                </div>
              </div>

              {upcomingClassroomsQuery.isLoading ? (
                <ScheduleSkeleton />
              ) : upcomingClassroomsQuery.isError ? (
                <EmptyState
                  title="Schedule unavailable"
                  description="The weekly classroom calendar could not be loaded right now. Please refresh and try again."
                />
              ) : selectedDayClassrooms.length === 0 ? (
                <EmptyState
                  title="No sessions on this day"
                  description="Try another day in the week picker or broaden the filters to see more classroom sessions."
                />
              ) : (
                <div className="relative space-y-8 border-l border-border/70 pl-4 md:ml-12 md:pl-8">
                  {selectedDayClassrooms.map((classroom) => (
                    <div key={classroom._id} className="relative">
                      <div className="absolute -left-[24px] top-5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background md:-left-[39px]" />
                      <div className="absolute -left-[7.5rem] top-3 hidden w-24 text-right text-sm font-medium text-muted-foreground md:block">
                        {formatScheduleTime(classroom)}
                      </div>
                      <ScheduleCard classroom={classroom} onOpen={openClassroom} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <ClassroomDetailPanel
        classroom={selectedClassroom}
        isAuthenticated={isAuthenticated}
        onClose={() => setSelectedClassroom(null)}
        onJoin={joinClassroom}
        onSignIn={signInToJoin}
      />
    </>
  );
}
