import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { CourseCategory, CourseLevel, CourseType, CourseFilters } from '@deenverse/shared';

type ApiError = AxiosError<{ message?: string }>;

// ── Response types (API shapes) ──────────────────────

export interface CourseInstructor {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface Course {
  _id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  category: CourseCategory;
  level: CourseLevel;
  language: string;
  type: CourseType;
  pricing: {
    type: 'free' | 'paid' | 'subscription';
    amount?: number;
    currency?: string;
  };
  instructor: CourseInstructor;
  enrollmentCount: number;
  rating: {
    average: number;
    count: number;
  };
  tags?: string[];
  certificateOnCompletion?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoursesResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FeaturedCoursesResponse {
  courses: Course[];
}

// Re-export shared filter types for consumers
export type { CourseCategory, CourseLevel, CourseType, CourseFilters };

// ── Hooks ────────────────────────────────────────────

export function useCourses(filters?: CourseFilters) {
  return useQuery<CoursesResponse>({
    queryKey: ['courses', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.set('category', filters.category);
      if (filters?.level) params.set('level', filters.level);
      if (filters?.type) params.set('type', filters.type);
      if (filters?.search) params.set('search', filters.search);
      if (filters?.sort) params.set('sort', filters.sort);
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.limit) params.set('limit', String(filters.limit));

      const { data } = await api.get<CoursesResponse>(`/courses?${params.toString()}`);
      return data;
    },
  });
}

export function useFeaturedCourses() {
  return useQuery<FeaturedCoursesResponse>({
    queryKey: ['courses', 'featured'],
    queryFn: async () => {
      const { data } = await api.get<FeaturedCoursesResponse>('/courses/featured');
      return data;
    },
  });
}

// ── Course Detail types ──────────────────────────────

export interface CourseLesson {
  _id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  durationMinutes?: number;
  isFree?: boolean;
  order: number;
}

export interface CourseModule {
  title: string;
  description?: string;
  order: number;
  lessons: CourseLesson[];
}

export interface CourseDetailInstructor {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  scholarProfile?: {
    specializations?: string[];
    bio?: string;
    averageRating?: number;
    totalStudents?: number;
  };
}

export interface CourseDetail extends Omit<Course, 'instructor'> {
  modules: CourseModule[];
  learningOutcomes?: string[];
  requirements?: string[];
  totalDuration?: string;
  status?: string;
  instructor: CourseDetailInstructor;
}

export interface CourseDetailResponse {
  course: CourseDetail;
  enrollmentCount: number;
  isEnrolled: boolean;
}

// ── Detail & Enrollment Hooks ────────────────────────

export function useCourseDetail(slug: string) {
  return useQuery<CourseDetailResponse>({
    queryKey: ['courses', 'detail', slug],
    queryFn: async () => {
      const { data } = await api.get<CourseDetailResponse>(`/courses/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();
  return useMutation<{ enrollment: { _id: string } }, ApiError, { slug: string }>({
    mutationFn: async ({ slug }) => {
      const { data } = await api.post<{ enrollment: { _id: string } }>(`/courses/${slug}/enroll`);
      return data;
    },
    onSuccess: (_data, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', slug] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to enroll in course');
    },
  });
}

// ── Teaching / Builder types ─────────────────────────

export interface TeachingCoursesResponse {
  courses: CourseDetail[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export type CreateCourseInput = {
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  level: string;
  language: string;
  type: string;
  pricing: { type: 'free' | 'paid' | 'subscription'; amount?: number; currency?: string };
  modules?: Array<{
    title: string;
    description?: string;
    order: number;
    lessons: Array<{
      title: string;
      type: string;
      order: number;
      isFree?: boolean;
      duration?: number;
    }>;
  }>;
  requirements?: string[];
  learningOutcomes?: string[];
  tags?: string[];
  maxStudents?: number;
  certificateOnCompletion?: boolean;
};

// ── Scholar teaching hooks ───────────────────────────

export function useMyTeaching(status?: string, page = 1) {
  return useQuery<TeachingCoursesResponse>({
    queryKey: ['courses', 'teaching', status, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      params.set('page', String(page));
      const { data } = await api.get<TeachingCoursesResponse>(`/courses/teaching?${params.toString()}`);
      return data;
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation<{ course: CourseDetail }, ApiError, CreateCourseInput>({
    mutationFn: async (input) => {
      const { data } = await api.post<{ course: CourseDetail }>('/courses', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'teaching'] });
      toast.success('Course created successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to create course');
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation<{ course: CourseDetail }, ApiError, { slug: string; data: Partial<CreateCourseInput> }>({
    mutationFn: async ({ slug, data: input }) => {
      const { data } = await api.put<{ course: CourseDetail }>(`/courses/${slug}`, input);
      return data;
    },
    onSuccess: (_data, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'teaching'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', slug] });
      toast.success('Course updated successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to update course');
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, ApiError, { slug: string }>({
    mutationFn: async ({ slug }) => {
      const { data } = await api.delete<{ message: string }>(`/courses/${slug}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'teaching'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to delete course');
    },
  });
}

export function usePublishCourse() {
  const queryClient = useQueryClient();
  return useMutation<{ course: CourseDetail }, ApiError, { slug: string }>({
    mutationFn: async ({ slug }) => {
      const { data } = await api.put<{ course: CourseDetail }>(`/courses/${slug}/publish`);
      return data;
    },
    onSuccess: (_data, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'teaching'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', slug] });
      toast.success('Course submitted for review!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to submit course for review');
    },
  });
}

export function useAddModule() {
  const queryClient = useQueryClient();
  return useMutation<
    { course: CourseDetail },
    ApiError,
    { slug: string; module: { title: string; description?: string; order: number; lessons: CourseLesson[] } }
  >({
    mutationFn: async ({ slug, module }) => {
      const { data } = await api.post<{ course: CourseDetail }>(`/courses/${slug}/modules`, module);
      return data;
    },
    onSuccess: (_data, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', slug] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'teaching'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to add module');
    },
  });
}

export function useUpdateModule() {
  const queryClient = useQueryClient();
  return useMutation<
    { course: CourseDetail },
    ApiError,
    { slug: string; moduleIndex: number; data: Partial<CourseModule> }
  >({
    mutationFn: async ({ slug, moduleIndex, data: moduleData }) => {
      const { data } = await api.put<{ course: CourseDetail }>(
        `/courses/${slug}/modules/${moduleIndex}`,
        moduleData
      );
      return data;
    },
    onSuccess: (_data, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', slug] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to update module');
    },
  });
}

