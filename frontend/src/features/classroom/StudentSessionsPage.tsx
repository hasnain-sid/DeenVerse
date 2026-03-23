import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ClassroomStatus } from '@deenverse/shared';
import {
  CalendarDays,
  Clock3,
  PlayCircle,
  Radio,
  Video,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudentSessions, type ClassroomRecording, type ClassroomSummary } from './useClassroom';

const STATUS_TABS: Array<{ label: string; value: ClassroomStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Live', value: 'live' },
  { label: 'Upcoming', value: 'scheduled' },
  { label: 'Ended', value: 'ended' },
];

const EMPTY_CLASSROOMS: ClassroomSummary[] = [];

function formatDateLabel(value?: string) {
  if (!value) {
    return 'Date pending';
  }

  return new Date(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTimeLabel(value?: string) {
  if (!value) {
    return 'Time pending';
  }

  return new Date(value).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatStartsIn(value?: string) {
  if (!value) {
    return 'Starts soon';
  }

  const scheduled = new Date(value).getTime();
  const diffMs = scheduled - Date.now();
  if (diffMs <= 0) {
    return 'Starting soon';
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `Starts in ${minutes}m`;
  }

  return `Starts in ${hours}h ${minutes}m`;
}

function getCourseTitle(classroom: ClassroomSummary) {
  if (!classroom.course) {
    return 'Standalone session';
  }

  if (typeof classroom.course === 'string') {
    return 'Course-linked session';
  }

  return classroom.course.title ?? classroom.course.slug ?? 'Course-linked session';
}

function getFirstRecording(recordings?: ClassroomRecording[]) {
  return recordings?.find((recording) => Boolean(recording.url)) ?? null;
}

function statusBadge(status: ClassroomStatus) {
  switch (status) {
    case 'live':
      return (
        <Badge className="border-red-200 bg-red-500/10 text-red-600 hover:bg-red-500/10">
          <Radio className="mr-1 h-3 w-3 animate-pulse" />
          Live
        </Badge>
      );
    case 'scheduled':
      return (
        <Badge className="border-blue-200 bg-blue-500/10 text-blue-600 hover:bg-blue-500/10">
          <CalendarDays className="mr-1 h-3 w-3" />
          Upcoming
        </Badge>
      );
    case 'ended':
      return (
        <Badge variant="secondary">
          <Video className="mr-1 h-3 w-3" />
          Ended
        </Badge>
      );
    case 'cancelled':
      return <Badge variant="outline">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function SessionsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="border-border/70">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-14" />
            </div>
            <Skeleton className="h-7 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SessionCard({ classroom }: { classroom: ClassroomSummary }) {
  const navigate = useNavigate();
  const recording = getFirstRecording(classroom.recordings);

  return (
    <Card className="h-full border-border/70 bg-card/95 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {statusBadge(classroom.status)}
              <span className="text-xs font-medium capitalize text-muted-foreground">{classroom.type}</span>
            </div>
            <h2 className="text-lg font-semibold leading-tight text-foreground">{classroom.title}</h2>
          </div>
          <div className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            {classroom.participantCount} joined
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>{getCourseTitle(classroom)}</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDateLabel(classroom.scheduledAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {formatTimeLabel(classroom.scheduledAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {classroom.duration} min
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-secondary/60 px-3 py-3 text-sm text-secondary-foreground">
          {classroom.status === 'live'
            ? 'Your classroom is live now. Join instantly to take part in the session.'
            : classroom.status === 'scheduled'
              ? formatStartsIn(classroom.scheduledAt)
              : recording
                ? 'Recording available to watch on demand.'
                : 'Recording is not available for this session yet.'}
        </div>

        <div className="mt-auto flex flex-wrap gap-3">
          {classroom.status === 'live' ? (
            <Button onClick={() => navigate(`/classrooms/${classroom._id}/live`)}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Join Now
            </Button>
          ) : null}

          {classroom.status === 'scheduled' ? (
            <Button variant="outline" onClick={() => navigate('/classrooms')}>
              View In Lobby
            </Button>
          ) : null}

          {classroom.status === 'ended' && recording?.url ? (
            <Button asChild variant="outline">
              <a href={recording.url} target="_blank" rel="noreferrer">
                <Video className="mr-2 h-4 w-4" />
                Watch Recording
              </a>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function StudentSessionsPage() {
  const [tab, setTab] = useState<ClassroomStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const statusFilter = tab === 'all' ? undefined : tab;
  const { data, isLoading, isError } = useStudentSessions(statusFilter, page);

  const classrooms = data?.classrooms ?? EMPTY_CLASSROOMS;
  const pagination = data?.pagination;

  const liveCount = useMemo(
    () => classrooms.filter((classroom) => classroom.status === 'live').length,
    [classrooms],
  );
  const upcomingCount = useMemo(
    () => classrooms.filter((classroom) => classroom.status === 'scheduled').length,
    [classrooms],
  );
  const recordingCount = useMemo(
    () => classrooms.filter((classroom) => classroom.status === 'ended' && getFirstRecording(classroom.recordings)).length,
    [classrooms],
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto p-4 md:p-6 pb-24">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Student Hub</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">My Sessions</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Track the live classrooms you have attended, the sessions still ahead in your enrolled courses, and the recordings you can revisit.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/classrooms">Browse Classrooms</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 bg-card/95">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Live Now</p>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-3xl font-semibold text-foreground">{liveCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Upcoming</p>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              <span className="text-3xl font-semibold text-foreground">{upcomingCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/95">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Recordings</p>
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-slate-500" />
              <span className="text-3xl font-semibold text-foreground">{recordingCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as ClassroomStatus | 'all');
          setPage(1);
        }}
        className="space-y-6"
      >
        <TabsList>
          {STATUS_TABS.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? <SessionsSkeleton /> : null}

      {!isLoading && isError ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-14 text-center">
            <p className="text-lg font-medium text-foreground">Student sessions could not be loaded.</p>
            <p className="max-w-lg text-sm text-muted-foreground">
              The classroom session feed is temporarily unavailable. Refresh the page or return to the classroom lobby.
            </p>
            <Button asChild variant="outline">
              <Link to="/classrooms">Back To Lobby</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !isError && classrooms.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground/40" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-foreground">No sessions found for this filter.</p>
              <p className="max-w-lg text-sm text-muted-foreground">
                Once your enrolled courses schedule live classrooms, they will show up here automatically alongside the sessions you already attended.
              </p>
            </div>
            <Button asChild>
              <Link to="/classrooms">Explore Live Classrooms</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !isError && classrooms.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {classrooms.map((classroom) => (
            <SessionCard key={classroom._id} classroom={classroom} />
          ))}
        </div>
      ) : null}

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((currentPage) => currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
