import { useState } from 'react';
import {
  useAdminScholarApplications,
  useReviewApplication,
  useAdminScholarList,
  type AdminScholarApplication,
} from './useScholar';
import {
  Check,
  X,
  Search,
  Paperclip,
  Clock,
  MoreVertical,
  Archive,
  AlertCircle,
  Mail,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

type Tab = 'applications' | 'scholars';
type StatusFilter = 'pending' | 'approved' | 'rejected' | 'all';

export function AdminScholarReviewPage() {
  const [tab, setTab] = useState<Tab>('applications');
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [page, setPage] = useState(1);
  const [scholarsPage, setScholarsPage] = useState(1);
  const [selectedApp, setSelectedApp] =
    useState<AdminScholarApplication | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: appData, isLoading: appsLoading } =
    useAdminScholarApplications(filter, page);
  const { data: scholarsData, isLoading: scholarsLoading } =
    useAdminScholarList(scholarsPage);
  const reviewMutation = useReviewApplication();

  const applications = appData?.applications ?? [];
  const pagination = appData?.pagination;

  const filteredApps = searchQuery
    ? applications.filter(
        (app) =>
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : applications;

  const handleReview = (
    userId: string,
    decision: 'approved' | 'rejected',
  ) => {
    reviewMutation.mutate(
      {
        userId,
        decision,
        ...(decision === 'rejected' && rejectReason
          ? { rejectionReason: rejectReason }
          : {}),
      },
      {
        onSuccess: (data) => {
          toast.success(data.message);
          setSelectedApp(null);
          setShowRejectInput(false);
          setRejectReason('');
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to review application');
        },
      },
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)]">
      {/* Top tab bar */}
      <div className="flex items-center gap-1 px-6 border-b bg-background">
        <button
          onClick={() => setTab('applications')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
            tab === 'applications'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          <FileText className="w-4 h-4" />
          Applications
        </button>
        <button
          onClick={() => setTab('scholars')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
            tab === 'scholars'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          <Users className="w-4 h-4" />
          Verified Scholars
          {scholarsData?.pagination?.total != null && (
            <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {scholarsData.pagination.total}
            </span>
          )}
        </button>
      </div>

      {tab === 'applications' ? (
        <div className="flex flex-1 min-h-0">
          {/* Left List (Inbox style) */}
          <div className="w-[380px] border-r flex flex-col bg-muted/5">
            <div className="p-4 border-b bg-background sticky top-0 z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight">
                  Review Inbox
                </h2>
                <div className="flex bg-muted p-1 rounded-lg">
                  {(
                    ['all', 'pending', 'approved', 'rejected'] as const
                  ).map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setFilter(f);
                        setPage(1);
                        setSelectedApp(null);
                      }}
                      className={cn(
                        'px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize',
                        filter === f
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground',
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-muted/50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all focus:bg-background"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1 scrollbar-thin">
              {appsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : filteredApps.length > 0 ? (
                filteredApps.map((app) => (
                  <div
                    key={app._id}
                    onClick={() => {
                      setSelectedApp(app);
                      setShowRejectInput(false);
                    }}
                    className={cn(
                      'p-3 rounded-xl cursor-pointer transition-all border',
                      selectedApp?._id === app._id
                        ? 'bg-primary/10 border-primary/20 shadow-sm'
                        : 'hover:bg-muted border-transparent bg-transparent',
                    )}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4
                        className={cn(
                          'font-medium text-sm',
                          selectedApp?._id === app._id
                            ? 'text-primary'
                            : 'text-foreground',
                        )}
                      >
                        {app.name}
                      </h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                        {new Date(
                          app.scholarProfile.applicationDate,
                        ).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex gap-1">
                        {app.scholarProfile.specialties
                          .slice(0, 2)
                          .map((s) => (
                            <span
                              key={s}
                              className="text-[10px] bg-muted-foreground/10 text-muted-foreground px-1.5 py-0.5 rounded"
                            >
                              {s}
                            </span>
                          ))}
                      </div>
                      {app.scholarProfile.applicationStatus !== 'pending' && (
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded ml-auto',
                            app.scholarProfile.applicationStatus === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-rose-500/10 text-rose-600',
                          )}
                        >
                          {app.scholarProfile.applicationStatus === 'approved'
                            ? 'Approved'
                            : 'Rejected'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                      {app.scholarProfile.bio}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <Archive className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No applications found.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-3 border-t bg-background text-xs text-muted-foreground">
                <span>
                  Page {pagination.page} of {pagination.totalPages} (
                  {pagination.total} total)
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
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Detail View */}
          <div className="flex-1 flex flex-col bg-background min-h-0">
            {selectedApp ? (
              <>
                {/* Header Actions */}
                <div className="h-14 border-b px-6 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Submitted on{' '}
                    {new Date(
                      selectedApp.scholarProfile.applicationDate,
                    ).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedApp.scholarProfile.applicationStatus ===
                    'pending' ? (
                      <>
                        <button
                          onClick={() =>
                            setShowRejectInput(!showRejectInput)
                          }
                          className="px-4 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors border border-transparent hover:border-rose-100"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() =>
                            handleReview(selectedApp._id, 'approved')
                          }
                          disabled={reviewMutation.isPending}
                          className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors shadow-sm disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                      </>
                    ) : (
                      <div
                        className={cn(
                          'px-4 py-1.5 text-sm font-medium rounded-md flex items-center gap-2',
                          selectedApp.scholarProfile.applicationStatus ===
                            'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200',
                        )}
                      >
                        {selectedApp.scholarProfile.applicationStatus ===
                        'approved' ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        Marked as{' '}
                        {selectedApp.scholarProfile.applicationStatus
                          .charAt(0)
                          .toUpperCase() +
                          selectedApp.scholarProfile.applicationStatus.slice(
                            1,
                          )}
                      </div>
                    )}
                    <div className="w-px h-6 bg-border mx-1" />
                    <button className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Application Body */}
                <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
                  {showRejectInput &&
                    selectedApp.scholarProfile.applicationStatus ===
                      'pending' && (
                      <div className="mb-8 p-5 bg-rose-50/50 border border-rose-100 rounded-xl animate-in slide-in-from-top-4 fade-in">
                        <h4 className="flex items-center gap-2 text-rose-700 font-medium text-sm mb-3">
                          <AlertCircle className="w-4 h-4" /> Rejection
                          Confirmation
                        </h4>
                        <div className="flex gap-3">
                          <textarea
                            placeholder="Please provide a reason for rejecting this application (sent to applicant)."
                            className="flex-1 text-sm p-3 border-rose-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none shadow-sm"
                            rows={2}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                          />
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() =>
                                handleReview(selectedApp._id, 'rejected')
                              }
                              disabled={
                                !rejectReason.trim() ||
                                reviewMutation.isPending
                              }
                              className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 h-10 w-24"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setShowRejectInput(false)}
                              className="px-4 py-2 bg-white border text-muted-foreground text-sm font-medium rounded-lg hover:bg-muted transition-colors h-10 w-24"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="flex items-start gap-6 mb-8">
                    <img
                      src={selectedApp.avatar || '/default-avatar.png'}
                      alt={selectedApp.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-muted"
                    />
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">
                        {selectedApp.name}
                      </h1>
                      <p className="text-muted-foreground flex items-center gap-2">
                        @{selectedApp.username} &middot; {selectedApp.email}
                      </p>
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none text-foreground mb-10">
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                      Personal Bio
                    </h3>
                    <p className="leading-relaxed text-base text-muted-foreground">
                      {selectedApp.scholarProfile.bio}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-10 mb-10">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                        Teaching Specialties
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedApp.scholarProfile.specialties.map(
                          (s) => (
                            <span
                              key={s}
                              className="px-3 py-1.5 bg-primary/5 text-primary border border-primary/10 rounded-lg text-sm font-medium"
                            >
                              {s}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                        Teaching Languages
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedApp.scholarProfile.teachingLanguages.map(
                          (lang) => (
                            <span
                              key={lang}
                              className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-sm font-medium"
                            >
                              {lang}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedApp.scholarProfile.rejectionReason && (
                    <div className="mb-10 p-4 bg-rose-50/50 border border-rose-100 rounded-xl">
                      <h3 className="text-sm font-semibold text-rose-700 mb-1">
                        Rejection Reason
                      </h3>
                      <p className="text-sm text-rose-600">
                        {selectedApp.scholarProfile.rejectionReason}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center justify-between">
                      <span>Attached Credentials</span>
                      <span className="text-sm font-normal text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                        {selectedApp.scholarProfile.credentials.length} files
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedApp.scholarProfile.credentials.map(
                        (cred, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-4 p-4 border rounded-xl hover:bg-muted/30 transition-colors group cursor-pointer"
                          >
                            <div className="p-3 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                              <Paperclip className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-foreground mb-1">
                                {cred.title}
                              </h4>
                              <p className="text-xs text-muted-foreground mb-2">
                                {cred.institution} &bull; {cred.year}
                              </p>
                              {cred.documentUrl && (
                                <a
                                  href={cred.documentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary font-medium hover:underline"
                                >
                                  Preview Document
                                </a>
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">
                  Select an application
                </h3>
                <p className="text-sm text-center max-w-sm">
                  Choose an application from the inbox on the left to review
                  its details and make a decision.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Verified Scholars Tab */
        <div className="flex-1 overflow-y-auto p-6">
          {scholarsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(scholarsData?.scholars ?? []).map((scholar) => (
                  <div
                    key={scholar._id}
                    className="p-5 border rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={scholar.avatar || '/default-avatar.png'}
                        alt={scholar.name}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                      <div>
                        <h4 className="font-semibold text-sm">
                          {scholar.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          @{scholar.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {scholar.scholarProfile.specialties.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] bg-primary/5 text-primary px-1.5 py-0.5 rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {scholar.scholarProfile.totalStudents ?? 0} students
                      </span>
                      <span>
                        {scholar.scholarProfile.totalCourses ?? 0} courses
                      </span>
                      {scholar.scholarProfile.verifiedAt && (
                        <span>
                          Since{' '}
                          {new Date(
                            scholar.scholarProfile.verifiedAt,
                          ).toLocaleDateString(undefined, {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {scholarsData?.pagination &&
                scholarsData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      disabled={scholarsPage <= 1}
                      onClick={() => setScholarsPage((p) => p - 1)}
                      className="p-2 rounded hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Page {scholarsData.pagination.page} of{' '}
                      {scholarsData.pagination.totalPages}
                    </span>
                    <button
                      disabled={
                        scholarsPage >= scholarsData.pagination.totalPages
                      }
                      onClick={() => setScholarsPage((p) => p + 1)}
                      className="p-2 rounded hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
