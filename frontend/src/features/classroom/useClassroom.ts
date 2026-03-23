import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import type {
  ClassroomAccess,
  ClassroomFilters,
  ClassroomSettings,
  ClassroomStatus,
  ClassroomType,
  CreateClassroom,
  UpdateClassroom,
} from '@deenverse/shared';
import { api } from '@/lib/api';

type ApiError = AxiosError<{ message?: string }>;

export interface ClassroomHost {
  _id: string;
  name: string;
  username?: string;
  avatar?: string;
  scholarProfile?: {
    specializations?: string[];
    bio?: string;
    averageRating?: number;
    totalStudents?: number;
  } | null;
}

export interface ClassroomRecording {
  egressId?: string;
  url?: string | null;
  duration?: number;
  size?: number;
  createdAt: string;
}

export interface ClassroomSummary {
  _id: string;
  title: string;
  description?: string;
  course?: string | { _id: string; slug?: string; title?: string } | null;
  lessonId?: string;
  type: ClassroomType;
  scheduledAt: string;
  duration: number;
  timezone?: string;
  livekitRoomName?: string;
  livekitRoomSid?: string;
  status: ClassroomStatus;
  startedAt?: string;
  endedAt?: string;
  maxParticipants: number;
  participantCount: number;
  peakParticipants?: number;
  settings?: ClassroomSettings;
  access: ClassroomAccess;
  tags?: string[];
  thumbnail?: string;
  recurringId?: string;
  recordings?: ClassroomRecording[];
  host: ClassroomHost;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassroomPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ClassroomsResponse {
  classrooms: ClassroomSummary[];
  pagination: ClassroomPagination;
  success?: boolean;
}

export interface UpcomingClassroomsResponse {
  classrooms: ClassroomSummary[];
  success?: boolean;
}

export interface ClassroomDetailResponse {
  classroom: ClassroomSummary;
  isHost: boolean;
  success?: boolean;
}

export interface ClassroomRoomSessionResponse {
  classroom: ClassroomSummary;
  livekitToken: string | null;
  serverUrl: string | null;
  livekitMode?: 'mock' | 'live';
  success?: boolean;
}

export interface ClassroomRecordingsResponse {
  recordings: ClassroomRecording[];
  success?: boolean;
}

export type ClassroomWhiteboardSnapshot = unknown;

export interface ClassroomWhiteboardResponse {
  snapshot: ClassroomWhiteboardSnapshot | null;
  success?: boolean;
}

export interface ClassroomWhiteboardPayload {
  classroomId: string;
  snapshot: ClassroomWhiteboardSnapshot;
}

export interface ClassroomRecordingActionResponse {
  message?: string;
  egressId?: string;
  recordingUrl?: string;
  success?: boolean;
}

export interface ClassroomActionResponse {
  message?: string;
  classroom?: ClassroomSummary;
  success?: boolean;
}

export interface ClassroomMutePayload {
  classroomId: string;
  participantId: string;
  audio?: boolean;
  video?: boolean;
}

export interface ClassroomKickPayload {
  classroomId: string;
  participantId: string;
  reason?: string;
}

export interface ClassroomSettingsPayload {
  classroomId: string;
  settings: Partial<ClassroomSettingsState>;
}

export interface ClassroomChatMessage {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  text: string;
  createdAt: string;
}

export interface HandQueueEntry {
  userId: string;
  name: string;
  timestamp: number;
}

export type ClassroomSettingsState = ClassroomSettings;

function getErrorMessage(error: ApiError, fallback: string) {
  return error.response?.data?.message ?? fallback;
}

function invalidateClassroomQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  classroomId?: string,
) {
  queryClient.invalidateQueries({ queryKey: ['classrooms'] });
  if (classroomId) {
    queryClient.invalidateQueries({ queryKey: ['classrooms', 'detail', classroomId] });
  }
}

function buildClassroomSearchParams(filters?: ClassroomFilters) {
  const params = new URLSearchParams();

  if (!filters) {
    return params;
  }

  if (filters.status) params.set('status', filters.status);
  if (filters.course) params.set('course', filters.course);
  if (filters.type) params.set('type', filters.type);
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  return params;
}

