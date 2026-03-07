import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  PlayCircle,
  CheckCircle,
  ChevronRight,
  Video,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMyCourses, type MyCourseItem } from '@/features/courses/useCourses';

// ── Helpers ──────────────────────────────────────────

function ProgressRing({
  percent,
  size = 56,
  strokeWidth = 5,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={percent === 100 ? 'hsl(var(--chart-2, 142 71% 45%))' : 'hsl(var(--primary))'}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className="transition-all duration-500"
      />
    </svg>
  );
}

function EnrollmentCard({ item }: { item: MyCourseItem }) {
  const navigate = useNavigate();
  const { course, progress, status } = item;
  const percent = Math.round(progress.percentComplete ?? 0);
  const isCompleted = status === 'completed' || percent === 100;
  const isLive = course.type === 'instructor-led' || course.type === 'hybrid';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex flex-col sm:flex-row bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all hover:border-primary/20"
    >
      {/* Thumbnail */}
      <Link
        to={`/courses/${course.slug}`}
        className="relative sm:w-48 shrink-0 aspect-video sm:aspect-auto bg-muted overflow-hidden"
      >
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted min-h-[112px]">
            <BookOpen className="size-10 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-background/90 text-foreground text-xs px-2 py-1 rounded-md flex items-center gap-1 font-medium shadow-sm backdrop-blur-sm">
          {isLive ? <Video size={12} /> : <PlayCircle size={12} />}
          {isLive ? 'Live' : 'On-demand'}
        </div>
        {isCompleted && (
          <div className="absolute inset-0 bg-emerald-900/60 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-300" />
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-1 p-4 sm:p-5 gap-4">
        <div className="flex-1 min-w-0 space-y-1.5">
          <Link
            to={`/courses/${course.slug}`}
            className="block text-sm text-muted-foreground uppercase tracking-wider font-semibold hover:text-primary transition-colors"
          >
            {course.category}
          </Link>
          <Link
            to={`/courses/${course.slug}`}
            className="block text-base font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors"
          >
            {course.title}
          </Link>
          <p className="text-sm text-muted-foreground">
            by {typeof course.instructor === 'object' ? course.instructor.name : 'Instructor'}
          </p>

          {/* Progress bar */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>{percent}% complete</span>
              {isCompleted ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Completed
                </span>
              ) : (
                <span>{progress.completedLessons?.length ?? 0} lessons done</span>
              )}
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted ? 'bg-emerald-500' : 'bg-primary'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Progress Ring + CTA */}
        <div className="flex flex-col items-center justify-between gap-3 shrink-0">
          <div className="relative">
            <ProgressRing percent={percent} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`text-xs font-bold ${
                  isCompleted ? 'text-emerald-600' : 'text-foreground'
                }`}
              >
                {percent}%
              </span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => navigate(`/courses/${course.slug}/learn`)}
            className={`text-xs gap-1.5 ${
              isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            }`}
          >
            {isCompleted ? (
              <>
                <BookOpen className="w-3.5 h-3.5" />
                Review
              </>
            ) : (
              <>
                <PlayCircle className="w-3.5 h-3.5" />
                Continue
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Empty State ───────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20 px-4"
    >
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
        <BookOpen className="w-10 h-10 text-muted-foreground/50" />
      </div>
      {filtered ? (
        <>
          <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
          <p className="text-muted-foreground">No enrollments match this filter.</p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            You haven&apos;t enrolled in any courses yet
          </h3>
          <p className="text-muted-foreground mb-6">
            Discover courses by verified Islamic scholars and start your learning journey.
          </p>
          <Button asChild className="gap-2">
            <Link to="/courses">
              <BookOpen className="w-4 h-4" />
              Browse Courses
            </Link>
          </Button>
        </>
      )}
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────

type StatusFilter = 'all' | 'active' | 'completed';

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Courses' },
  { value: 'active', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export function MyCoursesPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

  const queryStatus = statusFilter === 'all' ? undefined : statusFilter;
  const { data, isLoading, isError } = useMyCourses(queryStatus, page);

  const enrollments = data?.enrollments ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.pages ?? 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">My Courses</h1>
        <p className="text-muted-foreground">Track your learning progress</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl mb-6 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              statusFilter === tab.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-destructive">
          <p>Failed to load courses. Please try again.</p>
        </div>
      ) : enrollments.length === 0 ? (
        <EmptyState filtered={statusFilter !== 'all'} />
      ) : (
        <div className="space-y-4">
          {enrollments.map((item) => (
            <EnrollmentCard key={item._id} item={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Browse more CTA at the bottom */}
      {enrollments.length > 0 && (
        <div className="mt-12 rounded-2xl bg-muted/50 border border-border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Discover more courses</h3>
            <p className="text-sm text-muted-foreground">
              Expand your Islamic knowledge with courses from verified scholars.
            </p>
          </div>
          <Button asChild className="shrink-0 gap-2">
            <Link to="/courses">
              Browse Courses
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
