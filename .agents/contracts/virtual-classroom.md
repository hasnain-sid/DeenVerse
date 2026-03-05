# Feature Contract: Virtual Classroom (LiveKit + tldraw)

> **Created by**: copilot (Opus 4.6)
> **Date**: 2026-03-05
> **Status**: 📋 Planning

---

## 1. Overview

**What**: Interactive virtual classroom system — scholars host live teaching sessions with two-way video/audio, collaborative whiteboard (tldraw), screen sharing, raise-hand, chat, and session recording. Integrates with the course system's "live-session" lesson type.
**Why**: Transforms DeenVerse from a passive learning platform into an interactive education ecosystem. Live classrooms enable real-time Quran teaching, halaqas, Q&A sessions, and interactive lectures that create deeper engagement.
**Scope**: Backend (LiveKit token service, classroom session models, recording API) + Frontend (classroom UI, whiteboard, controls, scheduling) + Shared (schemas).
**Depends on**: Phase 2 (Course System) must be complete — classrooms are tied to courses and require scholar roles + enrollment checks.

| Layer | Required? | Owner Agent | Status |
|-------|-----------|-------------|--------|
| Shared (types/schemas) | Yes | copilot (Opus) | ⬜ |
| Backend (API) | Yes | copilot (Opus) | ⬜ |
| Frontend (UI) | Yes | antigravity (prototypes) → copilot-2 (integration) | ⬜ |
| Mobile | No | — | — |

---

## 2. API Contract

### Classroom Session CRUD (Scholar)

```
POST   /api/v1/classrooms
  Request:  { title, courseSlug?, lessonId?, scheduledAt, duration, maxParticipants, type, settings }
  Response: { classroom }
  Auth:     Required (scholar or admin)
  Status:   ⬜ Not Implemented

GET    /api/v1/classrooms
  Request:  ?status=live&course=slug&page=1&limit=12
  Response: { classrooms: [...], pagination }
  Auth:     Public (browse live/scheduled)
  Status:   ⬜ Not Implemented

GET    /api/v1/classrooms/:classroomId
  Request:  —
  Response: { classroom, host: { name, username, avatar, scholarProfile }, participantCount }
  Auth:     Public
  Status:   ⬜ Not Implemented

PUT    /api/v1/classrooms/:classroomId
  Request:  { ...partial classroom fields }
  Response: { classroom }
  Auth:     Required (host or admin)
  Status:   ⬜ Not Implemented

DELETE /api/v1/classrooms/:classroomId
  Request:  —
  Response: { message }
  Auth:     Required (host or admin)
  Status:   ⬜ Not Implemented
```

### Classroom Lifecycle

```
POST   /api/v1/classrooms/:classroomId/start
  Request:  —
  Response: { classroom, livekitToken, serverUrl }
  Auth:     Required (host only)
  Status:   ⬜ Not Implemented
  Notes:    Creates LiveKit room, generates host token with roomAdmin grant, sets status 'live'

POST   /api/v1/classrooms/:classroomId/join
  Request:  —
  Response: { livekitToken, serverUrl, classroom }
  Auth:     Required (enrolled student for course classrooms, any authenticated user for open classrooms)
  Status:   ⬜ Not Implemented
  Notes:    Generates participant token, increments participantCount. For course classrooms: verify enrollment.

POST   /api/v1/classrooms/:classroomId/end
  Request:  —
  Response: { classroom, recordingUrl? }
  Auth:     Required (host or admin)
  Status:   ⬜ Not Implemented
  Notes:    Ends LiveKit room, sets status 'ended', endedAt. If recording enabled, returns recording URL after processing.

POST   /api/v1/classrooms/:classroomId/leave
  Request:  —
  Response: { message }
  Auth:     Required
  Status:   ⬜ Not Implemented
  Notes:    Decrements participantCount. If host leaves without ending → auto-end after timeout.
```

### Classroom Controls (Scholar/Host)