export function useDeleteModule() {
  const queryClient = useQueryClient();
  return useMutation<{ course: CourseDetail }, ApiError, { slug: string; moduleIndex: number }>({
    mutationFn: async ({ slug, moduleIndex }) => {
      const { data } = await api.delete<{ course: CourseDetail }>(
        `/courses/${slug}/modules/${moduleIndex}`
      );
      return data;
    },
    onSuccess: (_data, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', slug] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'teaching'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to delete module');
    },
  });
}

// ── Progress & Lesson types ──────────────────────────

export interface CourseProgress {
  completedLessons: string[];
  currentModule: number;
  currentLesson: number;
  percentComplete: number;
  lastAccessedAt?: string;
}

export interface EnrollmentProgress {
  _id: string;
  status: 'active' | 'completed' | 'dropped' | 'suspended';
  progress: CourseProgress;
  enrolledAt: string;
  completedAt?: string;
}

export interface LessonContent {
  _id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'live-session' | 'assignment';
  content?: string;
  duration?: number;
  isFree?: boolean;
  resources?: Array<{ name: string; url: string; type: string }>;
  order: number;
}

export interface LessonContentResponse {
  lesson: LessonContent;
  nextLesson?: { _id: string; title: string };
  prevLesson?: { _id: string; title: string };
}

// ── Progress & Lesson Hooks ──────────────────────────

