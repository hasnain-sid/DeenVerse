import { z } from 'zod';

// ===== Course Enums =====

export const courseCategoryEnum = z.enum([
  'quran',
  'hadith',
  'fiqh',
  'aqeedah',
  'seerah',
  'arabic',
  'tajweed',
  'tafseer',
  'dawah',
  'other',
]);

export const courseLevelEnum = z.enum([
  'beginner',
  'intermediate',
  'advanced',
]);

export const courseTypeEnum = z.enum([
  'self-paced',
  'instructor-led',
  'hybrid',
]);

export const courseStatusEnum = z.enum([
  'draft',
  'pending-review',
  'published',
  'archived',
]);

export const lessonTypeEnum = z.enum([
  'video',
  'text',
  'quiz',
  'live-session',
  'assignment',
]);

// ===== Sub-schemas =====

export const coursePricingSchema = z.object({
  type: z.enum(['free', 'paid', 'subscription']),
  amount: z.number().min(0).optional(),
  currency: z.string().default('usd').optional(),
});

export const courseLessonSchema = z.object({
  title: z.string().min(1),
  type: lessonTypeEnum,
  content: z.any().optional(),
  duration: z.number().min(0).optional(),
  order: z.number().min(0),
  isFree: z.boolean().optional(),
  resources: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string(),
      })
    )
    .optional(),
});

export const courseModuleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().min(0),
  lessons: z.array(courseLessonSchema),
});

// ===== Main Schemas =====

export const createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(20),
  shortDescription: z.string().max(200).optional(),
  category: courseCategoryEnum,
  level: courseLevelEnum,
  language: z.string().default('en'),
  type: courseTypeEnum,
  pricing: coursePricingSchema,
  modules: z.array(courseModuleSchema).optional(),
  requirements: z.array(z.string()).optional(),
  learningOutcomes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  maxStudents: z.number().min(0).optional(),
  certificateOnCompletion: z.boolean().optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const enrollCourseSchema = z.object({
  paymentSessionId: z.string().optional(),
});

export const quizQuestionOptionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

export const quizQuestionSchema = z.object({
  text: z.string().min(1),
  type: z.enum(['mcq', 'true-false', 'short-answer', 'essay', 'quran-recitation']),
  options: z.array(quizQuestionOptionSchema).optional(),
  points: z.number().min(0).optional(),
  explanation: z.string().optional(),
  ayahRef: z.string().optional(),
});

export const createQuizSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['quiz', 'exam', 'certification-exam']).optional(),
  timeLimit: z.number().min(0).optional(),
  passingScore: z.number().min(0).max(100),
  maxAttempts: z.number().min(1).optional(),
  questions: z.array(quizQuestionSchema).min(1),
  lesson: z.string().optional(),
  shuffleQuestions: z.boolean().optional(),
  showCorrectAnswers: z.boolean().optional(),
});

export const updateQuizSchema = createQuizSchema.partial();

export const updateProgressSchema = z.object({
  lessonId: z.string().min(1),
  completed: z.boolean(),
});

export const quizAnswerSchema = z.object({
  questionIndex: z.number(),
  answer: z.any(),
});

export const submitQuizSchema = z.object({
  attemptId: z.string(),
  answers: z.array(quizAnswerSchema),
});

export const courseReviewSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  reason: z.string().optional(),
});

export const courseFiltersSchema = z.object({
  category: courseCategoryEnum.optional(),
  level: courseLevelEnum.optional(),
  type: courseTypeEnum.optional(),
  search: z.string().optional(),
  sort: z
    .enum(['popular', 'newest', 'rating', 'price-low', 'price-high'])
    .optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
});

// ===== Inferred Types =====

export type CourseCategory = z.infer<typeof courseCategoryEnum>;
export type CourseLevel = z.infer<typeof courseLevelEnum>;
export type CourseType = z.infer<typeof courseTypeEnum>;
export type CourseStatus = z.infer<typeof courseStatusEnum>;
export type LessonType = z.infer<typeof lessonTypeEnum>;
export type CoursePricing = z.infer<typeof coursePricingSchema>;
export type CourseLesson = z.infer<typeof courseLessonSchema>;
export type CourseModule = z.infer<typeof courseModuleSchema>;
export type CreateCourse = z.infer<typeof createCourseSchema>;
export type UpdateCourse = z.infer<typeof updateCourseSchema>;
export type EnrollCourse = z.infer<typeof enrollCourseSchema>;
export type QuizQuestionOption = z.infer<typeof quizQuestionOptionSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type CreateQuiz = z.infer<typeof createQuizSchema>;
export type UpdateQuiz = z.infer<typeof updateQuizSchema>;
export type UpdateProgress = z.infer<typeof updateProgressSchema>;
export type QuizAnswer = z.infer<typeof quizAnswerSchema>;
export type SubmitQuiz = z.infer<typeof submitQuizSchema>;
export type CourseReview = z.infer<typeof courseReviewSchema>;
export type CourseFilters = z.infer<typeof courseFiltersSchema>;
