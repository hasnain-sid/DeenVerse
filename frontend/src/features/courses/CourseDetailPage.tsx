import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  PlayCircle,
  BookOpen,
  Clock,
  Users,
  Award,
  Shield,
  CheckCircle,
  Loader2,
  Bell,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/authStore';
import { useCourseDetail, useEnrollCourse } from './useCourses';
import { useCreateCheckout } from '@/features/payments/usePayments';
import { useUpcomingClassrooms } from '@/features/classroom/useClassroom';

function formatDuration(minutes?: number): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function buildClassroomCalendarUrl(title: string, description: string | undefined, scheduledAt: string, duration: number) {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + duration * 60 * 1000);
  const formatCalendarDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatCalendarDate(start)}/${formatCalendarDate(end)}`,
    details: description ?? 'Join this DeenVerse classroom session.',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function CourseDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data, isLoading, isError } = useCourseDetail(slug);
  const { data: upcomingClassroomsData } = useUpcomingClassrooms(slug);
  const enrollCourse = useEnrollCourse();
  const createCheckout = useCreateCheckout();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground">Course not found.</p>
        <Button variant="outline" onClick={() => navigate('/courses')}>
          Browse Courses
        </Button>
      </div>
    );
  }

  const { course, isEnrolled } = data;
  const upcomingClassrooms = upcomingClassroomsData?.classrooms ?? [];
  const isFree = course.pricing.type === 'free';
  const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const totalDurationMinutes = course.modules.reduce(
    (sum, module) =>
      sum + module.lessons.reduce((lessonSum, lesson) => lessonSum + (lesson.duration ?? 0), 0),
    0,
  );
  const totalDuration = formatDuration(totalDurationMinutes);
  const enrollmentCount = course.enrollmentCount ?? 0;
  const courseRating = course.rating?.average ?? 0;
  const reviewCount = course.rating?.count ?? 0;

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isEnrolled) {
      navigate(`/courses/${slug}/learn`);
      return;
    }
    if (isFree) {
      enrollCourse.mutate(
        { slug },
        { onSuccess: () => navigate(`/courses/${slug}/learn`) },
      );
    } else {
      createCheckout.mutate({
        courseSlug: slug,
        successUrl: `${window.location.origin}/checkout?success=true&course=${slug}`,
        cancelUrl: window.location.href,
      });
    }
  };

  const handleJoinClassroom = (classroomId: string) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/classrooms/${classroomId}/live` } });
      return;
    }

    navigate(`/classrooms/${classroomId}/live`);
  };

  const ctaLabel = isEnrolled
    ? 'Continue Learning'
    : !isAuthenticated
      ? 'Sign Up to Enroll'
      : isFree
        ? 'Enroll Free'
        : `Enroll — $${course.pricing.amount ?? 0}`;

  const ctaLoading = enrollCourse.isPending || createCheckout.isPending;
  const priceDisplay = isFree ? 'Free' : `$${course.pricing.amount ?? 0}`;

  const instructorSpecialty =
    course.instructor.scholarProfile?.specializations?.join(', ') ?? '';
  const instructorRating = course.instructor.scholarProfile?.averageRating;
  const instructorStudents = course.instructor.scholarProfile?.totalStudents;
  const instructorBio = course.instructor.scholarProfile?.bio;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Sticky sub-header (sits below MainLayout's top nav) */}
      <header className="sticky top-16 z-30 bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 overflow-hidden">
            <div className="w-16 h-12 rounded overflow-hidden shrink-0 hidden sm:block">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <BookOpen size={20} className="text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="truncate">
              <h1 className="font-bold text-lg truncate">{course.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                  <Star size={14} className="fill-amber-500" />{' '}
                  {courseRating.toFixed(1)}
                </span>
                <span>&bull;</span>
                <span>{course.instructor.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-xl font-bold hidden md:block">{priceDisplay}</div>
            <Button
              className="font-semibold"
              onClick={handleEnrollClick}
              disabled={ctaLoading}
            >
              {ctaLoading ? <Loader2 size={16} className="animate-spin" /> : ctaLabel}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 text-left">
        <Tabs defaultValue="overview" className="w-full space-y-8">
          <TabsList className="bg-muted p-1 rounded-lg w-full sm:w-auto overflow-x-auto flex pb-2 sm:pb-1">
            <TabsTrigger value="overview" className="flex-1 sm:flex-none">
              Overview
            </TabsTrigger>
            <TabsTrigger value="syllabus" className="flex-1 sm:flex-none">
              Syllabus
            </TabsTrigger>
            <TabsTrigger value="instructor" className="flex-1 sm:flex-none">
              Instructor
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1 sm:flex-none">
              Reviews
            </TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ─────────────────────────────────────── */}
          <TabsContent
            value="overview"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left: preview + description + outcomes/requirements */}
              <div className="lg:col-span-2 space-y-8">
                <div className="aspect-video rounded-xl overflow-hidden relative group">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      className="w-full h-full object-cover"
                      alt={course.title}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <BookOpen size={48} className="text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                      <PlayCircle size={40} className="text-white" />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-4">About this course</h2>
                  <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                </div>

                {(course.learningOutcomes?.length || course.requirements?.length) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {course.learningOutcomes?.length ? (
                      <div className="bg-card border border-border p-6 rounded-xl">
                        <h3 className="font-bold flex items-center gap-2 mb-4">
                          <CheckCircle className="text-primary" /> Learning Outcomes
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {course.learningOutcomes.map((o, i) => (
                            <li key={i} className="flex gap-2">
                              &bull; {o}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {course.requirements?.length ? (
                      <div className="bg-card border border-border p-6 rounded-xl">
                        <h3 className="font-bold flex items-center gap-2 mb-4">
                          <Shield className="text-primary" /> Requirements
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {course.requirements.map((r, i) => (
                            <li key={i} className="flex gap-2">
                              &bull; {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {/* Right: stats + enroll CTA */}
              <div className="space-y-6">
                <div className="bg-muted/50 p-6 rounded-xl border border-border">
                  <h3 className="font-bold mb-4">Course Features</h3>
                  <div className="space-y-4 text-sm font-medium">
                    {totalDuration ? (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Clock size={16} /> Total Duration
                        </span>
                        <span>{totalDuration}</span>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <BookOpen size={16} /> Total Lessons
                      </span>
                      <span>{totalLessons}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Award size={16} /> Skill Level
                      </span>
                      <span className="capitalize">{course.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Users size={16} /> Students
                      </span>
                      <span>{enrollmentCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <BookOpen size={16} /> Format
                      </span>
                      <span className="capitalize">{course.type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Shield size={16} /> Language
                      </span>
                      <span className="uppercase">{course.language}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-xl border border-border space-y-4">
                  <div className="text-3xl font-bold">{priceDisplay}</div>
                  <Button
                    className="w-full font-semibold"
                    onClick={handleEnrollClick}
                    disabled={ctaLoading}
                  >
                    {ctaLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      ctaLabel
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── SYLLABUS ─────────────────────────────────────── */}
          <TabsContent
            value="syllabus"
            className="max-w-3xl animate-in fade-in duration-500 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Course Syllabus</h2>
              <div className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                {course.modules?.length ?? 0} Modules &bull; {totalLessons} Lessons
              </div>
            </div>

            {course.modules?.length ? (
              <div className="space-y-6">
                {course.modules.map((module, idx) => (
                  <div
                    key={idx}
                    className="border border-border rounded-xl p-6 bg-card shadow-sm"
                  >
                    <h3 className="font-bold text-lg mb-4">{module.title}</h3>
                    {module.lessons?.length ? (
                      <ul className="space-y-3">
                        {module.lessons.map((lesson, li) => (
                          <li
                            key={lesson._id ?? li}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/60 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-background rounded-md shadow-sm border border-border">
                                {lesson.type === 'video' ? (
                                  <PlayCircle size={16} className="text-primary" />
                                ) : lesson.type === 'quiz' ? (
                                  <CheckCircle size={16} className="text-primary" />
                                ) : (
                                  <BookOpen size={16} className="text-primary" />
                                )}
                              </div>
                              <span className="font-medium text-sm">{lesson.title}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              {lesson.isFree && (
                                <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                                  FREE
                                </span>
                              )}
                              {lesson.duration ? (
                                <span className="text-sm text-muted-foreground">
                                  {formatDuration(lesson.duration)}
                                </span>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}

                {upcomingClassrooms.length > 0 && (
                  <div className="border border-border rounded-xl p-6 bg-card shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">Upcoming Live Sessions</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Stay synced with the live classroom sessions connected to this course.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate('/classrooms')}>
                        View All Classrooms
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {upcomingClassrooms.map((classroom) => {
                        const scheduledDate = new Date(classroom.scheduledAt);
                        const calendarUrl = buildClassroomCalendarUrl(
                          classroom.title,
                          classroom.description,
                          classroom.scheduledAt,
                          classroom.duration,
                        );

                        return (
                          <div
                            key={classroom._id}
                            className="rounded-xl border border-border bg-muted/20 p-4"
                          >
                            <div className="flex items-center justify-between gap-3 mb-3">
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                                {classroom.type}
                              </span>
                              <span className="text-xs text-muted-foreground capitalize">
                                {classroom.access}
                              </span>
                            </div>

                            <h4 className="font-semibold text-foreground leading-snug">
                              {classroom.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {classroom.host.name}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Clock size={14} />
                                {scheduledDate.toLocaleDateString(undefined, {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}{' '}
                                at{' '}
                                {scheduledDate.toLocaleTimeString(undefined, {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Users size={14} />
                                {classroom.maxParticipants} seats
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-4">
                              {classroom.status === 'live' ? (
                                <Button size="sm" onClick={() => handleJoinClassroom(classroom._id)}>
                                  <Radio className="mr-2 h-4 w-4" />
                                  Join
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(calendarUrl, '_blank', 'noopener,noreferrer')}
                                >
                                  <Bell className="mr-2 h-4 w-4" />
                                  Notify Me
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Syllabus not yet available.</p>
            )}
          </TabsContent>

          {/* ── INSTRUCTOR ───────────────────────────────────── */}
          <TabsContent
            value="instructor"
            className="max-w-3xl animate-in fade-in duration-500"
          >
            <div className="border border-border rounded-2xl p-8 bg-card text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-8 shadow-sm">
              {course.instructor.avatar ? (
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-muted shrink-0"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center shrink-0 text-4xl font-bold text-muted-foreground">
                  {course.instructor.name.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold mb-1">{course.instructor.name}</h2>
                {instructorSpecialty && (
                  <p className="text-primary font-medium mb-4">{instructorSpecialty}</p>
                )}

                <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm font-bold mb-6">
                  {instructorRating != null && (
                    <div className="flex items-center gap-1">
                      <Star className="text-amber-500 fill-amber-500" size={16} />
                      {instructorRating.toFixed(1)} Avg. Rating
                    </div>
                  )}
                  {instructorStudents != null && (
                    <div className="flex items-center gap-1">
                      <Users className="text-muted-foreground" size={16} />
                      {instructorStudents.toLocaleString()} Students
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-blue-500">
                    <Shield size={16} /> Verified Scholar
                  </div>
                </div>

                {instructorBio && (
                  <p className="text-muted-foreground leading-relaxed text-sm">{instructorBio}</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── REVIEWS ──────────────────────────────────────── */}
          <TabsContent
            value="reviews"
            className="max-w-3xl animate-in fade-in duration-500 space-y-8"
          >
            <div className="flex items-center gap-6 p-6 bg-muted/30 rounded-2xl border border-border">
              <div className="text-center">
                <div className="text-5xl font-black text-amber-500">
                  {courseRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center my-2 text-amber-500">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i <= Math.round(courseRating)
                          ? 'fill-amber-500'
                          : 'fill-amber-500/30'
                      }
                    />
                  ))}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                </div>
              </div>
            </div>

            {reviewCount === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No reviews yet. Be the first!
              </p>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