export function useCourseProgress(slug: string) {
  return useQuery<EnrollmentProgress>({
    queryKey: ['courses', 'progress', slug],
    queryFn: async () => {
      const { data } = await api.get<EnrollmentProgress>(`/courses/${slug}/progress`);
      return data;
    },
    enabled: !!slug,
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  return useMutation<EnrollmentProgress, ApiError, { slug: string; lessonId: string }>({
    mutationFn: async ({ slug, lessonId }) => {
      const { data } = await api.put<EnrollmentProgress>(`/courses/${slug}/progress`, {
        lessonId,
        completed: true,
      });
      return data;
    },
    onSuccess: (_data, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'progress', slug] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to update progress');
    },
  });
}

export function useLessonContent(slug: string, lessonId: string | null) {
  return useQuery<LessonContentResponse>({
    queryKey: ['courses', 'lesson', slug, lessonId],
    queryFn: async () => {
      const { data } = await api.get<LessonContentResponse>(
        `/courses/${slug}/lessons/${lessonId}`
      );
      return data;
    },
    enabled: !!slug && !!lessonId,
  });
}

// ── Quiz types ───────────────────────────────────────

export interface QuizQuestion {
  _id: string;
  text: string;
  type: 'mcq' | 'true-false' | 'short-answer' | 'essay' | 'quran-recitation';
  options?: Array<{ text: string }>;
  points: number;
  explanation?: string; // Only returned in results
  correctOptionIndex?: number; // Only returned in results
}

export interface QuizInfo {
  _id: string;
  title: string;
  timeLimit: number; // minutes, 0 = unlimited
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
}

export interface QuizStartResponse {
  attemptId: string;
  quiz: QuizInfo;
  questions: QuizQuestion[];
  startedAt: string;
  attempt: number;
}

export interface QuizAnswer {
  questionIndex: number;
  answer: string | number | boolean;
}

export interface QuizResultQuestion {
  questionIndex: number;
  answer: unknown;
  isCorrect: boolean;
}

export interface QuizSubmitResponse {
  score: number;
  passed: boolean;
  attempt: {
    _id: string;
    score: number;
    passed: boolean;
    submittedAt: string;
    attempt: number;
  };
  answers?: QuizResultQuestion[];
  questions?: Array<QuizQuestion & { explanation?: string }>;
}

export interface QuizAttempt {
  _id: string;
  score: number;
  passed: boolean;
  startedAt: string;
  submittedAt?: string;
  attempt: number;
}

export interface QuizResultsResponse {
  attempts: QuizAttempt[];
  bestScore: number;
  passed: boolean;
}

// ── My Courses types ─────────────────────────────────

export interface MyCourseItem {
  _id: string;
  status: 'active' | 'completed' | 'dropped' | 'suspended';
  progress: CourseProgress;
  enrolledAt: string;
  completedAt?: string;
  course: Course;
}

export interface MyCoursesResponse {
  enrollments: MyCourseItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ── Quiz Hooks ───────────────────────────────────────

export function useStartQuiz() {
  return useMutation<QuizStartResponse, ApiError, { quizId: string }>({
    mutationFn: async ({ quizId }) => {
      const { data } = await api.post<QuizStartResponse>(`/quizzes/${quizId}/start`);
      return data;
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to start quiz');
    },
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  return useMutation<
    QuizSubmitResponse,
    ApiError,
    { quizId: string; attemptId: string; answers: QuizAnswer[] }
  >({
    mutationFn: async ({ quizId, attemptId, answers }) => {
      const { data } = await api.post<QuizSubmitResponse>(`/quizzes/${quizId}/submit`, {
        attemptId,
        answers,
      });
      return data;
    },
    onSuccess: (_data, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: ['quiz', 'results', quizId] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to submit quiz');
    },
  });
}

export function useQuizResults(quizId: string) {
  return useQuery<QuizResultsResponse>({
    queryKey: ['quiz', 'results', quizId],
    queryFn: async () => {
      const { data } = await api.get<QuizResultsResponse>(`/quizzes/${quizId}/results`);
      return data;
    },
    enabled: !!quizId,
  });
}

export function useMyCourses(status?: string, page = 1) {
  return useQuery<MyCoursesResponse>({
    queryKey: ['courses', 'my-courses', status, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      params.set('page', String(page));
      const { data } = await api.get<MyCoursesResponse>(
        `/courses/my-courses?${params.toString()}`
      );
      return data;
    },
  });
}

// ── Admin Course Review types ────────────────────────

export interface AdminCoursesResponse {
  courses: Array<
    CourseDetail & {
      instructor: CourseDetailInstructor;
      status: string;
    }
  >;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ── Admin Course Review Hooks ────────────────────────

export function useAdminCourses(status = 'pending-review', page = 1) {
  return useQuery<AdminCoursesResponse>({
    queryKey: ['admin', 'courses', status, page],
    queryFn: async () => {
      const params = new URLSearchParams({ status, page: String(page) });
      const { data } = await api.get<AdminCoursesResponse>(`/admin/courses?${params.toString()}`);
      return data;
    },
  });
}

export function useReviewCourse() {
  const queryClient = useQueryClient();
  return useMutation<
    { course: CourseDetail },
    ApiError,
    { slug: string; decision: 'approved' | 'rejected'; reason?: string }
  >({
    mutationFn: async ({ slug, decision, reason }) => {
      const { data } = await api.put<{ course: CourseDetail }>(
        `/admin/courses/${slug}/review`,
        { decision, reason }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast.success('Course review submitted');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to review course');
    },
  });
}
