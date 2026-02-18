import { z } from 'zod';

// ===== Authentication Schemas =====

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores'),
    email: z.string().email('Please enter a valid email'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ===== Profile Schemas =====

export const editProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  bio: z.string().max(160, 'Bio must be 160 characters or less').optional(),
  avatar: z.string().url().optional().or(z.literal('')),
});

// ===== Post Schemas =====

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Post cannot be empty')
    .max(500, 'Post must be 500 characters or less'),
  hadithRef: z.string().optional(),
  replyTo: z.string().optional(),
  images: z.array(z.string().url()).max(4).optional(),
});

// ===== Stream Schemas =====

export const createStreamSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(500).optional().default(''),
  category: z.enum([
    'lecture',
    'quran_recitation',
    'qa_session',
    'discussion',
    'other',
  ]),
  scheduledFor: z.string().datetime().optional(),
});

// ===== Inferred types =====

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type EditProfileInput = z.infer<typeof editProfileSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateStreamInput = z.infer<typeof createStreamSchema>;