```
POST   /api/v1/classrooms/:classroomId/mute/:participantId
  Request:  { audio?: boolean, video?: boolean }
  Response: { message }
  Auth:     Required (host)
  Status:   ⬜ Not Implemented
  Notes:    Sends mute signal via LiveKit server API

POST   /api/v1/classrooms/:classroomId/kick/:participantId
  Request:  { reason? }
  Response: { message }
  Auth:     Required (host or admin)
  Status:   ⬜ Not Implemented

PUT    /api/v1/classrooms/:classroomId/settings
  Request:  { chatEnabled?, handRaiseEnabled?, participantVideo?, participantAudio?, whiteboard? }
  Response: { classroom }
  Auth:     Required (host)
  Status:   ⬜ Not Implemented
  Notes:    Updates room settings in real-time via LiveKit data channel
```

### Raise Hand (via Socket.IO + LiveKit data channel)

```
Socket Events (not REST — handled via Socket.IO or LiveKit data channel):
  classroom:raise-hand    → { classroomId, userId }
  classroom:lower-hand    → { classroomId, userId }
  classroom:hand-queue    → { classroomId, queue: [{ userId, name, timestamp }] }
  classroom:grant-speak   → { classroomId, userId }   (host → student: unmute + allow publish)
```

### Whiteboard State (via LiveKit data channel)

```
Data Channel Events (LiveKit):
  whiteboard:sync         → { snapshot: tldrawStoreSnapshot }
  whiteboard:update       → { changes: tldrawStoreChanges }
  whiteboard:pointer      → { userId, x, y, tool }
  whiteboard:clear        → { }  (host only)
```

### Session Recording

```
POST   /api/v1/classrooms/:classroomId/recording/start
  Request:  —
  Response: { message, egressId }
  Auth:     Required (host)
  Status:   ⬜ Not Implemented
  Notes:    Starts LiveKit Egress recording (composite or track-based) → S3

POST   /api/v1/classrooms/:classroomId/recording/stop
  Request:  —
  Response: { recordingUrl }
  Auth:     Required (host)
  Status:   ⬜ Not Implemented
  Notes:    Stops Egress, returns S3 URL after processing

GET    /api/v1/classrooms/:classroomId/recordings
  Request:  —
  Response: { recordings: [{ url, duration, createdAt }] }
  Auth:     Required (enrolled students + host)
  Status:   ⬜ Not Implemented
```

### My Sessions

```
GET    /api/v1/classrooms/my-sessions
  Request:  ?role=host|student&status=live|scheduled|ended&page=1
  Response: { classrooms: [...], pagination }
  Auth:     Required
  Status:   ⬜ Not Implemented

GET    /api/v1/classrooms/upcoming
  Request:  ?course=slug
  Response: { classrooms: [...] }
  Auth:     Public
  Status:   ⬜ Not Implemented
```

---

## 3. Data Model Changes

### New Models

#### classroomSchema.js

```javascript
{
  host: { type: ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: String,

  // Link to course system (optional — standalone classrooms allowed)
  course: { type: ObjectId, ref: 'Course' },
  lessonId: String,  // Lesson within the course this session covers

  // Type of classroom
  type: { type: String, enum: ['lecture', 'halaqa', 'quran-session', 'qa-session', 'workshop', 'open'], default: 'lecture' },

  // Scheduling
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true, default: 60 },  // minutes
  timezone: { type: String, default: 'UTC' },

  // LiveKit
  livekitRoomName: { type: String, unique: true, sparse: true },
  livekitRoomSid: String,  // LiveKit server room ID

  // Status
  status: { type: String, enum: ['scheduled', 'live', 'ended', 'cancelled'], default: 'scheduled' },
  startedAt: Date,
  endedAt: Date,

  // Participants
  maxParticipants: { type: Number, default: 50 },
  participantCount: { type: Number, default: 0 },
  peakParticipants: { type: Number, default: 0 },
  participants: [{ type: ObjectId, ref: 'User' }],  // Users who joined

  // Settings
  settings: {
    chatEnabled: { type: Boolean, default: true },
    handRaiseEnabled: { type: Boolean, default: true },
    participantVideo: { type: Boolean, default: false },  // Can students turn on video?
    participantAudio: { type: Boolean, default: false },   // Can students unmute by default?
    whiteboardEnabled: { type: Boolean, default: true },
    recordingEnabled: { type: Boolean, default: false },
    autoAdmit: { type: Boolean, default: true },          // Auto-admit vs waiting room
  },

  // Access control
  access: { type: String, enum: ['course-only', 'followers', 'public'], default: 'course-only' },
  // course-only: only enrolled students can join
  // followers: followers of the scholar can join
  // public: anyone authenticated can join

  // Recording
  recordings: [{
    egressId: String,
    url: String,
    duration: Number,  // seconds
    size: Number,      // bytes
    createdAt: { type: Date, default: Date.now }
  }],

  // Whiteboard
  whiteboardSnapshot: mongoose.Schema.Types.Mixed,  // Last tldraw state for reconnection

  // Metadata
  tags: [String],
  thumbnail: String,
  recurringId: String,  // Group recurring sessions together
}
// Indexes: { host: 1 }, { course: 1 }, { status: 1, scheduledAt: 1 }, { livekitRoomName: 1 }
// Timestamps: true
```

