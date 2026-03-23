import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { AdminCoursesResponse, CourseDetail } from './useCourses';

type ApiError = AxiosError<{ message?: string }>;

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
      const { data } = await api.put<{ course: CourseDetail }>(`/admin/courses/${slug}/review`, {
        decision,
        reason,
      });
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
