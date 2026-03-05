import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

type ApiError = AxiosError<{ message?: string }>;

// ── Types ────────────────────────────────────────────

export interface PaymentHistoryItem {
  _id: string;
  type: 'course-purchase' | 'subscription' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  createdAt: string;
  course?: { title: string; slug: string };
  subscription?: { plan: 'student' | 'premium'; currentPeriodEnd: string };
}

export interface PaymentHistoryResponse {
  payments: PaymentHistoryItem[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface CheckoutResponse {
  sessionId: string;
  url: string;
}

export interface CancelSubscriptionResponse {
  message: string;
  cancelAt: string;
}

// ── Hooks ────────────────────────────────────────────

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async ({ courseSlug, successUrl, cancelUrl }: {
      courseSlug: string;
      successUrl?: string;
      cancelUrl?: string;
    }) => {
      const { data } = await api.post<CheckoutResponse>('/payments/checkout', {
        courseSlug,
        successUrl,
        cancelUrl,
      });
      return data;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message ?? 'Failed to initiate checkout');
    },
  });
}

export function useCreateSubscription() {
  return useMutation({
    mutationFn: async ({ planId }: { planId: 'student' | 'premium' }) => {
      const { data } = await api.post<CheckoutResponse>('/payments/subscription', {
        planId,
      });
      return data;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message ?? 'Failed to create subscription');
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<CancelSubscriptionResponse>('/payments/subscription');
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Subscription cancelled. Active until ${new Date(data.cancelAt).toLocaleDateString()}`);
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message ?? 'Failed to cancel subscription');
    },
  });
}

export function usePaymentHistory(page = 1) {
  return useQuery<PaymentHistoryResponse>({
    queryKey: ['payment-history', page],
    queryFn: async () => {
      const { data } = await api.get<PaymentHistoryResponse>('/payments/history', {
        params: { page, limit: 20 },
      });
      return data;
    },
  });
}

// ── Scholar Earnings Types ────────────────────────────────────────────

export interface ScholarEarningBreakdownItem {
  courseId: string;
  title: string;
  revenue: number;
  studentCount: number;
}

export interface ScholarEarnings {
  totalRevenue: number;
  platformFee: number;
  netEarnings: number;
  breakdown: ScholarEarningBreakdownItem[];
}

export interface ScholarEarningsDetail {
  _id: string;
  type: 'course_sale' | 'payout';
  courseTitle?: string;
  amount: number;
  netAmount?: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

export interface ScholarEarningsDetailsResponse {
  transactions: ScholarEarningsDetail[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface StripeConnectStatus {
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

// ── Scholar Earnings Hooks ────────────────────────────────────────────

export function useScholarEarnings(period: 'month' | 'quarter' | 'year' = 'month') {
  return useQuery<ScholarEarnings>({
    queryKey: ['scholar-earnings', period],
    queryFn: async () => {
      const { data } = await api.get<ScholarEarnings>('/scholars/earnings', {
        params: { period },
      });
      return data;
    },
  });
}

export function useScholarEarningsDetails(page = 1) {
  return useQuery<ScholarEarningsDetailsResponse>({
    queryKey: ['scholar-earnings-details', page],
    queryFn: async () => {
      const { data } = await api.get<ScholarEarningsDetailsResponse>('/scholars/earnings/details', {
        params: { page, limit: 20 },
      });
      return data;
    },
  });
}

export function useStripeConnect() {
  return useQuery<StripeConnectStatus>({
    queryKey: ['stripe-connect-status'],
    queryFn: async () => {
      const { data } = await api.get<StripeConnectStatus>('/scholars/stripe/status');
      return data;
    },
  });
}

export function useStripeConnectOnboard() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ url: string }>('/scholars/stripe/connect');
      return data;
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message ?? 'Failed to start Stripe onboarding');
    },
  });
}
