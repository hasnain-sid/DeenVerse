import { useState } from 'react';
import {
  useAdminCourses,
  useReviewCourse,
  type AdminCoursesResponse,
} from './useCourses';
import {
  Check,
  X,
  Search,
  Archive,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Globe,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusTab = 'pending-review' | 'published' | 'all';

type AdminCourseItem = AdminCoursesResponse['courses'][number];

export function AdminCourseReviewPage() {
  const [tab, setTab] = useState<StatusTab>('pending-review');
  const [page, setPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourseItem | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmApprove, setConfirmApprove] = useState(false);

  const { data, isLoading } = useAdminCourses(tab, page);
  const reviewMutation = useReviewCourse();

  const courses = data?.courses ?? [];
  const pagination = data?.pagination;

  const filtered = searchQuery
    ? courses.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : courses;

  function handleSelect(course: AdminCourseItem) {
    setSelectedCourse(course);
    setShowRejectInput(false);
    setRejectReason('');
    setConfirmApprove(false);
  }

  function handleApprove() {
    if (!selectedCourse) return;
    reviewMutation.mutate(
      { slug: selectedCourse.slug, decision: 'approved' },
      {
        onSuccess: () => {
          setSelectedCourse(null);
          setConfirmApprove(false);
        },
      },
    );
  }

  function handleReject() {
    if (!selectedCourse) return;
    reviewMutation.mutate(
      { slug: selectedCourse.slug, decision: 'rejected', reason: rejectReason || undefined },
      {
        onSuccess: () => {
          setSelectedCourse(null);
          setShowRejectInput(false);
          setRejectReason('');
        },
      },
    );
  }

  const tabLabels: Record<StatusTab, string> = {
    'pending-review': 'Pending Review',
    published: 'Published',
    all: 'All Courses',
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)]">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-6 border-b bg-background">
        {(['pending-review', 'published', 'all'] as StatusTab[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPage(1);
              setSelectedCourse(null);
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t === 'pending-review' && <Clock className="w-4 h-4" />}
            {t === 'published' && <BookOpen className="w-4 h-4" />}
            {t === 'all' && <Globe className="w-4 h-4" />}
            {tabLabels[t]}
            {t === 'pending-review' && pagination?.total != null && tab === 'pending-review' && (
              <span className="ml-1 text-xs bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-full">
                {pagination.total}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left: list panel */}
        <div className="w-[380px] border-r flex flex-col bg-muted/5">
          <div className="p-4 border-b bg-background sticky top-0 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">Course Review</h2>
              <span className="text-xs text-muted-foreground">
                {pagination?.total ?? 0} total
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-muted/50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all focus:bg-background"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1 scrollbar-thin">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((course) => (
                <div
                  key={course._id}
                  onClick={() => handleSelect(course)}
                  className={cn(
                    'p-3 rounded-xl cursor-pointer transition-all border',
                    selectedCourse?._id === course._id
                      ? 'bg-primary/10 border-primary/20 shadow-sm'
                      : 'hover:bg-muted border-transparent bg-transparent',
                  )}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4
                      className={cn(
                        'font-medium text-sm line-clamp-1 flex-1 mr-2',
                        selectedCourse?._id === course._id
                          ? 'text-primary'
                          : 'text-foreground',
                      )}
                    >
                      {course.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(course.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] bg-muted-foreground/10 text-muted-foreground px-1.5 py-0.5 rounded capitalize">
                      {course.category}
                    </span>
                    <span className="text-[10px] bg-muted-foreground/10 text-muted-foreground px-1.5 py-0.5 rounded capitalize">
                      {course.level}
                    </span>
                    <StatusBadge status={course.status ?? 'draft'} />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    by {course.instructor.name}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <Archive className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No courses found.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between p-3 border-t bg-background text-xs text-muted-foreground">
              <span>
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <div className="flex gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1 rounded hover:bg-muted disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1 rounded hover:bg-muted disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: detail panel */}
        <div className="flex-1 flex flex-col bg-background min-h-0">
          {selectedCourse ? (
            <>
              {/* Action header */}
              <div className="h-14 border-b px-6 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Submitted{' '}
                  {new Date(selectedCourse.createdAt).toLocaleString()}
                </div>

                <div className="flex items-center gap-3">
                  {selectedCourse.status === 'pending-review' ? (
                    <>
                      <button
                        onClick={() => {
                          setShowRejectInput((v) => !v);
                          setConfirmApprove(false);
                        }}
                        className="px-4 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors border border-transparent hover:border-rose-100"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setConfirmApprove(true);
                          setShowRejectInput(false);
                        }}
                        className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors shadow-sm"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                    </>
                  ) : (
                    <div
                      className={cn(
                        'px-4 py-1.5 text-sm font-medium rounded-md flex items-center gap-2',
                        selectedCourse.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200',
                      )}
                    >
                      {selectedCourse.status === 'published' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      {selectedCourse.status.charAt(0).toUpperCase() +
                        selectedCourse.status.slice(1)}
                    </div>
                  )}
                  <div className="w-px h-6 bg-border mx-1" />
                  <button className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Detail body */}
              <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
                {/* Approve confirm */}
                {confirmApprove && selectedCourse.status === 'pending-review' && (
                  <div className="mb-8 p-5 bg-emerald-50/50 border border-emerald-100 rounded-xl animate-in slide-in-from-top-4 fade-in">
                    <h4 className="flex items-center gap-2 text-emerald-700 font-medium text-sm mb-3">
                      <Check className="w-4 h-4" /> Confirm Approval
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      This will publish the course and notify the instructor.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setConfirmApprove(false)}
                        className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleApprove}
                        disabled={reviewMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        {reviewMutation.isPending ? 'Approving…' : 'Confirm Approve'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Reject form */}
                {showRejectInput && selectedCourse.status === 'pending-review' && (
                  <div className="mb-8 p-5 bg-rose-50/50 border border-rose-100 rounded-xl animate-in slide-in-from-top-4 fade-in">
                    <h4 className="flex items-center gap-2 text-rose-700 font-medium text-sm mb-3">
                      <AlertCircle className="w-4 h-4" /> Rejection Reason
                    </h4>
                    <div className="flex gap-3">
                      <textarea
                        placeholder="Provide a reason for rejecting this course (sent to the instructor)."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        className="flex-1 text-sm p-3 border border-rose-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none shadow-sm"
                      />
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleReject}
                          disabled={reviewMutation.isPending}
                          className="px-4 py-2 text-sm bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          {reviewMutation.isPending ? 'Rejecting…' : 'Confirm Reject'}
                        </button>
                        <button
                          onClick={() => {
                            setShowRejectInput(false);
                            setRejectReason('');
                          }}
                          className="px-4 py-2 text-sm border rounded-lg hover:bg-muted transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Course info */}
                <div className="space-y-6">
                  {/* Title + meta */}
                  <div>
                    <div className="flex items-start gap-4 mb-3">
                      {selectedCourse.thumbnail ? (
                        <img
                          src={selectedCourse.thumbnail}
                          alt={selectedCourse.title}
                          className="w-24 h-16 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-24 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <GraduationCap className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold mb-1">{selectedCourse.title}</h2>
                        <p className="text-sm text-muted-foreground">
                          by{' '}
                          <span className="font-medium text-foreground">
                            {selectedCourse.instructor.name}
                          </span>{' '}
                          (@{selectedCourse.instructor.username})
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <MetaChip label="Category" value={selectedCourse.category} />
                      <MetaChip label="Level" value={selectedCourse.level} />
                      <MetaChip label="Type" value={selectedCourse.type} />
                      <MetaChip label="Language" value={selectedCourse.language} />
                      <MetaChip
                        label="Pricing"
                        value={
                          selectedCourse.pricing.type === 'free'
                            ? 'Free'
                            : `$${selectedCourse.pricing.amount ?? 0} (${selectedCourse.pricing.type})`
                        }
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <section>
                    <SectionHeading>Description</SectionHeading>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedCourse.description}
                    </p>
                  </section>

                  {/* Short description */}
                  {selectedCourse.shortDescription && (
                    <section>
                      <SectionHeading>Short Description</SectionHeading>
                      <p className="text-sm text-muted-foreground">{selectedCourse.shortDescription}</p>
                    </section>
                  )}

                  {/* Learning outcomes */}
                  {selectedCourse.learningOutcomes && selectedCourse.learningOutcomes.length > 0 && (
                    <section>
                      <SectionHeading>Learning Outcomes</SectionHeading>
                      <ul className="space-y-1">
                        {selectedCourse.learningOutcomes.map((o, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            {o}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Requirements */}
                  {selectedCourse.requirements && selectedCourse.requirements.length > 0 && (
                    <section>
                      <SectionHeading>Requirements</SectionHeading>
                      <ul className="space-y-1">
                        {selectedCourse.requirements.map((r, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Modules summary */}
                  {selectedCourse.modules && selectedCourse.modules.length > 0 && (
                    <section>
                      <SectionHeading>
                        Modules ({selectedCourse.modules.length})
                      </SectionHeading>
                      <div className="space-y-2">
                        {selectedCourse.modules.map((mod, idx) => (
                          <div key={idx} className="p-3 rounded-lg border bg-muted/30">
                            <p className="text-sm font-medium">
                              {idx + 1}. {mod.title}
                            </p>
                            {mod.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {mod.lessons.length} lesson{mod.lessons.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Tags */}
                  {selectedCourse.tags && selectedCourse.tags.length > 0 && (
                    <section>
                      <SectionHeading>Tags</SectionHeading>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCourse.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-8">
              <GraduationCap className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">Select a course to review</p>
              <p className="text-sm mt-1 opacity-70">
                Choose from the list on the left to view details and take action.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'pending-review': 'bg-amber-500/10 text-amber-600',
    published: 'bg-emerald-500/10 text-emerald-600',
    draft: 'bg-muted text-muted-foreground',
    archived: 'bg-muted text-muted-foreground',
    rejected: 'bg-rose-500/10 text-rose-600',
  };
  const label: Record<string, string> = {
    'pending-review': 'Pending',
    published: 'Published',
    draft: 'Draft',
    archived: 'Archived',
    rejected: 'Rejected',
  };
  return (
    <span className={cn('text-[10px] px-1.5 py-0.5 rounded ml-auto', map[status] ?? map.draft)}>
      {label[status] ?? status}
    </span>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
      <span className="font-medium text-foreground">{label}:</span> {value}
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-foreground mb-2 pb-1 border-b">{children}</h3>
  );
}
