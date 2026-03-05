import { z } from 'zod';

// ===== Scholar Enums =====

export const scholarSpecialtiesEnum = z.enum([
  'tafseer',
  'hadith',
  'fiqh',
  'arabic',
  'tajweed',
  'aqeedah',
  'seerah',
  'dawah',
]);

export const scholarApplicationStatusEnum = z.enum([
  'none',
  'pending',
  'approved',
  'rejected',
]);

// ===== Scholar Schemas =====

export const scholarCredentialSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  institution: z.string().min(1, 'Institution is required').max(200),
  year: z.number().int().min(1900).max(new Date().getFullYear()),
  documentUrl: z.string().url().optional(),
});

export const scholarApplicationSchema = z.object({
  credentials: z
    .array(scholarCredentialSchema)
    .min(1, 'At least one credential is required'),
  specialties: z
    .array(scholarSpecialtiesEnum)
    .min(1, 'At least one specialty is required'),
  bio: z
    .string()
    .min(50, 'Bio must be at least 50 characters')
    .max(2000),
  teachingLanguages: z
    .array(z.string().min(1))
    .min(1, 'At least one teaching language is required'),
  videoIntroUrl: z.string().url().optional(),
});

export const scholarProfileSchema = z.object({
  specialties: z.array(scholarSpecialtiesEnum),
  bio: z.string(),
  teachingLanguages: z.array(z.string()),
  rating: z.object({
    average: z.number().min(0).max(5),
    count: z.number().int().min(0),
  }),
  totalStudents: z.number().int().min(0),
  totalCourses: z.number().int().min(0),
  verifiedAt: z.string().datetime().optional(),
  applicationStatus: scholarApplicationStatusEnum,
});

export const scholarReviewSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().min(1).optional(),
  specialties: z.array(scholarSpecialtiesEnum).optional(),
});

// ===== Inferred Types =====

export type ScholarSpecialty = z.infer<typeof scholarSpecialtiesEnum>;
export type ScholarApplicationStatus = z.infer<typeof scholarApplicationStatusEnum>;
export type ScholarCredential = z.infer<typeof scholarCredentialSchema>;
export type ScholarApplication = z.infer<typeof scholarApplicationSchema>;
export type ScholarProfile = z.infer<typeof scholarProfileSchema>;
export type ScholarReview = z.infer<typeof scholarReviewSchema>;
