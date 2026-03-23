import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ClassroomStatus } from '@deenverse/shared';
import {
  Calendar,
  Clock,
  Edit,
  Plus,
  Radio,
  Trash2,
  Users,
  Video,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/authStore';
import {
  useDeleteClassroom,
  useMySessions,
  type ClassroomSummary,
} from './useClassroom';

const STATUS_TABS: { label: string; value: ClassroomStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Live', value: 'live' },
  { label: 'Ended', value: 'ended' },
  { label: 'Cancelled', value: 'cancelled' },
];

function statusBadge(status: ClassroomStatus) {
  switch (status) {
    case 'live':
      return (
        <Badge className="bg-red-500/10 text-red-600 border-red-200">
          <Radio className="w-3 h-3 mr-1 animate-pulse" /> Live
        </Badge>
      );
    case 'scheduled':
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
          <Calendar className="w-3 h-3 mr-1" /> Scheduled
        </Badge>
      );
    case 'ended':
      return (
        <Badge variant="secondary">
          <Video className="w-3 h-3 mr-1" /> Ended
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="secondary" className="text-muted-foreground">
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function SessionCard({
  session,
  onDelete,
  isDeleting,
}: {
  session: ClassroomSummary;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const navigate = useNavigate();
  const courseTitle =
    typeof session.course === 'object' && session.course ? session.course.title : undefined;

  return (
    <div className="bg-card rounded-lg border p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            {statusBadge(session.status)}
            <span className="text-xs text-muted-foreground capitalize">{session.type}</span>
          </div>
          <h3 className="font-semibold truncate">{session.title}</h3>
          {courseTitle && (
            <p className="text-sm text-muted-foreground mt-0.5">Course: {courseTitle}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(session.scheduledAt)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {formatTime(session.scheduledAt)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {session.duration}m
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {session.participantCount}/{session.maxParticipants}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t">
        {session.status === 'scheduled' && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/scholar/classrooms/${session._id}/edit`)}
            >
              <Edit className="w-3.5 h-3.5 mr-1" /> Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={isDeleting}
              onClick={() => onDelete(session._id)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
            </Button>
            <Button size="sm" asChild className="ml-auto">
              <Link to={`/classrooms`}>
                <Radio className="w-3.5 h-3.5 mr-1" /> Start
              </Link>
            </Button>
          </>
        )}
        {session.status === 'live' && (
          <Button size="sm" asChild>
            <Link to={`/classrooms`}>
              <Radio className="w-3.5 h-3.5 mr-1" /> Rejoin
            </Link>
          </Button>
        )}
        {session.status === 'ended' && (
          <span className="text-xs text-muted-foreground">
            Ended {session.endedAt ? formatDate(session.endedAt) : ''}
          </span>
        )}
      </div>
    </div>
  );
}

function SessionSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-4">
      <Skeleton className="h-5 w-20 mb-2" />
      <Skeleton className="h-5 w-3/4 mb-4" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function MySessionsPage() {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<ClassroomStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const statusFilter = tab === 'all' ? undefined : tab;
  const { data, isLoading } = useMySessions('host', statusFilter, page);
  const deleteMutation = useDeleteClassroom();

  if (user && user.role !== 'scholar' && user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Only scholars can manage classroom sessions.</p>
      </div>
    );
  }

  const sessions = data?.classrooms ?? [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-full p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Sessions</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your classroom sessions
            </p>
          </div>
          <Button asChild>
            <Link to="/scholar/classrooms/new">
              <Plus className="w-4 h-4 mr-1" /> New Session
            </Link>
          </Button>
        </div>

        {/* Status Tabs */}
        <Tabs value={tab} onValueChange={(v) => { setTab(v as typeof tab); setPage(1); }} className="mb-6">
          <TabsList>
            {STATUS_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Sessions Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SessionSkeleton key={i} />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <Video className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No sessions found</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/scholar/classrooms/new">Schedule your first session</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {sessions.map((s) => (
              <SessionCard
                key={s._id}
                session={s}
                onDelete={(id) => deleteMutation.mutate(id)}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
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
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