#### classroomParticipantSchema.js

```javascript
{
  classroom: { type: ObjectId, ref: 'Classroom', required: true },
  user: { type: ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['host', 'co-host', 'participant', 'observer'], default: 'participant' },
  joinedAt: { type: Date, default: Date.now },
  leftAt: Date,
  duration: Number,  // seconds spent in classroom
  handRaised: { type: Boolean, default: false },
  handRaisedAt: Date,
  isMuted: { type: Boolean, default: true },
  isVideoOn: { type: Boolean, default: false },
}
// Indexes: { classroom: 1, user: 1 } (compound unique), { classroom: 1, role: 1 }
// Timestamps: true
```

### Existing Model Changes

#### courseSchema.js
- Course lessons with `type: 'live-session'` will reference a Classroom document via `content.classroomId`.

#### userSchema.js
- No changes needed — scholar profile already supports classroom hosting via role check.

---

## 4. Frontend Requirements

### New Pages

| Page | Route | Auth | Description |
|------|-------|------|-------------|
| Classroom Lobby | `/classrooms` | Public | Browse live/scheduled classrooms |
| Classroom Detail | `/classrooms/:id` | Public | Session info, join CTA, schedule |
| Live Classroom | `/classrooms/:id/live` | AuthGuard | LiveKit room + whiteboard + chat + controls |
| Schedule Classroom | `/scholar/classrooms/new` | AuthGuard + scholar | Create/schedule a new classroom session |
| My Sessions | `/scholar/classrooms` | AuthGuard + scholar | Scholar's sessions (scheduled, live, ended) |
| Student Sessions | `/my-sessions` | AuthGuard | Student's enrolled/attended sessions |

### New Hooks (useClassroom.ts)

```typescript
// Browse
useClassrooms(filters): GET /api/v1/classrooms
useClassroomDetail(id): GET /api/v1/classrooms/:id
useUpcomingClassrooms(courseSlug?): GET /api/v1/classrooms/upcoming
useMySessions(role, status, page): GET /api/v1/classrooms/my-sessions

// CRUD
useCreateClassroom(): useMutation → POST /api/v1/classrooms
useUpdateClassroom(): useMutation → PUT /api/v1/classrooms/:id
useDeleteClassroom(): useMutation → DELETE /api/v1/classrooms/:id

// Lifecycle
useStartClassroom(): useMutation → POST /api/v1/classrooms/:id/start → returns livekitToken
useJoinClassroom(): useMutation → POST /api/v1/classrooms/:id/join → returns livekitToken
useEndClassroom(): useMutation → POST /api/v1/classrooms/:id/end
useLeaveClassroom(): useMutation → POST /api/v1/classrooms/:id/leave

// Controls (host)
useMuteParticipant(): useMutation → POST /api/v1/classrooms/:id/mute/:participantId
useKickParticipant(): useMutation → POST /api/v1/classrooms/:id/kick/:participantId
useUpdateSettings(): useMutation → PUT /api/v1/classrooms/:id/settings

// Recording
useStartRecording(): useMutation → POST /api/v1/classrooms/:id/recording/start
useStopRecording(): useMutation → POST /api/v1/classrooms/:id/recording/stop
useRecordings(id): GET /api/v1/classrooms/:id/recordings
```

