import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  Send,
  AlertCircle,
  MoreHorizontal,
  Star,
  Users,
  Clock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import {
  useMyTeaching,
  useDeleteCourse,
  usePublishCourse,
  type CourseDetail,
} from './useCourses';

const STATUS_OPTIONS = [
  { value: '', label: 'All Courses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending-review', label: 'Pending Review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  'pending-review': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  archived: 'bg-secondary text-secondary-foreground',
};

export function MyTeachingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data, isLoading, error } = useMyTeaching(statusFilter || undefined, page);
  const deleteCourse = useDeleteCourse();
  const publishCourse = usePublishCourse();

  // Scholar-only guard
  if (user && user.role !== 'scholar' && user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Scholar Access Required</h2>
        <p className="text-muted-foreground mb-4">Only verified scholars can manage courses.</p>
        <Button onClick={() => navigate('/scholar/apply')}>Apply to Become a Scholar</Button>
      </div>
    );
  }

  const handleDelete = async (slug: string) => {
    await deleteCourse.mutateAsync({ slug });
    setDeleteConfirm(null);
  };

  const handlePublish = async (slug: string) => {
    await publishCourse.mutateAsync({ slug });
    setOpenMenu(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Teaching</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your courses and curriculum.</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/scholar/courses/new">
            <Plus size={16} />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Stats row */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Courses', value: data.pagination.total },
            {
              label: 'Published',
              value: data.courses.filter((c) => c.status === 'published').length,
            },
            {
              label: 'Total Students',
              value: data.courses.reduce((sum, c) => sum + (c.enrollmentCount ?? 0), 0),
            },
            {
              label: 'Avg. Rating',
              value:
                data.courses.length > 0
                  ? (
                      data.courses.reduce((sum, c) => sum + (c.rating?.average ?? 0), 0) /
                      data.courses.length
                    ).toFixed(1)
                  : '—',
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border rounded-xl p-4">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setStatusFilter(opt.value);
              setPage(1);
            }}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              statusFilter === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-muted-foreground">
          <AlertCircle className="w-10 h-10 mx-auto mb-3" />
          <p>Failed to load courses. Please try again.</p>
        </div>
      ) : !data || data.courses.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="space-y-4">
            {data.courses.map((course) => (
              <CourseRow
                key={course._id}
                course={course}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                onEdit={() => navigate(`/scholar/courses/${course.slug}/edit`)}
                onDelete={() => setDeleteConfirm(course.slug)}
                onPublish={() => handlePublish(course.slug)}
                deleteLoading={deleteCourse.isPending}
                publishLoading={publishCourse.isPending}
              />
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                disabled={page === data.pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border rounded-xl p-6 max-w-sm w-full shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold">Delete Course?</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Courses with enrolled students will be archived instead of permanently deleted.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteCourse.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteCourse.isPending}
              >
                {deleteCourse.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ── Course Row ────────────────────────────────────────

interface CourseRowProps {
  course: CourseDetail;
  openMenu: string | null;
  setOpenMenu: (slug: string | null) => void;
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
  deleteLoading: boolean;
  publishLoading: boolean;
}

function CourseRow({
  course,
  openMenu,
  setOpenMenu,
  onEdit,
  onDelete,
  onPublish,
  deleteLoading,
  publishLoading,
}: CourseRowProps) {
  const status = course.status ?? 'draft';
  const isMenuOpen = openMenu === course.slug;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border rounded-xl p-4 flex items-start gap-4"
    >
      {/* Thumbnail */}
      <div className="w-20 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <BookOpen className="w-6 h-6 text-muted-foreground" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold line-clamp-1">{course.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                  STATUS_BADGE[status]
                )}
              >
                {status === 'pending-review' ? 'Pending Review' : status}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium capitalize">
                {course.category}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground font-medium capitalize">
                {course.level}
              </span>
            </div>
          </div>

          {/* Actions menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setOpenMenu(isMenuOpen ? null : course.slug)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                <div className="absolute right-0 top-9 z-20 bg-card border rounded-xl shadow-lg py-1 min-w-[160px]">
                  <button
                    onClick={() => { onEdit(); setOpenMenu(null); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-secondary transition-colors"
                  >
                    <Edit2 size={14} /> Edit Course
                  </button>
                  {(status === 'draft' || status === 'archived') && (
                    <button
                      onClick={onPublish}
                      disabled={publishLoading}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-secondary transition-colors text-primary"
                    >
                      <Send size={14} /> Submit for Review
                    </button>
                  )}
                  <button
                    onClick={() => { onDelete(); setOpenMenu(null); }}
                    disabled={deleteLoading}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-secondary transition-colors text-destructive"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users size={13} /> {course.enrollmentCount ?? 0} students
          </span>
          {course.rating?.count > 0 && (
            <span className="flex items-center gap-1">
              <Star size={13} className="text-amber-500 fill-amber-500" />
              {course.rating.average.toFixed(1)} ({course.rating.count})
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={13} />
            {course.modules?.length ?? 0} module{(course.modules?.length ?? 0) !== 1 ? 's' : ''}
          </span>
          <span className="capitalize">
            {course.pricing.type === 'free'
              ? 'Free'
              : course.pricing.type === 'paid'
              ? `$${course.pricing.amount?.toFixed(2) ?? '0.00'}`
              : 'Subscription'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Empty State ───────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <BookOpen className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-bold mb-2">No courses yet</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
        Share your knowledge with students around the world. Create your first course to get started.
      </p>
      <Button asChild className="gap-2">
        <Link to="/scholar/courses/new">
          <Plus size={16} /> Create Your First Course
        </Link>
      </Button>
    </div>
  );
}
