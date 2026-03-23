import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type {
  CourseProgressResponse,
  LessonContentResponse,
  MyCoursesResponse,
} from './useCourses';

type ApiError = AxiosError<{ message?: string }>;

export function useEnrollInCourse() {
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

export const useEnrollCourse = useEnrollInCourse;

export function useCourseProgress(slug: string) {
  return useQuery<CourseProgressResponse>({
    queryKey: ['courses', 'progress', slug],
    queryFn: async () => {
      const { data } = await api.get<CourseProgressResponse>(`/courses/${slug}/progress`);
      return data;
    },
    enabled: !!slug,
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation<CourseProgressResponse, ApiError, { slug: string; lessonId: string }>({
    mutationFn: async ({ slug, lessonId }) => {
      const { data } = await api.put<CourseProgressResponse>(`/courses/${slug}/progress`, {
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
      const { data } = await api.get<LessonContentResponse>(`/courses/${slug}/lessons/${lessonId}`);
      return data;
    },
    enabled: !!slug && !!lessonId,
  });
}

export function useMyEnrolledCourses(status?: string, page = 1) {
  return useQuery<MyCoursesResponse>({
    queryKey: ['courses', 'my-courses', status, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      params.set('page', String(page));
      const { data } = await api.get<MyCoursesResponse>(`/courses/my-courses?${params.toString()}`);
      return data;
    },
  });
}

export const useMyCourses = useMyEnrolledCourses;