### Prototype Sets Needed

| Set | Folder | Route | Variants |
|-----|--------|-------|----------|
| Classroom Lobby | `features/classroom/prototypes/` | `/prototypes/classroom-lobby` | 5 |
| Live Classroom (main view) | `features/classroom/prototypes/` | `/prototypes/classroom-live` | 5 |
| Schedule Classroom | `features/classroom/prototypes/` | `/prototypes/classroom-schedule` | 5 |
| Whiteboard Panel | `features/classroom/prototypes/` | `/prototypes/classroom-whiteboard` | 3 |

---

## 5. Shared Schemas (packages/shared)

### New Schemas (classroom.ts)

```typescript
classroomTypeEnum = z.enum(['lecture', 'halaqa', 'quran-session', 'qa-session', 'workshop', 'open'])

classroomStatusEnum = z.enum(['scheduled', 'live', 'ended', 'cancelled'])

classroomAccessEnum = z.enum(['course-only', 'followers', 'public'])

classroomParticipantRoleEnum = z.enum(['host', 'co-host', 'participant', 'observer'])

classroomSettingsSchema = z.object({
  chatEnabled: z.boolean().optional(),
  handRaiseEnabled: z.boolean().optional(),
  participantVideo: z.boolean().optional(),
  participantAudio: z.boolean().optional(),
  whiteboardEnabled: z.boolean().optional(),
  recordingEnabled: z.boolean().optional(),
  autoAdmit: z.boolean().optional(),
})

createClassroomSchema = z.object({
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
})

updateClassroomSchema = createClassroomSchema.partial()

classroomFiltersSchema = z.object({
  status: classroomStatusEnum.optional(),
  course: z.string().optional(),
  type: classroomTypeEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
})

updateClassroomSettingsSchema = classroomSettingsSchema
```

---

## 6. Security Considerations

- **LiveKit Token Security**: Tokens are short-lived JWTs generated server-side. Room names are UUIDs/hashed — never expose internal IDs. Tokens expire after session duration + buffer.
- **Enrollment Check**: For `access: 'course-only'`, verify enrollment before issuing join token. For `access: 'followers'`, verify follow relationship.
- **Host Verification**: Only the scholar who created the classroom (or admin) can start/end/control the session.
- **Recording Consent**: Display "This session is being recorded" banner when `recordingEnabled: true`. Store recordings in private S3 bucket with pre-signed URL access.
- **Rate Limiting**: Token generation endpoint rate-limited (prevent token farming). Join endpoint rate-limited per user.
- **Whiteboard Data**: Sanitize tldraw data before broadcasting — prevent injection via data channels.
- **Auto-cleanup**: Scheduled sessions that aren't started within 30 min of scheduledAt → auto-cancel. Live sessions with no participants for 10 min → auto-end.
- **Max Participants**: Enforce server-side — reject join requests when maxParticipants reached.

---

## 7. Environment Variables

```env
# LiveKit (new)
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_URL=wss://your-livekit-server.com

# S3 Recording (reuse existing AWS config)
S3_BUCKET_RECORDINGS=deenverse-recordings
```

---

## 8. Dependencies

### Backend
- `livekit-server-sdk` — Generate room tokens, manage rooms/participants/egress server-side
- No other new backend deps — uses existing Express, Mongoose, Socket.IO

### Frontend
- `@livekit/components-react` — Pre-built React components (VideoConference, ParticipantTile, etc.)
- `livekit-client` — Low-level client SDK (peer dependency of components)
- `@tldraw/tldraw` — Collaborative whiteboard component
- `@livekit/components-styles` — Default styles for LiveKit components

---

## 9. Handover Log

| Date | Agent | Action | Notes |
|------|-------|--------|-------|
| 2026-03-05 | copilot | Contract created | Phase 3 planning — awaiting Phase 2 completion |
