import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  ScholarApplication,
  ScholarApplicationStatus,
} from '@deenverse/shared';

// ────────────────────────────────────────────────────────────────────────────
// Response types
// ────────────────────────────────────────────────────────────────────────────

export interface ApplicationStatusResponse {
  status: ScholarApplicationStatus;
  applicationDate?: string;
  rejectionReason?: string;
}

export interface ScholarProfileResponse {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  coverUrl?: string;
  location?: string;
  website?: string;
  scholarProfile: {
    specialties: string[];
    bio: string;
    teachingLanguages: string[];
    rating: { average: number; count: number };
    totalStudents: number;
    totalCourses: number;
    verifiedAt?: string;
    credentials: Array<{
      title: string;
      institution: string;
      year: number;
      documentUrl?: string;
    }>;
    applicationStatus: ScholarApplicationStatus;
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Admin response types
// ────────────────────────────────────────────────────────────────────────────

export interface AdminScholarApplication {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  email: string;
  scholarProfile: {
    applicationStatus: ScholarApplicationStatus;
    applicationDate: string;
    specialties: string[];
    credentials: Array<{
      title: string;
      institution: string;
      year: number;
      documentUrl?: string;
    }>;
    bio: string;
    teachingLanguages: string[];
    rejectionReason?: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  applications?: T[];
  scholars?: T[];
}

export interface AdminScholar {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  scholarProfile: {
    specialties: string[];
    bio: string;
    rating: { average: number; count: number };
    totalStudents: number;
    totalCourses: number;
    verifiedAt?: string;
  };
}

export interface ReviewDecision {
  decision: 'approved' | 'rejected';
  rejectionReason?: string;
  specialties?: string[];
}

// ────────────────────────────────────────────────────────────────────────────
// Query keys
// ────────────────────────────────────────────────────────────────────────────

export const scholarKeys = {
  applicationStatus: ['scholars', 'application-status'] as const,
  profile: (id: string) => ['scholars', 'profile', id] as const,
  adminApplications: (status: string, page: number) =>
    ['admin', 'scholars', 'applications', status, page] as const,
  adminScholars: (page: number) => ['admin', 'scholars', 'list', page] as const,
};

// ────────────────────────────────────────────────────────────────────────────
// Hooks
// ────────────────────────────────────────────────────────────────────────────

/**
 * Fetch the current user's scholar application status.
 * Returns null when the user has never applied (server returns status: 'none').
 */
export function useApplicationStatus() {
  return useQuery<ApplicationStatusResponse>({
    queryKey: scholarKeys.applicationStatus,
    queryFn: async () => {
      const { data } = await api.get<ApplicationStatusResponse>(
        '/scholars/application-status'
      );
      return data;
    },
  });
}

/**
 * Submit a scholar application.
 * Invalidates the application-status query on success.
 */
export function useApplyForScholar() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, ScholarApplication>({
    mutationFn: async (payload) => {
      const { data } = await api.post<{ message: string }>(
        '/scholars/apply',
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scholarKeys.applicationStatus });
    },
  });
}

/**
 * Fetch a public scholar profile by user ID.
 */
export function useScholarProfile(id: string) {
  return useQuery<ScholarProfileResponse>({
    queryKey: scholarKeys.profile(id),
    queryFn: async () => {
      const { data } = await api.get<ScholarProfileResponse>(
        `/scholars/${id}/profile`
      );
      return data;
    },
    enabled: Boolean(id),
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Admin hooks
// ────────────────────────────────────────────────────────────────────────────

/**
 * Fetch paginated scholar applications filtered by status (admin only).
 */
export function useAdminScholarApplications(
  status: string = 'pending',
  page: number = 1,
) {
  return useQuery<PaginatedResponse<AdminScholarApplication>>({
    queryKey: scholarKeys.adminApplications(status, page),
    queryFn: async () => {
      const { data } = await api.get<
        PaginatedResponse<AdminScholarApplication>
      >('/scholars/admin/applications', { params: { status, page } });
      return data;
    },
  });
}

/**
 * Review (approve/reject) a scholar application (admin only).
 * Invalidates all admin application queries on success.
 */
export function useReviewApplication() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; user: { _id: string; name: string; role: string; applicationStatus: string } },
    Error,
    { userId: string } & ReviewDecision
  >({
    mutationFn: async ({ userId, ...body }) => {
      const { data } = await api.put(`/scholars/admin/applications/${userId}/review`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'scholars'] });
    },
  });
}

/**
 * Fetch paginated list of verified scholars (admin only).
 */
export function useAdminScholarList(page: number = 1) {
  return useQuery<PaginatedResponse<AdminScholar>>({
    queryKey: scholarKeys.adminScholars(page),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AdminScholar>>(
        '/scholars/admin/list',
        { params: { page } },
      );
      return data;
    },
  });
}
