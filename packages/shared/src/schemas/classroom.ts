import { z } from 'zod';

// ===== Classroom Enums =====

export const classroomTypeEnum = z.enum([
  'lecture',
  'halaqa',
  'quran-session',
  'qa-session',
  'workshop',
  'open',
]);

export const classroomStatusEnum = z.enum([
  'scheduled',
  'live',
  'ended',
  'cancelled',
]);

export const classroomAccessEnum = z.enum([
  'course-only',
  'followers',
  'public',
]);

export const classroomParticipantRoleEnum = z.enum([
  'host',
  'co-host',
  'participant',
  'observer',
]);

// ===== Sub-schemas =====

export const classroomSettingsSchema = z.object({
  chatEnabled: z.boolean().optional(),
  handRaiseEnabled: z.boolean().optional(),
  participantVideo: z.boolean().optional(),
  participantAudio: z.boolean().optional(),
  whiteboardEnabled: z.boolean().optional(),
  recordingEnabled: z.boolean().optional(),
  autoAdmit: z.boolean().optional(),
});

// ===== Main Schemas =====

export const createClassroomSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  courseSlug: z.string().optional(),
  lessonId: z.string().optional(),
  type: classroomTypeEnum,
  scheduledAt: z.string().datetime(),
  duration: z.number().min(15).max(480).default(60),
  maxParticipants: z.number().min(2).max(500).default(50),
  access: classroomAccessEnum.default('course-only'),
  settings: classroomSettingsSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export const updateClassroomSchema = createClassroomSchema.partial();

export const classroomFiltersSchema = z.object({
  status: classroomStatusEnum.optional(),
  course: z.string().optional(),
  type: classroomTypeEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
});

export const updateClassroomSettingsSchema = classroomSettingsSchema;

// ===== Inferred Types =====

export type ClassroomType = z.infer<typeof classroomTypeEnum>;
export type ClassroomStatus = z.infer<typeof classroomStatusEnum>;
export type ClassroomAccess = z.infer<typeof classroomAccessEnum>;
export type ClassroomParticipantRole = z.infer<typeof classroomParticipantRoleEnum>;
export type ClassroomSettings = z.infer<typeof classroomSettingsSchema>;
export type CreateClassroom = z.infer<typeof createClassroomSchema>;
export type UpdateClassroom = z.infer<typeof updateClassroomSchema>;
export type ClassroomFilters = z.infer<typeof classroomFiltersSchema>;
export type UpdateClassroomSettings = z.infer<typeof updateClassroomSettingsSchema>;
