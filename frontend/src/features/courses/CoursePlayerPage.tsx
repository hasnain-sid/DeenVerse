import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Check,
  ChevronLeft,
  FileText,
  Play,
  BookOpen,
  MessageSquare,
  Plus,
  X,
  Menu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  useCourseDetail,
  useCourseProgress,
  useUpdateProgress,
  useLessonContent,
  type CourseModule,
  type CourseLesson,
} from '@/features/courses/useCourses';

// ── Local types ──────────────────────────────────────

interface LocalNote {
  id: string;
  content: string;
  createdAt: string;
}

// ── Helpers ──────────────────────────────────────────

const notesKey = (slug: string, lessonId: string) => `dv_notes_${slug}_${lessonId}`;

function LessonIcon({
  type,
  completed,
  active,
}: {
  type: string;
  completed: boolean;
  active: boolean;
}) {
  const cls = `w-4 h-4 ${active ? 'text-black' : completed ? 'text-emerald-400' : 'text-slate-400'}`;
  if (completed) return <Check className={cls} />;
  if (type === 'video') return <Play className={cls} fill="currentColor" />;
  return <FileText className={cls} />;
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-white/10 rounded-lg ${className ?? ''}`} />;
}

// ── Page Component ───────────────────────────────────

export function CoursePlayerPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [addingNote, setAddingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<LocalNote[]>([]);

  const {
    data: courseData,
    isLoading: courseLoading,
    isError: courseError,
  } = useCourseDetail(slug ?? '');
  const { data: progressData, isLoading: progressLoading } = useCourseProgress(slug ?? '');
  const updateProgress = useUpdateProgress();
  const { data: lessonData, isLoading: lessonLoading } = useLessonContent(
    slug ?? '',
    activeLessonId
  );

  const course = courseData?.course;
  const completedLessons = progressData?.progress?.completedLessons ?? [];
  const percentComplete = progressData?.progress?.percentComplete ?? 0;

  const allLessons = useMemo(
    () => course?.modules?.flatMap((m) => m.lessons) ?? [],
    [course]
  );

  // Set initial lesson once course + progress are loaded
  useEffect(() => {
    if (activeLessonId || !course || !allLessons.length) return;
    const firstIncomplete = allLessons.find((l) => !completedLessons.includes(l._id));
    setActiveLessonId(firstIncomplete?._id ?? allLessons[0]._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, allLessons]);

  // Load notes from localStorage when lesson changes
  useEffect(() => {
    if (!activeLessonId || !slug) return;
    try {
      const stored = localStorage.getItem(notesKey(slug, activeLessonId));
      setNotes(stored ? (JSON.parse(stored) as LocalNote[]) : []);
    } catch {
      setNotes([]);
    }
    setAddingNote(false);
    setNoteText('');
  }, [activeLessonId, slug]);

  const currentIndex = useMemo(
    () => allLessons.findIndex((l) => l._id === activeLessonId),
    [allLessons, activeLessonId]
  );
  const nextLesson = allLessons[currentIndex + 1] ?? null;
  const prevLesson = allLessons[currentIndex - 1] ?? null;
  const currentLesson = allLessons[currentIndex] ?? null;
  const isComplete = activeLessonId ? completedLessons.includes(activeLessonId) : false;

  const handleMarkComplete = useCallback(() => {
    if (!slug || !activeLessonId) return;
    updateProgress.mutate(
      { slug, lessonId: activeLessonId },
      {
        onSuccess: () => {
          if (nextLesson) {
            toast.success('Lesson completed! Moving to next lesson…');
            setTimeout(() => setActiveLessonId(nextLesson._id), 700);
          } else {
            toast.success('🎉 You have completed this course!');
          }
        },
      }
    );
  }, [slug, activeLessonId, updateProgress, nextLesson]);

  const handleSaveNote = useCallback(() => {
    if (!noteText.trim() || !activeLessonId || !slug) return;
    const newNote: LocalNote = {
      id: Date.now().toString(),
      content: noteText.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...notes, newNote];
    setNotes(updated);
    localStorage.setItem(notesKey(slug, activeLessonId), JSON.stringify(updated));
    setNoteText('');
    setAddingNote(false);
  }, [noteText, activeLessonId, slug, notes]);

  const handleDeleteNote = useCallback(
    (id: string) => {
      if (!activeLessonId || !slug) return;
      const updated = notes.filter((n) => n.id !== id);
      setNotes(updated);
      localStorage.setItem(notesKey(slug, activeLessonId), JSON.stringify(updated));
    },
    [notes, activeLessonId, slug]
  );

  const isLoading = courseLoading || progressLoading;

  // ── Error state ──────────────────────────────────

  if (courseError) {
    return (
      <div className="h-screen bg-[#0F172A] text-white flex items-center justify-center flex-col gap-4">
        <p className="text-lg font-semibold">Course not found or access denied.</p>
        <Button variant="outline" onClick={() => navigate('/courses')}>
          Browse Courses
        </Button>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────

  return (
    <div className="h-screen w-full bg-[#0F172A] flex flex-col font-sans overflow-hidden text-slate-200">
      {/* ── Top Header ── */}
      <header className="h-14 bg-[#0B1120] border-b border-white/10 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/courses/${slug}`)}
            className="text-slate-400 hover:text-white px-0 hover:bg-transparent"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline font-medium">Back to Course</span>
          </Button>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          {isLoading ? (
            <SkeletonBlock className="h-4 w-48" />
          ) : (
            <h1 className="font-semibold text-white tracking-wide truncate max-w-[200px] md:max-w-md">
              {course?.title}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && (
            <span className="text-xs font-semibold text-emerald-400 hidden sm:block uppercase tracking-wider">
              {percentComplete}% Complete
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="border-white/20 hover:bg-white/10 text-white bg-transparent hidden md:flex"
          >
            {rightPanelOpen ? 'Hide' : 'Show'} Syllabus
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="md:hidden text-slate-300"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* ── Main content ── */}
      <div className="flex-1 flex overflow-hidden relative">
        <main
          className={`flex-1 h-full flex flex-col bg-[#0F172A] relative overflow-y-auto transition-all duration-300 ${
            rightPanelOpen ? 'md:pr-[350px] lg:pr-[400px]' : ''
          }`}
        >
          {/* Video / Content Area */}
          <div className="w-full bg-black shrink-0 relative flex flex-col max-h-[75vh]">
            {isLoading || lessonLoading ? (
              <SkeletonBlock className="w-full aspect-video md:aspect-video rounded-none" />
            ) : currentLesson?.type === 'video' ? (
              <div className="w-full aspect-video relative overflow-hidden group bg-[#1E293B]">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center opacity-90 cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-medium text-sm">
                    {lessonData?.lesson?.title ?? currentLesson.title}
                  </p>
                  {currentLesson.durationMinutes != null && (
                    <p className="text-slate-400 text-xs mt-1">
                      {currentLesson.durationMinutes} min
                    </p>
                  )}
                </div>
              </div>
            ) : currentLesson?.type === 'text' ? (
              <div className="w-full bg-[#1E293B] flex flex-col items-center justify-center py-16 px-8 border-b border-white/5 min-h-[240px]">
                <FileText className="w-14 h-14 mb-4 text-emerald-400 opacity-80" />
                <h2 className="text-2xl font-bold text-white">
                  {lessonData?.lesson?.title ?? currentLesson.title}
                </h2>
                <p className="text-slate-400 mt-2 text-sm">Reading lesson</p>
              </div>
            ) : currentLesson ? (
              <div className="w-full bg-[#1E293B] flex flex-col items-center justify-center py-16 px-8 border-b border-white/5 min-h-[240px]">
                <FileText className="w-14 h-14 mb-4 text-amber-400 opacity-80" />
                <h2 className="text-2xl font-bold text-white">
                  {lessonData?.lesson?.title ?? currentLesson.title}
                </h2>
                <p className="text-slate-400 mt-2 text-sm capitalize">{currentLesson.type} lesson</p>
              </div>
            ) : null}
          </div>

          {/* Lesson info area */}
          <div className="p-6 md:p-8 xl:p-12 max-w-5xl mx-auto w-full">
            {/* Title + Complete button */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              {isLoading ? (
                <div className="space-y-3 flex-1">
                  <SkeletonBlock className="h-8 w-3/4" />
                  <SkeletonBlock className="h-4 w-full" />
                </div>
              ) : (
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {lessonData?.lesson?.title ?? currentLesson?.title ?? '—'}
                  </h2>
                  {lessonData?.lesson?.content && (
                    <p className="text-slate-400 text-base leading-relaxed whitespace-pre-wrap">
                      {String(lessonData.lesson.content)}
                    </p>
                  )}
                </div>
              )}
              <div className="shrink-0">
                <Button
                  size="lg"
                  disabled={isComplete || updateProgress.isPending || isLoading}
                  onClick={handleMarkComplete}
                  className={
                    isComplete
                      ? 'bg-emerald-700/40 text-emerald-300 border border-emerald-700/50 cursor-default font-bold rounded-lg'
                      : 'font-bold rounded-lg text-black bg-primary hover:bg-primary/90'
                  }
                >
                  {updateProgress.isPending ? (
                    <div className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin mr-2" />
                  ) : isComplete ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : null}
                  {isComplete ? 'Completed' : 'Mark as Complete'}
                </Button>
              </div>
            </div>

            {/* Resources */}
            {(lessonData?.lesson?.resources?.length ?? 0) > 0 && (
              <div className="bg-[#1E293B] rounded-xl p-5 border border-white/5 mb-6">
                <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
                  Resources
                </h3>
                <ul className="space-y-1.5">
                  {lessonData!.lesson.resources!.map((r, i) => (
                    <li key={i}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        {r.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-24">
              {/* Notes section */}
              <div className="md:col-span-2">
                <div className="bg-[#1E293B] rounded-xl p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" /> My Notes
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAddingNote(!addingNote)}
                      className="text-primary hover:text-primary hover:bg-primary/10 gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Note
                    </Button>
                  </div>

                  <AnimatePresence>
                    {addingNote && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-4"
                      >
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Type your note…"
                          rows={3}
                          className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-500 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" onClick={handleSaveNote} disabled={!noteText.trim()}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setAddingNote(false);
                              setNoteText('');
                            }}
                            className="text-slate-400 hover:text-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {notes.length === 0 && !addingNote && (
                    <p className="text-slate-500 text-sm text-center py-4">
                      No notes yet for this lesson.
                    </p>
                  )}

                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="border-l-2 border-primary pl-4 py-1 group relative"
                      >
                        <p className="text-slate-300 text-sm pr-5">{note.content}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="absolute top-1 right-0 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"
                          aria-label="Delete note"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!prevLesson}
                    onClick={() => prevLesson && setActiveLessonId(prevLesson._id)}
                    className="flex-1 border-white/10 hover:bg-white/5 hover:text-white bg-[#1E293B] text-slate-300 disabled:opacity-30"
                  >
                    ← Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!nextLesson}
                    onClick={() => nextLesson && setActiveLessonId(nextLesson._id)}
                    className="flex-1 border-white/10 hover:bg-white/5 hover:text-white bg-[#1E293B] text-slate-300 disabled:opacity-30"
                  >
                    Next →
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/courses/${slug}`)}
                  className="w-full justify-start gap-3 h-10 border-white/10 hover:bg-white/5 hover:text-white bg-[#1E293B] text-slate-300 text-sm"
                >
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  Course Overview
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* ── Right Sidebar Syllabus ── */}
        <aside
          className={`fixed md:absolute right-0 top-14 bottom-0 w-[350px] lg:w-[400px] bg-[#1E293B] border-l border-white/5 flex flex-col transition-transform duration-300 z-20 shadow-2xl ${
            rightPanelOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-white/5 bg-[#0F172A] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white">Course Syllabus</h3>
              <div className="mt-1.5">
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
                <p className="text-xs text-primary font-semibold mt-1 uppercase tracking-wider">
                  {percentComplete}% Complete
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRightPanelOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 px-4 py-2 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-4 mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <SkeletonBlock className="h-4 w-32" />
                    {[1, 2, 3].map((j) => (
                      <SkeletonBlock key={j} className="h-10 w-full" />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6 pb-20 mt-4">
                {course?.modules?.map((module: CourseModule, mIndex: number) => (
                  <div key={mIndex} className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                      Section {mIndex + 1} · {module.title}
                    </h4>
                    <div className="space-y-1">
                      {module.lessons.map((lesson: CourseLesson) => {
                        const isLessonComplete = completedLessons.includes(lesson._id);
                        const isActive = activeLessonId === lesson._id;
                        return (
                          <button
                            key={lesson._id}
                            onClick={() => setActiveLessonId(lesson._id)}
                            className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 group ${
                              isActive
                                ? 'bg-primary text-black'
                                : 'hover:bg-white/5 text-slate-400'
                            }`}
                          >
                            <div className="mt-0.5 opacity-80 shrink-0">
                              <LessonIcon
                                type={lesson.type}
                                completed={isLessonComplete}
                                active={isActive}
                              />
                            </div>
                            <div className="flex-1">
                              <p
                                className={`text-sm font-semibold leading-snug line-clamp-2 ${
                                  isActive
                                    ? 'text-black'
                                    : 'text-slate-200 group-hover:text-white'
                                }`}
                              >
                                {lesson.title}
                              </p>
                              {lesson.durationMinutes != null && (
                                <div
                                  className={`text-xs mt-1 font-medium ${
                                    isActive ? 'text-black/70' : 'text-slate-500'
                                  }`}
                                >
                                  {lesson.durationMinutes}m
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
