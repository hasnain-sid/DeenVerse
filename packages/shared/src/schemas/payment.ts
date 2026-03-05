import { z } from 'zod';

// ===== Payment Enums =====

export const subscriptionPlanEnum = z.enum(['student', 'premium']);

export const earningsPeriodEnum = z.enum(['month', 'quarter', 'year']);

export const paymentStatusEnum = z.enum([
  'pending',
  'completed',
  'refunded',
  'failed',
]);

// ===== Payment Schemas =====

export const checkoutRequestSchema = z.object({
  courseSlug: z.string().min(1, 'Course slug is required'),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const subscriptionRequestSchema = z.object({
  planId: subscriptionPlanEnum,
});

// ===== Inferred Types =====

export type SubscriptionPlan = z.infer<typeof subscriptionPlanEnum>;
export type EarningsPeriod = z.infer<typeof earningsPeriodEnum>;
export type PaymentStatus = z.infer<typeof paymentStatusEnum>;
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
export type SubscriptionRequest = z.infer<typeof subscriptionRequestSchema>;