export function useClassrooms(filters?: ClassroomFilters) {
  return useQuery<ClassroomsResponse>({
    queryKey: ['classrooms', 'browse', filters],
    queryFn: async () => {
      const params = buildClassroomSearchParams(filters);
      const query = params.toString();
      const path = query ? `/classrooms?${query}` : '/classrooms';
      const { data } = await api.get<ClassroomsResponse>(path);
      return data;
    },
  });
}

export function useUpcomingClassrooms(courseSlug?: string) {
  return useQuery<UpcomingClassroomsResponse>({
    queryKey: ['classrooms', 'upcoming', courseSlug ?? null],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (courseSlug) {
        params.set('course', courseSlug);
      }

      const query = params.toString();
      const path = query ? `/classrooms/upcoming?${query}` : '/classrooms/upcoming';
      const { data } = await api.get<UpcomingClassroomsResponse>(path);
      return data;
    },
  });
}

// ===== Mutations =====

export function useCreateClassroom() {
  const queryClient = useQueryClient();

  return useMutation<{ classroom: ClassroomSummary }, ApiError, CreateClassroom>({
    mutationFn: async (input) => {
      const { data } = await api.post<{ classroom: ClassroomSummary }>('/classrooms', input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      toast.success('Session scheduled successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to schedule session');
    },
  });
}

export function useUpdateClassroom() {
  const queryClient = useQueryClient();

  return useMutation<{ classroom: ClassroomSummary }, ApiError, { id: string; data: UpdateClassroom }>({
    mutationFn: async ({ id, data: input }) => {
      const { data } = await api.put<{ classroom: ClassroomSummary }>(`/classrooms/${id}`, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      toast.success('Session updated successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to update session');
    },
  });
}

export function useDeleteClassroom() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiError, string>({
    mutationFn: async (id) => {
      const { data } = await api.delete<{ message: string }>(`/classrooms/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      toast.success('Session deleted');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? 'Failed to delete session');
    },
  });
}

export function useMySessions(
  role?: 'host' | 'student',
  status?: ClassroomStatus,
  page = 1,
) {
  return useQuery<ClassroomsResponse>({
    queryKey: ['classrooms', 'my-sessions', role, status, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (role) params.set('role', role);
      if (status) params.set('status', status);
      params.set('page', String(page));
      const { data } = await api.get<ClassroomsResponse>(
        `/classrooms/my-sessions?${params.toString()}`,
      );
      return data;
    },
  });
}

export function useStudentSessions(status?: ClassroomStatus, page = 1) {
  return useQuery<ClassroomsResponse>({
    queryKey: ['classrooms', 'student-sessions', status, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('role', 'student');
      if (status) params.set('status', status);
      params.set('page', String(page));

      const { data } = await api.get<ClassroomsResponse>(
        `/classrooms/my-sessions?${params.toString()}`,
      );
      return data;
    },
  });
}

export function useClassroomDetail(id?: string) {
  return useQuery<ClassroomDetailResponse>({
    queryKey: ['classrooms', 'detail', id],
    queryFn: async () => {
      const { data } = await api.get<ClassroomDetailResponse>(`/classrooms/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useStartClassroom() {
  const queryClient = useQueryClient();

  return useMutation<ClassroomRoomSessionResponse, ApiError, { classroomId: string }>({
    mutationFn: async ({ classroomId }) => {
      const { data } = await api.post<ClassroomRoomSessionResponse>(
        `/classrooms/${classroomId}/start`,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      invalidateClassroomQueries(queryClient, variables.classroomId);
      toast.success('Classroom started');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to start classroom'));
    },
  });
}

export function useJoinClassroom() {
  const queryClient = useQueryClient();

  return useMutation<ClassroomRoomSessionResponse, ApiError, { classroomId: string }>({
    mutationFn: async ({ classroomId }) => {
      const { data } = await api.post<ClassroomRoomSessionResponse>(
        `/classrooms/${classroomId}/join`,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      invalidateClassroomQueries(queryClient, variables.classroomId);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to join classroom'));
    },
  });
}

export function useEndClassroom() {
  const queryClient = useQueryClient();

  return useMutation<ClassroomActionResponse, ApiError, { classroomId: string }>({
    mutationFn: async ({ classroomId }) => {
      const { data } = await api.post<ClassroomActionResponse>(
        `/classrooms/${classroomId}/end`,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      invalidateClassroomQueries(queryClient, variables.classroomId);
      toast.success('Classroom ended');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to end classroom'));
    },
  });
}

export function useLeaveClassroom() {
  const queryClient = useQueryClient();

  return useMutation<ClassroomActionResponse, ApiError, { classroomId: string }>({
    mutationFn: async ({ classroomId }) => {
      const { data } = await api.post<ClassroomActionResponse>(
        `/classrooms/${classroomId}/leave`,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      invalidateClassroomQueries(queryClient, variables.classroomId);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to leave classroom'));
    },
  });
}

export function useStartRecording() {
  const queryClient = useQueryClient();

  return useMutation<ClassroomRecordingActionResponse, ApiError, { classroomId: string }>({
    mutationFn: async ({ classroomId }) => {
      const { data } = await api.post<ClassroomRecordingActionResponse>(
        `/classrooms/${classroomId}/recording/start`,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      invalidateClassroomQueries(queryClient, variables.classroomId);
      queryClient.invalidateQueries({ queryKey: ['classrooms', 'recordings', variables.classroomId] });
      toast.success('Recording started');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to start recording'));
    },
  });
}

export function useStopRecording() {
  const queryClient = useQueryClient();

  return useMutation<ClassroomRecordingActionResponse, ApiError, { classroomId: string }>({
    mutationFn: async ({ classroomId }) => {
      const { data } = await api.post<ClassroomRecordingActionResponse>(
        `/classrooms/${classroomId}/recording/stop`,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      invalidateClassroomQueries(queryClient, variables.classroomId);
      queryClient.invalidateQueries({ queryKey: ['classrooms', 'recordings', variables.classroomId] });
      toast.success('Recording stopped');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to stop recording'));
    },
  });
}

export function useRecordings(classroomId?: string) {
  return useQuery<ClassroomRecordingsResponse>({
    queryKey: ['classrooms', 'recordings', classroomId],
    queryFn: async () => {
      const { data } = await api.get<ClassroomRecordingsResponse>(`/classrooms/${classroomId}/recordings`);
      return data;
    },
    enabled: Boolean(classroomId),
  });
}

export function useMuteParticipant() {
  const queryClient = useQueryClient();

  return useMutation<ClassroomActionResponse, ApiError, ClassroomMutePayload>({
    mutationFn: async ({ classroomId, participantId, ...payload }) => {
      const { data } = await api.post<ClassroomActionResponse>(
        `/classrooms/${classroomId}/mute/${participantId}`,
        payload,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      invalidateClassroomQueries(queryClient, variables.classroomId);
      toast.success('Participant permissions updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to update participant permissions'));
    },
  });
}

export function useKickParticipant() {
  const queryClient = useQueryClient();

  return useMutation<ClassroomActionResponse, ApiError, ClassroomKickPayload>({
    mutationFn: async ({ classroomId, participantId, reason }) => {
      const { data } = await api.post<ClassroomActionResponse>(
        `/classrooms/${classroomId}/kick/${participantId}`,
        { reason },
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      invalidateClassroomQueries(queryClient, variables.classroomId);
      toast.success('Participant removed from classroom');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to remove participant'));
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation<ClassroomDetailResponse, ApiError, ClassroomSettingsPayload>({
    mutationFn: async ({ classroomId, settings }) => {
      const { data } = await api.put<ClassroomDetailResponse>(
        `/classrooms/${classroomId}/settings`,
        settings,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      invalidateClassroomQueries(queryClient, variables.classroomId);
      toast.success('Classroom settings updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to update classroom settings'));
    },
  });
}

export function useWhiteboardSnapshot(classroomId?: string) {
  return useQuery<ClassroomWhiteboardResponse>({
    queryKey: ['classrooms', 'whiteboard', classroomId],
    queryFn: async () => {
      const { data } = await api.get<ClassroomWhiteboardResponse>(`/classrooms/${classroomId}/whiteboard`);
      return data;
    },
    enabled: Boolean(classroomId),
  });
}

export function useSaveWhiteboard() {
  const queryClient = useQueryClient();

  return useMutation<ClassroomWhiteboardResponse, ApiError, ClassroomWhiteboardPayload>({
    mutationFn: async ({ classroomId, snapshot }) => {
      const { data } = await api.put<ClassroomWhiteboardResponse>(
        `/classrooms/${classroomId}/whiteboard`,
        { snapshot },
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classrooms', 'whiteboard', variables.classroomId] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to save whiteboard snapshot'));
    },
  });
}
