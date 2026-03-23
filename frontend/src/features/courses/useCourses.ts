import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import type { CourseFilters } from '@deenverse/shared';
import { api } from '@/lib/api';
import type {
  CourseDetail,
  CourseDetailResponse,
  CourseModule,
  CoursesResponse,
  CreateCourseInput,
  CreateCourseModuleInput,
  FeaturedCoursesResponse,
  TeachingCoursesResponse,
} from './courseTypes';

export * from './courseTypes';

type ApiError = AxiosError<{ message?: string }>;

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

export const useCoursesQuery = useCourses;

export function useFeaturedCourses() {
  return useQuery<FeaturedCoursesResponse>({
    queryKey: ['courses', 'featured'],
    queryFn: async () => {
      const { data } = await api.get<FeaturedCoursesResponse>('/courses/featured');
      return data;
    },
  });
}

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
    { slug: string; module: CreateCourseModuleInput }
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
      const { data } = await api.delete<{ course: CourseDetail }>(`/courses/${slug}/modules/${moduleIndex}`);
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

export {
  useCourseProgress,
  useEnrollCourse,
  useEnrollInCourse,
  useLessonContent,
  useMyCourses,
  useMyEnrolledCourses,
  useUpdateProgress,
} from './useCourseEnrollment';
export { useCreateQuiz, useQuizResults, useStartQuiz, useSubmitQuiz } from './useCourseQuiz';
export { useAdminCourses, useReviewCourse } from './useCourseAdmin';
