import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type {
  CreateQuizInput,
  QuizResultsResponse,
  QuizStartResponse,
  QuizSubmitResponse,
  QuizAnswer,
} from './useCourses';

type ApiError = AxiosError<{ message?: string }>;

export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation<{ quiz: CreateQuizInput & { _id: string } }, ApiError, { slug: string; data: CreateQuizInput }>({
    mutationFn: async ({ slug, data: input }) => {
      const { data } = await api.post<{ quiz: CreateQuizInput & { _id: string } }>(`/courses/${slug}/quizzes`, input);
      return data;
    },
    onSuccess: (_data, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'detail', slug] });
      toast.success('Quiz created successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to create quiz');
    },
  });
}

export function useStartQuiz() {
  return useMutation<QuizStartResponse, ApiError, { quizId: string }>({
    mutationFn: async ({ quizId }) => {
      const { data } = await api.post<QuizStartResponse>(`/quizzes/${quizId}/start`);
      return data;
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to start quiz');
    },
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();

  return useMutation<
    QuizSubmitResponse,
    ApiError,
    { quizId: string; attemptId: string; answers: QuizAnswer[] }
  >({
    mutationFn: async ({ quizId, attemptId, answers }) => {
      const { data } = await api.post<QuizSubmitResponse>(`/quizzes/${quizId}/submit`, {
        attemptId,
        answers,
      });
      return data;
    },
    onSuccess: (_data, { quizId }) => {
      queryClient.invalidateQueries({ queryKey: ['quiz', 'results', quizId] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to submit quiz');
    },
  });
}

export function useQuizResults(quizId: string) {
  return useQuery<QuizResultsResponse>({
    queryKey: ['quiz', 'results', quizId],
    queryFn: async () => {
      const { data } = await api.get<QuizResultsResponse>(`/quizzes/${quizId}/results`);
      return data;
    },
    enabled: !!quizId,
  });
}
