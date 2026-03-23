import type {
  CourseCategory,
  CourseFilters,
  CourseLevel,
  CourseType,
} from '@deenverse/shared';

export interface CourseInstructor {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}

export type CourseStatus = 'draft' | 'pending-review' | 'published' | 'archived';
export type CourseLessonType = 'video' | 'text' | 'quiz' | 'live-session' | 'assignment';
export type QuizType = 'quiz' | 'exam' | 'certification-exam';
export type QuizQuestionType = 'mcq' | 'true-false' | 'short-answer' | 'essay' | 'quran-recitation';

export interface CoursePricing {
  type: 'free' | 'paid' | 'subscription';
  amount?: number;
  currency?: string;
}

export interface CourseRating {
  average: number;
  count: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CourseLessonResource {
  name: string;
  url: string;
  type: string;
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
  pricing: CoursePricing;
  instructor: CourseInstructor;
  enrollmentCount: number;
  rating: CourseRating;
  tags?: string[];
  certificateOnCompletion?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoursesResponse {
  courses: Course[];
  pagination: PaginationMeta;
}

export interface FeaturedCoursesResponse {
  courses: Course[];
}

export interface CourseLesson {
  _id: string;
  title: string;
  type: CourseLessonType;
  content?: unknown;
  duration?: number;
  isFree?: boolean;
  resources?: CourseLessonResource[];
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
  status?: CourseStatus;
  rejectionReason?: string;
  instructor: CourseDetailInstructor;
}

export interface TeachingCourse extends Omit<CourseDetail, 'instructor'> {
  instructor: string;
}

export interface AdminCourse extends CourseDetail {
  status: CourseStatus;
}

export interface CourseDetailResponse {
  course: CourseDetail;
  isEnrolled: boolean;
}

export interface TeachingCoursesResponse {
  courses: TeachingCourse[];
  pagination: PaginationMeta;
}

export interface CreateCourseLessonInput {
  title: string;
  type: CourseLessonType;
  content?: unknown;
  duration?: number;
  order: number;
  isFree?: boolean;
  resources?: CourseLessonResource[];
}

export interface CreateCourseModuleInput {
  title: string;
  description?: string;
  order: number;
  lessons: CreateCourseLessonInput[];
}

export interface CreateCourseInput {
  title: string;
  description: string;
  shortDescription?: string;
  category: CourseCategory;
  level: CourseLevel;
  language: string;
  type: CourseType;
  pricing: CoursePricing;
  modules?: CreateCourseModuleInput[];
  requirements?: string[];
  learningOutcomes?: string[];
  tags?: string[];
  maxStudents?: number;
  certificateOnCompletion?: boolean;
}

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

export interface CourseProgressResponse {
  enrollment: EnrollmentProgress;
}

export interface LessonContent {
  _id: string;
  title: string;
  type: CourseLessonType;
  content?: unknown;
  duration?: number;
  isFree?: boolean;
  resources?: CourseLessonResource[];
  order: number;
}

export interface LessonContentResponse {
  lesson: LessonContent;
  nextLesson?: { _id: string; title: string };
  prevLesson?: { _id: string; title: string };
}

export interface QuizQuestionOption {
  text: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  _id: string;
  text: string;
  type: QuizQuestionType;
  options?: Array<{ text: string }>;
  points: number;
  ayahRef?: string;
  explanation?: string | null;
  correctOptionIndex?: number | null;
}

export interface QuizQuestionInput {
  text: string;
  type: QuizQuestionType;
  options?: QuizQuestionOption[];
  points?: number;
  explanation?: string;
  ayahRef?: string;
}

export interface CreateQuizInput {
  title: string;
  type?: QuizType;
  timeLimit?: number;
  passingScore: number;
  maxAttempts?: number;
  questions: QuizQuestionInput[];
  lesson?: string;
  shuffleQuestions?: boolean;
  showCorrectAnswers?: boolean;
}

export interface QuizInfo {
  _id: string;
  title: string;
  type: QuizType;
  timeLimit: number;
  passingScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  totalQuestions: number;
}

export interface QuizAttemptSummary {
  _id: string;
  attempt: number;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  passed: boolean | null;
}

export interface QuizStartResponse {
  quiz: QuizInfo;
  attempt: QuizAttemptSummary;
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  questionIndex: number;
  answer: string | number | boolean;
}

export interface QuizResultQuestion {
  questionIndex: number;
  answer: string | number | boolean | null;
  isCorrect: boolean;
}

export interface QuizSubmitResponse {
  quiz: QuizInfo;
  attempt: QuizAttemptSummary;
  score: number;
  passed: boolean;
  earnedPoints: number;
  totalPoints: number;
  answers: QuizResultQuestion[];
  questions?: QuizQuestion[];
}

export type QuizAttempt = QuizAttemptSummary;

export interface QuizResultsResponse {
  quiz: QuizInfo;
  attempts: QuizAttempt[];
  bestScore: number;
  passed: boolean;
  attemptsUsed: number;
  attemptsRemaining: number;
}

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
  pagination: PaginationMeta;
}

export interface AdminCoursesResponse {
  courses: AdminCourse[];
  pagination: PaginationMeta;
}

export type { CourseCategory, CourseFilters, CourseLevel, CourseType };
