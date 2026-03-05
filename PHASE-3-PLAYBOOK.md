# Phase 3 Playbook — Virtual Classroom (LiveKit + tldraw)

> **Copy-paste prompts for each agent, in exact execution order.**
> Work through this document top to bottom. Each step tells you which tool/agent to use,
> what to wait for before moving on, and the exact prompt text to send.

---

## Agent Legend

| Symbol | Agent | Tool | Model |
|--------|-------|------|-------|
| 🔵 **OPUS** | `copilot` | GitHub Copilot | Claude Opus 4.6 |
| 🟡 **ANTIGRAVITY** | `antigravity` | Antigravity tool | Gemini 3.1 Pro |
| 🟢 **SONNET** | `copilot-2` | GitHub Copilot | Claude Sonnet 4.6 |

---

## Prerequisites

Phase 2 (Course System / LMS) **must be complete** before starting Phase 3.
Verify with:
```
tick list --tag course --status done
tick list --tag payment --status done
tick list --tag scholar --status done
```

Key Phase 2 artifacts Phase 3 depends on:
- `backend/models/courseSchema.js` — courses with `live-session` lesson type
- `backend/models/enrollmentSchema.js` — enrollment verification for course classrooms
- `backend/services/courseService.js` — course/enrollment lookups
- `backend/middlewares/courseAccess.js` — `isEnrolled` middleware
- `backend/middlewares/admin.js` — `isScholar`, `isScholarOrAdmin`, `isAdmin` middleware
- `backend/socket/index.js` — existing Socket.IO infrastructure (chat, stream rooms)
- `backend/services/ivsService.js` — existing AWS IVS pattern (reference for LiveKit service)
- `packages/shared/src/schemas/` — barrel export pattern
- Existing streaming UI in `frontend/src/features/streaming/` — pattern reference

---

## Timeline Overview

```
Day 1       [OPUS]         Stage 1: Shared schemas
Day 1–2     [OPUS]         Stage 2: Backend models + LiveKit service
Day 2–5     [OPUS]         Stage 3: All backend APIs (5 parallel-eligible tasks)
            [ANTIGRAVITY]  Stage 3: All 4 prototype sets (parallel — start same day as Stage 3)
Day 5–6     [YOU]          Review all prototypes, pick 1 winner per set
Day 6–9     [SONNET]       Stage 4: Integrate chosen prototypes (6 tasks)
            [OPUS]         Stage 4: Write unit + smoke tests (3 tasks)
Day 9–10    [SONNET]       Stage 5: Docs, feature board, final commit
```

---

## STAGE 1 — Shared Schemas

> **OPUS only. No parallel work yet.**

---

### STEP 1 · TASK-066
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: Phase 2 complete (all Phase 2 tasks done)
**TICK before starting**:
```
tick claim TASK-066 copilot
```

---

**PROMPT TO SEND:**

```
You are working on DeenVerse (Islamic social platform). Read the contract before coding:
- .agents/contracts/virtual-classroom.md (full file — especially Section 5: Shared Schemas)

TASK-066: Create shared Zod schemas for the Virtual Classroom system (Phase 3).

Create packages/shared/src/schemas/classroom.ts with these exports:

1. Enums:
   - classroomTypeEnum: z.enum(['lecture', 'halaqa', 'quran-session', 'qa-session', 'workshop', 'open'])
   - classroomStatusEnum: z.enum(['scheduled', 'live', 'ended', 'cancelled'])
   - classroomAccessEnum: z.enum(['course-only', 'followers', 'public'])
   - classroomParticipantRoleEnum: z.enum(['host', 'co-host', 'participant', 'observer'])

2. Sub-schemas:
   - classroomSettingsSchema: z.object({ chatEnabled: z.boolean().optional(), handRaiseEnabled: z.boolean().optional(), participantVideo: z.boolean().optional(), participantAudio: z.boolean().optional(), whiteboardEnabled: z.boolean().optional(), recordingEnabled: z.boolean().optional(), autoAdmit: z.boolean().optional() })

3. Main schemas:
   - createClassroomSchema: z.object({ title: z.string().min(3).max(200), description: z.string().max(1000).optional(), courseSlug: z.string().optional(), lessonId: z.string().optional(), type: classroomTypeEnum, scheduledAt: z.string().datetime(), duration: z.number().min(15).max(480).default(60), maxParticipants: z.number().min(2).max(500).default(50), access: classroomAccessEnum.default('course-only'), settings: classroomSettingsSchema.optional(), tags: z.array(z.string()).optional() })
   - updateClassroomSchema: createClassroomSchema.partial()
   - classroomFiltersSchema: z.object({ status: classroomStatusEnum.optional(), course: z.string().optional(), type: classroomTypeEnum.optional(), search: z.string().optional(), page: z.coerce.number().min(1).optional(), limit: z.coerce.number().min(1).max(50).optional() })
   - updateClassroomSettingsSchema: classroomSettingsSchema

4. Export inferred types for all schemas (e.g., export type CreateClassroom = z.infer<typeof createClassroomSchema>).

5. Update packages/shared/src/schemas/index.ts to export from './classroom'.
6. Update packages/shared/src/index.ts if needed.

After completing:
tick comment TASK-066 copilot --note "Shared Zod schemas created for virtual classroom: enums, settings, create/update classroom, filters schemas + types."
tick done TASK-066 copilot
```

---

## STAGE 2 — Backend Models + LiveKit Service

> **OPUS only. Builds the data and service foundation.**

---

### STEP 2 · TASK-067
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: STEP 1 (TASK-066) done
**TICK before starting**:
```
tick claim TASK-067 copilot
```

---

**PROMPT TO SEND:**

```
TASK-067: Create Classroom + ClassroomParticipant models and LiveKit service.

Read first:
- .agents/contracts/virtual-classroom.md (Section 3: Data Model Changes — full schemas)
- backend/models/streamSchema.js (for code style reference — indexes, timestamps, enums)
- backend/services/ivsService.js (for service pattern — graceful fallback when not configured)
- backend/middlewares/admin.js (middleware pattern reference)
- backend/config/aws.js (for AWS config pattern)

Create these files:

1. backend/models/classroomSchema.js
   Full schema from the contract. Key details:
   - host: ObjectId ref User, required
   - title: String, required, trimmed
   - description: String, optional
   - course: ObjectId ref Course, optional (standalone classrooms allowed)
   - lessonId: String, optional
   - type: enum ['lecture', 'halaqa', 'quran-session', 'qa-session', 'workshop', 'open'], default 'lecture'
   - scheduledAt: Date, required
   - duration: Number, default 60 (minutes)
   - timezone: String, default 'UTC'
   - livekitRoomName: String, unique, sparse
   - livekitRoomSid: String
   - status: enum ['scheduled', 'live', 'ended', 'cancelled'], default 'scheduled'
   - startedAt, endedAt: Date
   - maxParticipants: Number, default 50
   - participantCount, peakParticipants: Number, default 0
   - participants: [ObjectId ref User]
   - settings subdocument: chatEnabled, handRaiseEnabled, participantVideo, participantAudio, whiteboardEnabled, recordingEnabled, autoAdmit (all Boolean with defaults)
   - access: enum ['course-only', 'followers', 'public'], default 'course-only'
   - recordings: [{ egressId, url, duration, size, createdAt }]
   - whiteboardSnapshot: Mixed (tldraw state for reconnection)
   - tags: [String]
   - thumbnail: String
   - recurringId: String
   - Indexes: { host: 1 }, { course: 1 }, { status: 1, scheduledAt: 1 }, { livekitRoomName: 1 }
   - timestamps: true

2. backend/models/classroomParticipantSchema.js
   - classroom: ObjectId ref Classroom, required
   - user: ObjectId ref User, required
   - role: enum ['host', 'co-host', 'participant', 'observer'], default 'participant'
   - joinedAt: Date, default Date.now
   - leftAt: Date
   - duration: Number (seconds)
   - handRaised: Boolean, default false
   - handRaisedAt: Date
   - isMuted: Boolean, default true
   - isVideoOn: Boolean, default false
   - Compound unique index: { classroom: 1, user: 1 }
   - Additional index: { classroom: 1, role: 1 }
   - timestamps: true

3. backend/services/livekitService.js
   Install livekit-server-sdk: npm install livekit-server-sdk --workspace=backend
   Implement:
   - isLivekitConfigured(): check LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL env vars
   - createRoom(roomName, maxParticipants, emptyTimeout): create a LiveKit room via RoomServiceClient. If not configured, return placeholder for dev. emptyTimeout = 600 (10 min auto-cleanup).
   - deleteRoom(roomName): delete a LiveKit room.
   - generateToken(userId, userName, roomName, options): create an AccessToken with VideoGrant. options: { isHost, canPublish, canSubscribe, canPublishData }. Host gets roomAdmin=true, canUpdateOwnMetadata=true. Participant gets canPublish based on classroom settings. Token TTL = classroom duration + 30 min buffer.
   - listParticipants(roomName): list active participants in a room.
   - muteParticipant(roomName, identity, trackSid, muted): mute/unmute a participant track.
   - removeParticipant(roomName, identity): kick a participant from the room.
   - startRecording(roomName, s3Config): start Egress composite recording to S3. Return egressId.
   - stopRecording(egressId): stop an active Egress recording.

   Follow the same graceful-fallback pattern as ivsService.js — return dev-friendly placeholder data when LIVEKIT env vars are not set.
   Use process.env for all config. Guard all calls in try/catch with AppError.

After completing:
tick comment TASK-067 copilot --note "Classroom + ClassroomParticipant models created. LiveKit service with token generation, room management, recording, participant control. livekit-server-sdk installed."
tick done TASK-067 copilot
```

---

## STAGE 3 — Backend APIs + Prototypes (Run in Parallel)

> **Start OPUS on backend APIs AND start ANTIGRAVITY on all prototypes at the same time.**
> **Prototypes use only mocked data — fully independent from backend work.**

---

### STEP 3A · TASK-068 (OPUS — Classroom CRUD API)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: STEP 2 (TASK-067) done
**TICK before starting**:
```
tick claim TASK-068 copilot
```

---

**PROMPT TO SEND:**

```
TASK-068: Build the Classroom CRUD API (routes → controller → service).

Read first:
- .agents/contracts/virtual-classroom.md (Section 2: API Contract — Classroom CRUD + My Sessions)
- backend/routes/courseRoute.js (for route pattern reference)
- backend/controller/courseController.js (for controller code style)
- backend/services/courseService.js (for service code style)
- backend/models/classroomSchema.js (just created in TASK-067)
- backend/index.js (to understand route mounting)
- backend/utils/AppError.js

Create these files following route → controller → service pattern:

1. backend/routes/classroomRoute.js
   Mount at /api/v1/classrooms in backend/index.js
   Routes:
   - POST   /                    → isAuthenticated, isScholar → classroomController.createClassroom
   - GET    /                    → public → classroomController.browseClassrooms
   - GET    /upcoming            → public → classroomController.getUpcomingClassrooms
   - GET    /my-sessions         → isAuthenticated → classroomController.getMySessions
   - GET    /:classroomId        → public → classroomController.getClassroomById
   - PUT    /:classroomId        → isAuthenticated → classroomController.updateClassroom (host check in service)
   - DELETE /:classroomId        → isAuthenticated → classroomController.deleteClassroom (host check in service)

   IMPORTANT: Place /upcoming, /my-sessions BEFORE /:classroomId to avoid param collision.

2. backend/controller/classroomController.js
   Thin controller — validates input, calls service, sends response.
   For browse: extract query params (status, course, type, search, page, limit) and pass to service.

3. backend/services/classroomService.js
   Implement:
   - createClassroom(userId, data): create classroom with host=userId. If courseSlug provided, look up course, verify user is the instructor. Generate UUID-based livekitRoomName. If course access, link course._id.
   - browseClassrooms(filters): paginated query on live+scheduled classrooms. Support: status filter, course filter, type filter, text search on title. Sort scheduled by scheduledAt asc, live first. Return { classrooms, pagination }.
   - getClassroomById(classroomId, userId): return classroom with host populated (name, username, avatar, scholarProfile). Include isHost boolean. If userId + course-only: check enrollment.
   - getUpcomingClassrooms(courseSlug?): scheduled classrooms with scheduledAt > now, sorted by scheduledAt asc, limit 20. Optionally filter by course.
   - getMySessions(userId, role, status, page, limit): if role=host: classrooms where host=userId. If role=student: classrooms where user is in participants array. Filter by status if provided.
   - updateClassroom(userId, classroomId, data): verify host ownership (host === userId OR admin). Cannot update a live classroom's scheduledAt or type.
   - deleteClassroom(userId, classroomId): verify ownership. If status='scheduled', hard delete. If status='ended', soft delete (set status='cancelled'). Cannot delete a live classroom — must end it first.

   Use AppError for all error cases. Use .lean() for read queries. Populate host on browse/detail.

After completing:
tick comment TASK-068 copilot --note "Classroom CRUD API complete: create, browse, detail, update, delete. Course-linked and standalone classrooms. Host ownership checks. Pagination + filtering."
tick done TASK-068 copilot
```

---

### STEP 3B · TASK-069 (OPUS — Classroom Lifecycle API)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: TASK-067 done (run after TASK-068)
**TICK before starting**:
```
tick claim TASK-069 copilot
```

---

**PROMPT TO SEND:**

```
TASK-069: Build the Classroom Lifecycle API (start, join, leave, end).

Read first:
- .agents/contracts/virtual-classroom.md (Section 2: Classroom Lifecycle endpoints)
- backend/models/classroomSchema.js
- backend/models/classroomParticipantSchema.js
- backend/services/livekitService.js (token generation + room management)
- backend/middlewares/courseAccess.js (enrollment check pattern)
- backend/models/enrollmentSchema.js (for course enrollment verification)

Add these routes to backend/routes/classroomRoute.js (extend the existing file):
- POST   /:classroomId/start   → isAuthenticated → classroomController.startClassroom
- POST   /:classroomId/join    → isAuthenticated → classroomController.joinClassroom
- POST   /:classroomId/end     → isAuthenticated → classroomController.endClassroom
- POST   /:classroomId/leave   → isAuthenticated → classroomController.leaveClassroom

Add to backend/controller/classroomController.js:
- startClassroom, joinClassroom, endClassroom, leaveClassroom

Add to backend/services/classroomService.js (extend):
- startClassroom(userId, classroomId):
  1. Look up classroom. Verify host === userId. 403 if not host.
  2. Verify status === 'scheduled'. 400 if already live/ended.
  3. Create LiveKit room via livekitService.createRoom(livekitRoomName, maxParticipants).
  4. Generate host LiveKit token via livekitService.generateToken(userId, userName, roomName, { isHost: true, canPublish: true, canSubscribe: true, canPublishData: true }).
  5. Set status='live', startedAt=now, livekitRoomSid from response.
  6. Create ClassroomParticipant record for host with role='host'.
  7. Emit Socket.IO event 'classroom:started' to followers/enrolled students.
  8. Return { classroom, livekitToken, serverUrl: LIVEKIT_URL }.

- joinClassroom(userId, classroomId):
  1. Look up classroom. 404 if not found. 400 if not status='live'.
  2. Check maxParticipants — 403 if full.
  3. Access control check:
     - If access='course-only': verify enrollment in course via Enrollment model. 403 if not enrolled.
     - If access='followers': verify user follows the host. 403 if not.
     - If access='public': allow any authenticated user.
  4. Check if already a participant (ClassroomParticipant exists). If so, generate new token (reconnection) instead of creating duplicate.
  5. Generate participant token via livekitService.generateToken(userId, userName, roomName, { isHost: false, canPublish: settings.participantAudio || settings.participantVideo, canSubscribe: true, canPublishData: settings.whiteboardEnabled }).
  6. Create/update ClassroomParticipant record. Add userId to classroom.participants if not already there.
  7. Update participantCount. Update peakParticipants if current > peak.
  8. Return { livekitToken, serverUrl: LIVEKIT_URL, classroom }.

- endClassroom(userId, classroomId):
  1. Verify host === userId OR admin. 403 otherwise.
  2. Verify status === 'live'. 400 if not live.
  3. Delete LiveKit room via livekitService.deleteRoom(livekitRoomName).
  4. Update all ClassroomParticipant records: set leftAt=now, calculate duration.
  5. Set status='ended', endedAt=now. Set final participantCount to 0.
  6. Emit Socket.IO event 'classroom:ended' to room.
  7. Return { classroom }.

- leaveClassroom(userId, classroomId):
  1. Update ClassroomParticipant: set leftAt=now, calculate duration.
  2. Remove userId from classroom.participants. Decrement participantCount.
  3. If host leaves: emit warning, set 5-minute auto-end timer (or end immediately based on preference).
  4. Return { message: 'Left classroom' }.

After completing:
tick comment TASK-069 copilot --note "Classroom lifecycle API complete: start (LiveKit room creation + host token), join (enrollment/access verification + participant token), end (room cleanup), leave. Socket.IO events emitted."
tick done TASK-069 copilot
```

---

### STEP 3C · TASK-070 (OPUS — Classroom Controls API)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: TASK-069 done
**TICK before starting**:
```
tick claim TASK-070 copilot
```

---

**PROMPT TO SEND:**

```
TASK-070: Build the Classroom Controls API (mute, kick, settings, raise hand).

Read first:
- .agents/contracts/virtual-classroom.md (Section 2: Classroom Controls + Raise Hand)
- backend/services/livekitService.js (muteParticipant, removeParticipant)
- backend/socket/index.js (existing Socket.IO event pattern)

Add these routes to backend/routes/classroomRoute.js:
- POST   /:classroomId/mute/:participantId    → isAuthenticated → classroomController.muteParticipant
- POST   /:classroomId/kick/:participantId     → isAuthenticated → classroomController.kickParticipant
- PUT    /:classroomId/settings                → isAuthenticated → classroomController.updateSettings

Add to backend/controller/classroomController.js and backend/services/classroomService.js:

- muteParticipant(hostUserId, classroomId, participantUserId, { audio, video }):
  1. Verify caller is host. 403 if not.
  2. Verify classroom is live. 400 if not.
  3. Call livekitService.muteParticipant to send mute signal.
  4. Update ClassroomParticipant.isMuted.
  5. Emit Socket.IO 'classroom:participant-muted' to participant.

- kickParticipant(hostUserId, classroomId, participantUserId, reason):
  1. Verify caller is host or admin. 403 if not.
  2. Call livekitService.removeParticipant.
  3. Update ClassroomParticipant: set leftAt, role stays same.
  4. Remove from classroom.participants. Decrement participantCount.
  5. Emit Socket.IO 'classroom:participant-kicked' to participant with reason.

- updateSettings(hostUserId, classroomId, settingsData):
  1. Verify host. 403 if not.
  2. Update classroom.settings with provided fields (merge, not replace).
  3. Broadcast updated settings to all participants via Socket.IO 'classroom:settings-updated'.
  4. If participantAudio/participantVideo changed: notify participants so UI updates controls.

Add to backend/socket/index.js — new classroom Socket.IO events:
- classroom:raise-hand   → { classroomId } — add user to hand queue, broadcast 'classroom:hand-queue' to host
- classroom:lower-hand   → { classroomId } — remove from queue, broadcast update
- classroom:grant-speak  → { classroomId, userId } — host grants speak permission to hand-raised user, emit 'classroom:speak-granted' to that user (enables their publish capability)
- classroom:join-room    → { classroomId } — join Socket.IO room `classroom:{classroomId}` for events
- classroom:leave-room   → { classroomId } — leave Socket.IO room

Keep hand queue in memory (Map: classroomId → array of { userId, name, timestamp }). Clear on classroom end.

After completing:
tick comment TASK-070 copilot --note "Classroom controls API complete: mute/kick participants via LiveKit + Socket.IO. Settings update with real-time broadcast. Raise hand queue with grant-speak flow."
tick done TASK-070 copilot
```

---

### STEP 3D · TASK-071 (OPUS — Recording API)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: TASK-069 done
**TICK before starting**:
```
tick claim TASK-071 copilot
```

---

**PROMPT TO SEND:**

```
TASK-071: Build the Session Recording API.

Read first:
- .agents/contracts/virtual-classroom.md (Section 2: Session Recording endpoints)
- backend/services/livekitService.js (startRecording, stopRecording)
- backend/config/aws.js (S3 config pattern)
- backend/services/uploadService.js (S3 pattern reference)

Add these routes to backend/routes/classroomRoute.js:
- POST   /:classroomId/recording/start   → isAuthenticated → classroomController.startRecording
- POST   /:classroomId/recording/stop    → isAuthenticated → classroomController.stopRecording
- GET    /:classroomId/recordings         → isAuthenticated → classroomController.getRecordings

Add to backend/controller/classroomController.js and backend/services/classroomService.js:

- startRecording(userId, classroomId):
  1. Verify host === userId. 403 if not.
  2. Verify classroom is live. 400 if not.
  3. Verify settings.recordingEnabled is true. 400 if not ('Recording is not enabled for this classroom').
  4. Call livekitService.startRecording(livekitRoomName, { bucket: S3_BUCKET_RECORDINGS, region, accessKey, secretKey, prefix: `classrooms/${classroomId}/` }).
  5. Store egressId in classroom (so we can stop it later).
  6. Broadcast 'classroom:recording-started' to all participants via Socket.IO (for consent banner).
  7. Return { message: 'Recording started', egressId }.

- stopRecording(userId, classroomId):
  1. Verify host. 403 if not.
  2. Get egressId from classroom.
  3. Call livekitService.stopRecording(egressId).
  4. Once stopped, construct S3 URL. Push to classroom.recordings array: { egressId, url, createdAt }.
  5. Broadcast 'classroom:recording-stopped' via Socket.IO.
  6. Return { recordingUrl }.

- getRecordings(userId, classroomId):
  1. Look up classroom. Verify user was a participant (ClassroomParticipant exists) OR is the host. 403 otherwise.
  2. Return classroom.recordings with pre-signed S3 URLs (generate via AWS SDK, 1-hour expiry).

After completing:
tick comment TASK-071 copilot --note "Recording API complete: start/stop Egress recording to S3, get recordings with pre-signed URLs. Consent broadcasting via Socket.IO."
tick done TASK-071 copilot
```

---

### STEP 3E · TASK-072 (OPUS — Whiteboard Sync Backend)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: TASK-070 done
**TICK before starting**:
```
tick claim TASK-072 copilot
```

---

**PROMPT TO SEND:**

```
TASK-072: Build whiteboard state synchronization backend support.

Read first:
- .agents/contracts/virtual-classroom.md (Section 2: Whiteboard State)
- backend/socket/index.js (existing event patterns)
- backend/models/classroomSchema.js (whiteboardSnapshot field)

The whiteboard primarily syncs via LiveKit data channels (peer-to-peer, handled client-side). The backend provides:

1. Whiteboard snapshot persistence — Add to backend/services/classroomService.js:
   - saveWhiteboardSnapshot(classroomId, snapshot):
     Store current tldraw state in classroom.whiteboardSnapshot.
     Called periodically by the host client (every 30s) via API or Socket.IO.
     Enables late-joiners to get current whiteboard state.

   - getWhiteboardSnapshot(classroomId):
     Return classroom.whiteboardSnapshot. Called when a participant joins mid-session.

2. Add Socket.IO events to backend/socket/index.js for whiteboard sync fallback:
   - classroom:whiteboard-save → { classroomId, snapshot } — host saves snapshot to DB (throttled, max once per 30s)
   - classroom:whiteboard-load → { classroomId } + callback — participant requests current snapshot on join
   - classroom:whiteboard-clear → { classroomId } — host clears whiteboard, broadcast to room

3. Add REST endpoints to classroomRoute.js:
   - PUT  /:classroomId/whiteboard  → isAuthenticated → save whiteboard snapshot (host only)
   - GET  /:classroomId/whiteboard  → isAuthenticated → get whiteboard snapshot (participants)

After completing:
tick comment TASK-072 copilot --note "Whiteboard sync backend: snapshot save/load via REST + Socket.IO, clear event. Supports late-joiner state recovery."
tick done TASK-072 copilot
```

---

### STEP 3F-1 · TASK-073 (ANTIGRAVITY — Classroom Lobby Prototypes)
**Agent**: 🟡 ANTIGRAVITY
**Wait for**: TASK-066 (shared schemas done — contract exists)
**Start in parallel with**: TASK-068, 069, 070, 071, 072

---

**PROMPT TO SEND TO ANTIGRAVITY:**

```
Task: Create 5 distinct frontend prototype variants for the Virtual Classroom Lobby/Browse page.

Context: DeenVerse is an Islamic education platform. Scholars host live teaching sessions (halaqas, Quran sessions, lectures, Q&A) that students can join. This page shows live and upcoming classrooms. Read the contract first: .agents/contracts/virtual-classroom.md (Section 4: Frontend Requirements).

Create in: frontend/src/features/classroom/prototypes/
Files to create:
- LobbyPrototype1.tsx through LobbyPrototype5.tsx (5 distinct designs)
- PrototypesViewer.tsx (toolbar to switch between prototypes)
Temp route: /prototypes/classroom-lobby

Mock data (use for all prototypes):
- 4 live classrooms: "Tafseer Al-Baqarah — Live Session 12" (lecture, 45 participants, Scholar Ahmad), "Tajweed Practice Circle" (quran-session, 18 participants, Scholar Fatima), "Fiqh of Prayer Q&A" (qa-session, 32 participants, Scholar Yusuf), "Arabic Grammar Workshop" (workshop, 12 participants, Scholar Maryam)
- 6 upcoming classrooms: various types, scheduled at different times today and tomorrow, different scholars
- 3 ended classrooms with recordings available
- Each classroom: title, host name+avatar, type badge, participant count, duration, scheduledAt, course name (optional), access type (public/course-only)

Explore these 5 distinct approaches:
1. Live-First Grid: prominent "Live Now" section at top with pulsing red badges, grid of live classrooms, then "Upcoming" section with timeline-style cards, filter by type
2. Calendar View: weekly calendar showing scheduled sessions, live ones highlighted, click to see details/join. Sidebar with "Live Now" quick-join cards
3. Channel-Style: left sidebar with classroom types (Lectures, Halaqas, Q&A, etc.), main area shows classrooms in that category, Discord-like channel list feel
4. Hero Carousel + Cards: hero banner featuring the most popular live session, below: horizontal scrollable rows — "Live Now", "Starting Soon", "Your Courses' Sessions", "Past Recordings"
5. Dashboard Hub: stats cards at top (3 live, 8 upcoming, 24 recordings), quick-join buttons for live sessions, followed by filterable card grid with toggle between Live/Upcoming/Past tabs

Each design must include:
- Live classroom card: title, host avatar+name, participant count (animated counter), "LIVE" badge (pulsing), type badge, "Join" button, duration running
- Upcoming classroom card: title, host, scheduled time with countdown ("Starts in 2h 15m"), type, access badge (course-only vs public), "Notify Me" button
- Past recording card: title, host, duration, recording thumbnail, "Watch Recording" button
- Filter by type (lecture, halaqa, quran-session, qa-session, workshop)
- Search input
- Responsive design (mobile-first)
- Islamic design touches (green/gold accents, geometric patterns)

Rules:
- Frontend only — all data mocked inline (no API calls)
- Use existing design system: shadcn/ui, Tailwind CSS v4, Lucide React, Framer Motion
- Show empty state and loading skeleton state
```

---

### STEP 3F-2 · TASK-074 (ANTIGRAVITY — Live Classroom Prototypes)
**Agent**: 🟡 ANTIGRAVITY
**Wait for**: TASK-066 done
**Start in parallel with**: STEP 3F-1 or after

---

**PROMPT TO SEND TO ANTIGRAVITY:**

```
Task: Create 5 distinct frontend prototype variants for the Live Classroom view (the actual classroom interface).

Context: This is THE core interface — where scholars teach and students learn in real-time. It includes video feeds, whiteboard area, chat, participant list, and classroom controls. Read: .agents/contracts/virtual-classroom.md

Create in: frontend/src/features/classroom/prototypes/
Files: LivePrototype1.tsx through LivePrototype5.tsx
Add to PrototypesViewer.tsx with a toggle to switch between "Lobby" and "Live" prototypes.
Temp route: /prototypes/classroom-live

Mock data:
- Host: Scholar Ahmad Al-Farooqi (video feed placeholder — 16:9 with avatar overlay)
- 8 participants (4 with video placeholders, 4 audio-only with avatars)
- 2 participants have raised hands
- Chat messages: 12 recent messages with usernames, avatars, timestamps
- Whiteboard: placeholder canvas area (grey grid background)
- Current settings: chat=on, whiteboard=on, participantVideo=off, participantAudio=off, recording=on

Explore these 5 distinct approaches:
1. Zoom-Style Grid: equal-sized participant video tiles in center, host highlighted (larger/bordered), bottom toolbar (mic, cam, share screen, raise hand, whiteboard, chat, end), right sidebar toggles between Chat and Participants panels
2. Lecture Mode: large host video (70% width), small participant strip at bottom, full-height right panel with tabs: Chat | Whiteboard | Participants | Notes. Clean teacher-focused layout.
3. Whiteboard-First: large whiteboard canvas takes center stage (60%), host video in picture-in-picture corner, participant strip on left rail, chat overlay on right, toolbar at bottom. Ideal for Quran/Arabic teaching.
4. Split Panel: left half = video feeds (host large + participant grid), right half = tabbed panel (Whiteboard | Chat | Q&A | Shared Notes). Resizable divider between halves.
5. Floating Panels: full-screen whiteboard/content area, all panels float and are draggable — video feeds in floating window, chat in floating panel, participant list in floating panel. Minimal, customizable layout.

Each prototype MUST include ALL of these elements:
- Host video feed (large, with name overlay + "HOST" badge)
- Participant video grid (smaller tiles, name labels, audio indicator)
- Control bar: 🎤 Mic toggle, 📹 Camera toggle, 🖥️ Screen Share, ✋ Raise Hand, ✏️ Whiteboard toggle, 💬 Chat toggle, 👥 Participants toggle, ⏺️ Recording indicator (red dot when active), 🚪 Leave/End button
- Chat panel: message list with sender avatar + name + message, input field
- Participants panel: list with name, role badge (Host/Participant), mic/video status icons, hand-raised indicator
- Hand raise queue: visual indicator showing who raised hand and in what order
- Whiteboard area: placeholder canvas with toolbar (pen, shapes, text, eraser, color, undo/redo)
- "Recording in progress" banner/indicator
- Responsive: on mobile, show one panel at a time with bottom nav to switch

Rules: frontend only, all mocked, existing design system (shadcn/ui, Tailwind, Lucide, Framer Motion).
```

---

### STEP 3F-3 · TASK-075 (ANTIGRAVITY — Schedule Classroom Prototypes)
**Agent**: 🟡 ANTIGRAVITY
**Wait for**: TASK-066 done

---

**PROMPT TO SEND TO ANTIGRAVITY:**

```
Task: Create 5 distinct prototype variants for the Schedule Classroom page (scholar creates/schedules a session).

Context: Verified scholars use this form to create and schedule virtual classroom sessions. Sessions can be linked to a course lesson or be standalone. Read: .agents/contracts/virtual-classroom.md

Create in: frontend/src/features/classroom/prototypes/
Files: SchedulePrototype1.tsx through SchedulePrototype5.tsx
Add to PrototypesViewer.tsx. Temp route: /prototypes/classroom-schedule

Mock data: empty form (new session) + a pre-filled "editing existing session" state.
Available courses: 3 mock courses (Tafseer Al-Baqarah, Tajweed Fundamentals, Arabic Grammar 101) with their lesson lists for linking.

Explore these 5 distinct approaches:
1. Multi-Step Wizard (3 steps): Step 1: Basic Info (title, description, type, thumbnail) → Step 2: Schedule (date/time picker, duration, timezone, recurring toggle) → Step 3: Settings (access, maxParticipants, chat, whiteboard, recording, auto-admit). Progress bar + back/next.
2. Single-Page Form: all fields visible, clean sectioned layout with cards (Session Info, Schedule, Course Link, Settings), inline validation, floating "Create Session" button
3. Quick Schedule Card: minimal — just title, type selector, date/time, duration, and "Create" in a single compact card. Advanced settings in expandable accordion below.
4. Calendar Integration: visual calendar showing existing sessions, click a time slot to create a new one. Popover form appears with session details. Shows conflicts.
5. Template-Based: choose from templates ("Weekly Halaqa", "One-Time Lecture", "Course Live Session", "Open Q&A"), template pre-fills type + settings + duration, scholar fills in specifics.

Each prototype must include:
- Title input (required)
- Description textarea
- Type selector (lecture, halaqa, quran-session, qa-session, workshop, open)
- Date + time picker for scheduledAt
- Duration selector (15, 30, 45, 60, 90, 120 min presets + custom)
- Timezone selector
- Course link: optional dropdown to link to a course, then optional lesson selector within that course
- Access control: course-only / followers / public radio buttons
- Max participants slider/input (2-500)
- Settings toggles: chat, hand raise, participant video, participant audio, whiteboard, recording, auto-admit
- Tags input
- "Create Session" / "Schedule" and "Cancel" buttons
- Validation feedback

Rules: frontend only, mocked data, existing design system (shadcn/ui, Tailwind, Lucide, Framer Motion). Handle both create and edit states.
```

---

### STEP 3F-4 · TASK-076 (ANTIGRAVITY — Whiteboard Panel Prototypes)
**Agent**: 🟡 ANTIGRAVITY
**Wait for**: TASK-066 done

---

**PROMPT TO SEND TO ANTIGRAVITY:**

```
Task: Create 3 distinct prototype variants for the Whiteboard Panel (used inside the live classroom).

Context: The whiteboard uses tldraw for collaborative drawing. It's embedded within the classroom view and used for teaching — Arabic writing, diagram drawing, Quran ayah annotation, etc. Read: .agents/contracts/virtual-classroom.md

Create in: frontend/src/features/classroom/prototypes/
Files: WhiteboardPrototype1.tsx through WhiteboardPrototype3.tsx
Add to PrototypesViewer.tsx. Temp route: /prototypes/classroom-whiteboard

Mock data:
- Show placeholder canvas area with toolbar
- 2 participant cursors visible on the canvas (mocked positions)
- A few pre-drawn shapes/text to simulate a teaching scenario

Explore these 3 distinct approaches:
1. Full Toolbar Canvas: tldraw-style toolbar on left (pen, shapes, text, arrows, eraser, color picker, line width), zoom controls bottom-right, "Clear Board" button (host only), participant cursor indicators with name labels, export/save button. Canvas fills available space.
2. Minimal Teaching Mode: simplified toolbar (pen in 3 sizes, highlighter, text, eraser, undo/redo only), large pen/color selector, "Teacher's Pointer" mode (shows a large colored dot that moves with the teacher's cursor for students to follow). Optimized for handwriting Arabic on tablet/stylus.
3. Slide-Based: whiteboard has multiple "slides" (like pages), slide navigation bar at bottom (dots or thumbnails), host can flip between slides. Each slide is a separate tldraw canvas. Good for prepared lessons — scholar pre-draws ayahs/diagrams before class.

Each must include:
- Canvas area (white background with subtle grid)
- Drawing tools (at minimum: pen, text, shapes, eraser)
- Color palette (at least 6 colors including green, gold for Islamic motifs)
- Undo/redo buttons
- Participant cursor indicators (colored dots with username labels)
- "Clear All" button (host only, with confirmation)
- Zoom controls (in/out/reset)
- Fullscreen toggle

Rules: frontend only, mocked (do NOT actually install tldraw — mock the canvas with a simple div and placeholder tools), existing design system. These prototypes will be replaced with real tldraw integration in STAGE 4.
```

---

## STAGE 3 → STAGE 4 GATE: Your Review

> **You must do this before any SONNET integration steps.**
> Open each prototype set at these routes and pick ONE winner per set:

| Route | Pick from | For Task |
|-------|-----------|----------|
| `/prototypes/classroom-lobby` | LobbyPrototype 1–5 | TASK-077 |
| `/prototypes/classroom-live` | LivePrototype 1–5 | TASK-078 |
| `/prototypes/classroom-schedule` | SchedulePrototype 1–5 | TASK-079 |
| `/prototypes/classroom-whiteboard` | WhiteboardPrototype 1–3 | TASK-080 |

Note your choices (e.g., "Lobby: 4, Live: 2, Schedule: 1, Whiteboard: 3") before proceeding.

---

## STAGE 4 — Frontend Integration (Sonnet) + Testing (Opus)

> **Run SONNET integration and OPUS tests in parallel.**
> **SONNET handles 6 frontend integration tasks. OPUS handles 3 testing tasks.**

---

### STEP 4A · TASK-077 (SONNET — Integrate Classroom Lobby Page)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: TASK-068 done + TASK-073 done + you've picked a prototype
**TICK before starting**:
```
tick claim TASK-077 copilot-2
```

---

**PROMPT TO SEND (fill in `[N]` with your chosen prototype number):**

```
TASK-077: Promote Classroom Lobby Prototype [N] to production.

Read first:
- .agents/contracts/virtual-classroom.md (Section 4: Frontend Requirements)
- frontend/src/features/classroom/prototypes/LobbyPrototype[N].tsx (the chosen prototype)
- frontend/src/lib/api.ts (Axios instance for API calls)
- frontend/src/stores/authStore.ts (user/auth shape)

Do the following:

1. Create frontend/src/features/classroom/ClassroomLobbyPage.tsx
   Promote the chosen prototype design. Replace all mocked data + fake handlers with real hooks.

2. Create frontend/src/features/classroom/useClassroom.ts with TanStack Query hooks:
   - useClassrooms(filters): GET /api/v1/classrooms?status=...&type=...&search=...&page=...
   - useUpcomingClassrooms(courseSlug?): GET /api/v1/classrooms/upcoming
   Use types from @deenverse/shared (ClassroomType, ClassroomStatus, ClassroomFilters).

3. Register route in frontend router: /classrooms → ClassroomLobbyPage (lazy-loaded, public — no AuthGuard needed)

4. Add a "Live Classes" or "Classrooms" link in the main navigation/sidebar (find the right place by reading existing nav components).

5. Delete LobbyPrototype files from prototypes folder (keep other prototype files).

After completing:
tick comment TASK-077 copilot-2 --note "Classroom Lobby page integrated. useClassrooms hook created with filters + upcoming. Route /classrooms live. Nav link added."
tick done TASK-077 copilot-2
```

---

### STEP 4B · TASK-078 (SONNET — Integrate Live Classroom Page)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: TASK-069 + TASK-070 done + TASK-074 done + you've picked a prototype
**TICK before starting**:
```
tick claim TASK-078 copilot-2
```

---

**PROMPT TO SEND (fill in `[N]`):**

```
TASK-078: Promote Live Classroom Prototype [N] to production with LiveKit integration.

Read first:
- .agents/contracts/virtual-classroom.md
- frontend/src/features/classroom/prototypes/LivePrototype[N].tsx
- frontend/src/features/classroom/useClassroom.ts (already created in TASK-077)

Install LiveKit dependencies:
cd frontend && npm install @livekit/components-react livekit-client @livekit/components-styles

Do the following:

1. Create frontend/src/features/classroom/ClassroomLivePage.tsx
   Promote chosen prototype. Replace mocked data with real hooks + LiveKit components.

2. Add to useClassroom.ts:
   - useClassroomDetail(classroomId): GET /api/v1/classrooms/:id
   - useStartClassroom(): useMutation → POST /api/v1/classrooms/:id/start → returns { livekitToken, serverUrl }
   - useJoinClassroom(): useMutation → POST /api/v1/classrooms/:id/join → returns { livekitToken, serverUrl }
   - useEndClassroom(): useMutation → POST /api/v1/classrooms/:id/end
   - useLeaveClassroom(): useMutation → POST /api/v1/classrooms/:id/leave

3. LiveKit integration:
   - Wrap main content in <LiveKitRoom token={livekitToken} serverUrl={serverUrl} connect={true}>
   - Use @livekit/components-react components:
     - <VideoTrack> for host and participant video
     - <ParticipantTile> for participant grid
     - useLocalParticipant() for mic/cam controls
     - useRoomContext() for room state
     - <TrackToggle source={Track.Source.Microphone}> for mic toggle
     - <TrackToggle source={Track.Source.Camera}> for cam toggle
     - <ScreenShareButton> for screen sharing
   - Import @livekit/components-styles/prefabs.css for base styles

4. Chat panel: use existing Socket.IO events (classroom:join-room, send messages via Socket.IO like stream chat pattern).

5. Raise hand: use Socket.IO events (classroom:raise-hand, classroom:lower-hand). Show hand queue to host.

6. Control bar implementation:
   - Mic toggle → useLocalParticipant toggle
   - Camera toggle → useLocalParticipant toggle
   - Screen share → <ScreenShareButton>
   - Raise hand → Socket.IO event
   - Whiteboard toggle → show/hide whiteboard panel
   - Chat toggle → show/hide chat panel
   - Leave → useLeaveClassroom() + navigate back
   - End (host only) → useEndClassroom() + navigate back

7. Register route: /classrooms/:id/live → ClassroomLivePage (lazy-loaded, AuthGuard)
   "Join" button from Lobby page navigates here.

8. Delete LivePrototype files.

After completing:
tick comment TASK-078 copilot-2 --note "Live Classroom page integrated with LiveKit. Video/audio, screen share, chat, raise hand, control bar all wired. Route /classrooms/:id/live live."
tick done TASK-078 copilot-2
```

---

### STEP 4C · TASK-079 (SONNET — Integrate Schedule Classroom Page)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: TASK-068 done + TASK-075 done + you've picked a prototype
**TICK before starting**:
```
tick claim TASK-079 copilot-2
```

---

**PROMPT TO SEND (fill in `[N]`):**

```
TASK-079: Promote Schedule Classroom Prototype [N] to production.

Read first:
- .agents/contracts/virtual-classroom.md
- frontend/src/features/classroom/prototypes/SchedulePrototype[N].tsx
- frontend/src/features/classroom/useClassroom.ts (extend)

Do the following:

1. Create frontend/src/features/classroom/ScheduleClassroomPage.tsx — new session creation
2. Create frontend/src/features/classroom/EditClassroomPage.tsx — edit existing session (pre-fills form)
3. Create frontend/src/features/classroom/MySessionsPage.tsx — scholar's sessions list with status badges + edit/delete/start actions

4. Add to useClassroom.ts:
   - useCreateClassroom(): useMutation → POST /api/v1/classrooms
   - useUpdateClassroom(): useMutation → PUT /api/v1/classrooms/:id
   - useDeleteClassroom(): useMutation → DELETE /api/v1/classrooms/:id
   - useMySessions(role, status, page): GET /api/v1/classrooms/my-sessions?role=host&status=...&page=...

5. Routes:
   /scholar/classrooms → MySessionsPage (AuthGuard + scholar role check in component)
   /scholar/classrooms/new → ScheduleClassroomPage (AuthGuard + scholar)
   /scholar/classrooms/:id/edit → EditClassroomPage (AuthGuard + scholar)

6. Add "My Sessions" or "Classrooms" link to scholar dashboard/nav (only visible if user.role includes 'scholar').

7. Form validation: use createClassroomSchema from @deenverse/shared with React Hook Form + zod resolver.

8. Course linking: when "Link to Course" is toggled, show dropdown of scholar's courses (fetch via useMyTeaching from Phase 2), then show lesson selector.

9. Delete SchedulePrototype files.

After completing:
tick comment TASK-079 copilot-2 --note "Schedule Classroom page integrated: create, edit, my sessions list. Scholar routes live. Course-linking works."
tick done TASK-079 copilot-2
```

---

### STEP 4D · TASK-080 (SONNET — Integrate Whiteboard with tldraw)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: TASK-072 done + TASK-076 done + TASK-078 done + you've picked a prototype
**TICK before starting**:
```
tick claim TASK-080 copilot-2
```

---

**PROMPT TO SEND (fill in `[N]`):**

```
TASK-080: Integrate tldraw whiteboard into the Live Classroom + promote Whiteboard Prototype [N].

Read first:
- .agents/contracts/virtual-classroom.md (Whiteboard sections)
- frontend/src/features/classroom/prototypes/WhiteboardPrototype[N].tsx
- frontend/src/features/classroom/ClassroomLivePage.tsx (already created in TASK-078)

Install tldraw:
cd frontend && npm install @tldraw/tldraw

Do the following:

1. Create frontend/src/features/classroom/components/WhiteboardPanel.tsx
   Core whiteboard component using tldraw. Based on chosen prototype layout.

2. tldraw integration:
   - Embed <Tldraw /> component inside a panel within ClassroomLivePage.
   - Use tldraw's store API (createTLStore, loadSnapshot, getSnapshot) for state management.
   - Host has full drawing/editing permissions. Participants have read-only view (or edit based on settings).

3. Whiteboard sync via LiveKit data channel:
   - On host drawing changes: serialize tldraw changes → send via LiveKit data channel (useDataChannel)
   - On participant receive: apply changes to local tldraw store
   - This keeps sync fast (peer-to-peer) without REST API overhead.

4. Snapshot persistence (backend fallback):
   - Every 30 seconds, host sends current snapshot to backend: PUT /api/v1/classrooms/:id/whiteboard
   - When a new participant joins: GET /api/v1/classrooms/:id/whiteboard → hydrate their tldraw store.
   - This ensures late-joiners see the current board state.

5. Add to useClassroom.ts:
   - useSaveWhiteboard(): useMutation → PUT /api/v1/classrooms/:id/whiteboard { snapshot }
   - useWhiteboardSnapshot(classroomId): GET /api/v1/classrooms/:id/whiteboard

6. Whiteboard controls (from prototype):
   - Host: full toolbar (pen, shapes, text, eraser, colors, clear all)
   - Participant: view-only by default, pointer visible to host
   - "Clear All" with confirmation dialog (host only)
   - Fullscreen whiteboard toggle (hides video feeds, maximizes canvas)

7. Participant cursors: show remote cursor positions on the canvas with username labels (use LiveKit data channel for position broadcasting, or tldraw's built-in presence if using @tldraw/sync).

8. Update ClassroomLivePage.tsx: integrate WhiteboardPanel as a toggleable panel (whiteboard toggle in control bar shows/hides it).

9. Handle the tldraw chunk size: add tldraw to manual chunks in frontend/vite.config.ts if it exceeds 250KB limit.

10. Delete WhiteboardPrototype files.

After completing:
tick comment TASK-080 copilot-2 --note "tldraw whiteboard integrated into live classroom. LiveKit data channel sync, snapshot persistence, host/participant permissions, cursor sharing."
tick done TASK-080 copilot-2
```

---

### STEP 4E · TASK-081 (SONNET — Student Sessions + Course Integration)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: TASK-078 done
**TICK before starting**:
```
tick claim TASK-081 copilot-2
```

---

**PROMPT TO SEND:**

```
TASK-081: Build Student Sessions page + integrate classrooms into Course Player.

Read first:
- .agents/contracts/virtual-classroom.md
- frontend/src/features/classroom/useClassroom.ts (extend)
- frontend/src/features/courses/CoursePlayerPage.tsx (from Phase 2 — course player)
- frontend/src/features/courses/CourseDetailPage.tsx (from Phase 2 — course detail)

Do the following:

1. Create frontend/src/features/classroom/StudentSessionsPage.tsx
   Show student's classroom history — attended sessions, upcoming sessions for enrolled courses.
   Design: card grid with status badges (Live → green pulse, Upcoming → blue, Ended → grey).
   Join button for live sessions, "Watch Recording" for ended with recordings.

2. Add to useClassroom.ts:
   - useStudentSessions(status, page): GET /api/v1/classrooms/my-sessions?role=student&status=...

3. Route: /my-sessions → StudentSessionsPage (AuthGuard)

4. Integrate classrooms into Course Detail page (CourseDetailPage.tsx):
   - Below the module list, add "Upcoming Live Sessions" section if the course has scheduled classrooms.
   - Use useUpcomingClassrooms(courseSlug) hook.
   - Show session cards with "Join" / "Notify Me" buttons.

5. Integrate classrooms into Course Player (CoursePlayerPage.tsx):
   - For lessons with type='live-session': show "Join Live Classroom" button instead of video/text content.
   - If the session is scheduled but not live yet: show countdown timer + "Session starts in X".
   - If the session is live: show "Join Now" button → navigates to /classrooms/:id/live.
   - If the session has ended: show "Watch Recording" link.

6. Add "My Sessions" link in user profile dropdown or navigation (alongside "My Courses").

After completing:
tick comment TASK-081 copilot-2 --note "Student Sessions page live. Classrooms integrated into Course Detail (upcoming sessions) and Course Player (live-session lesson type). Route /my-sessions."
tick done TASK-081 copilot-2
```

---

### STEP 4F · TASK-082 (SONNET — Recording Viewer + Polish)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: TASK-071 done + TASK-078 done
**TICK before starting**:
```
tick claim TASK-082 copilot-2
```

---

**PROMPT TO SEND:**

```
TASK-082: Build Recording Viewer and polish classroom experience.

Read first:
- .agents/contracts/virtual-classroom.md (Recording section)
- frontend/src/features/classroom/useClassroom.ts (extend)
- frontend/src/features/classroom/ClassroomLivePage.tsx

Do the following:

1. Add to useClassroom.ts:
   - useStartRecording(): useMutation → POST /api/v1/classrooms/:id/recording/start
   - useStopRecording(): useMutation → POST /api/v1/classrooms/:id/recording/stop
   - useRecordings(classroomId): GET /api/v1/classrooms/:id/recordings
   - useMuteParticipant(): useMutation → POST /api/v1/classrooms/:id/mute/:participantId
   - useKickParticipant(): useMutation → POST /api/v1/classrooms/:id/kick/:participantId
   - useUpdateSettings(): useMutation → PUT /api/v1/classrooms/:id/settings

2. Recording UI in ClassroomLivePage.tsx (host controls):
   - Record button in control bar → starts/stops recording via hooks.
   - "Recording in Progress" banner shown to ALL participants when recording is active (listen for classroom:recording-started Socket.IO event).
   - Red recording dot indicator in control bar.

3. Create frontend/src/features/classroom/RecordingViewerPage.tsx
   - Route: /classrooms/:id/recordings → shows list of session recordings
   - Video player for watching recordings (use standard HTML5 video with HLS.js if needed)
   - Session metadata: date, duration, participant count, title, host

4. Host moderation controls in ClassroomLivePage.tsx:
   - In Participants panel, host sees: Mute button (audio), Mute Video button, Kick button per participant.
   - Kick shows confirmation dialog with optional reason input.
   - Settings gear icon in control bar → opens modal to toggle chat/whiteboard/participant permissions on the fly.

5. Polish and edge cases:
   - Connection lost: show reconnecting overlay with spinner
   - Classroom ended by host: show "Session has ended" overlay with options (View Recording, Back to Lobby)
   - Max participants reached: show "Classroom is full" message when join fails

After completing:
tick comment TASK-082 copilot-2 --note "Recording viewer, host moderation controls, recording UI, and connection edge cases handled. Polish complete."
tick done TASK-082 copilot-2
```

---

### STEP 4G · TASK-083 (OPUS — Unit Tests: Classroom Service + LiveKit)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: TASK-068 + TASK-069 done
**Start in parallel with**: STEP 4A–4F
**TICK before starting**:
```
tick claim TASK-083 copilot
```

---

**PROMPT TO SEND:**

```
TASK-083: Write unit tests for Classroom models and service.

Read first:
- backend/models/classroomSchema.js
- backend/models/classroomParticipantSchema.js
- backend/services/classroomService.js
- backend/services/livekitService.js
- backend/__tests__/ (check existing test setup from Phase 1/2)

Write unit tests in backend/__tests__/:

1. Classroom Model (classroomModel.test.js):
   - Required fields validation (host, title, scheduledAt)
   - Enum validation (invalid type, status, access rejected)
   - Default values (status='scheduled', maxParticipants=50, settings defaults)
   - Index: livekitRoomName uniqueness

2. LiveKit Service (livekitService.test.js):
   - isLivekitConfigured: returns true when env vars set, false when missing
   - generateToken: returns valid JWT string with correct grants for host vs participant
   - generateToken host: includes roomAdmin=true, canPublish=true, canPublishData=true
   - generateToken participant: canPublish based on options, canSubscribe=true
   - createRoom: calls RoomServiceClient.createRoom with correct params
   - deleteRoom: calls RoomServiceClient.deleteRoom
   - muteParticipant: delegates to RoomServiceClient
   - removeParticipant: delegates to RoomServiceClient
   - Graceful fallback when not configured

3. Classroom Service (classroomService.test.js):
   - createClassroom: success with valid data, sets host, generates livekitRoomName
   - createClassroom with courseSlug: verifies user is course instructor, links course
   - browseClassrooms: filters by status, type; pagination correct
   - startClassroom: only host can start, creates LiveKit room, returns token + serverUrl
   - startClassroom: rejects if not scheduled (already live or ended)
   - joinClassroom: access='course-only' verifies enrollment, rejects non-enrolled
   - joinClassroom: access='public' allows any authenticated user
   - joinClassroom: rejects when maxParticipants reached
   - joinClassroom: reconnection (existing participant) generates new token without duplicate
   - endClassroom: only host/admin can end, deletes LiveKit room, sets ended status
   - leaveClassroom: decrements participantCount, sets leftAt
   - deleteClassroom: prevents deletion of live classroom
   - updateClassroom: ownership check passes for host, fails for non-host (403)

Use jest.mock() to mock mongoose models and livekit-server-sdk. Do not hit real services.

After completing:
tick comment TASK-083 copilot --note "Unit tests for classroom model, livekitService, and classroomService. Access control, lifecycle, and token generation all tested."
tick done TASK-083 copilot
```

---

### STEP 4H · TASK-084 (OPUS — Unit Tests: Controls + Recording + Whiteboard)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: TASK-070 + TASK-071 + TASK-072 done
**TICK before starting**:
```
tick claim TASK-084 copilot
```

---

**PROMPT TO SEND:**

```
TASK-084: Write unit tests for Classroom Controls, Recording, and Whiteboard.

Read first:
- backend/services/classroomService.js (control + recording + whiteboard functions)
- backend/services/livekitService.js (recording functions)

Write unit tests in backend/__tests__/:

1. Classroom Controls (classroomControls.test.js):
   - muteParticipant: only host can mute, delegates to LiveKit, updates ClassroomParticipant
   - kickParticipant: only host/admin can kick, removes from LiveKit, updates participant record
   - kickParticipant: non-host gets 403
   - updateSettings: only host can update, merges settings (doesn't replace), broadcasts via Socket.IO mock
   - Raise hand Socket.IO events: test hand queue management (add, remove, grant-speak)

2. Recording Service (classroomRecording.test.js):
   - startRecording: only host, only when live, only when recordingEnabled
   - startRecording: rejects when not host (403), when not live (400), when recording disabled (400)
   - stopRecording: stops Egress, pushes recording to classroom.recordings array
   - getRecordings: allows host and participants, rejects non-participants (403)

3. Whiteboard Sync (classroomWhiteboard.test.js):
   - saveWhiteboardSnapshot: only host can save, stores snapshot in classroom.whiteboardSnapshot
   - getWhiteboardSnapshot: returns snapshot for any participant, 403 for non-participant
   - Snapshot persistence: verify snapshot is stored as Mixed type (any JSON)

Mock mongoose models, livekitService functions, and Socket.IO getIO().

After completing:
tick comment TASK-084 copilot --note "Unit tests for classroom controls (mute/kick/settings), recording lifecycle, and whiteboard sync. All passing."
tick done TASK-084 copilot
```

---

### STEP 4I · TASK-085 (OPUS — Smoke Tests)
**Agent**: 🔵 OPUS (Copilot → Claude Opus 4.6)
**Wait for**: TASK-083 + TASK-084 both done
**TICK before starting**:
```
tick claim TASK-085 copilot
```

---

**PROMPT TO SEND:**

```
TASK-085: Write smoke/integration tests for all Phase 3 Classroom API endpoints.

Read first:
- All Phase 3 route files (classroomRoute.js)
- backend/index.js (app setup)
- backend/__tests__/ (existing test setup)

Use supertest + mongodb-memory-server (same approach as Phase 1/2 smoke tests).

Write backend/__tests__/smoke/phase3.smoke.test.js covering:

CLASSROOM CRUD:
1. Unauthenticated POST /api/v1/classrooms → 401
2. Authenticated non-scholar POST /api/v1/classrooms → 403
3. Scholar POST /api/v1/classrooms with valid body → 201, returns classroom with livekitRoomName
4. GET /api/v1/classrooms → 200, returns paginated classrooms
5. GET /api/v1/classrooms?status=scheduled → 200, only scheduled classrooms
6. GET /api/v1/classrooms/:id → 200, includes host info
7. Scholar PUT /api/v1/classrooms/:id → 200, update succeeds for host
8. Different scholar PUT /api/v1/classrooms/:id → 403 (not host)
9. Scholar DELETE /api/v1/classrooms/:id (scheduled) → 200, hard delete

LIFECYCLE:
10. Scholar POST /api/v1/classrooms/:id/start → 200, returns livekitToken + serverUrl, status becomes 'live'
11. Non-host POST /api/v1/classrooms/:id/start → 403
12. POST /api/v1/classrooms/:id/start (already live) → 400
13. Enrolled student POST /api/v1/classrooms/:id/join → 200, returns livekitToken
14. Non-enrolled student POST /api/v1/classrooms/:id/join (course-only) → 403
15. POST /api/v1/classrooms/:id/join (public access) → 200 for any authenticated user
16. POST /api/v1/classrooms/:id/join (full classroom) → 403
17. Scholar POST /api/v1/classrooms/:id/end → 200, status becomes 'ended'
18. Student POST /api/v1/classrooms/:id/leave → 200, participantCount decremented

CONTROLS:
19. Host POST /api/v1/classrooms/:id/mute/:participantId → 200
20. Non-host POST /api/v1/classrooms/:id/mute/:participantId → 403
21. Host POST /api/v1/classrooms/:id/kick/:participantId → 200
22. Host PUT /api/v1/classrooms/:id/settings → 200, settings updated

RECORDING:
23. Host POST /api/v1/classrooms/:id/recording/start (recording enabled) → 200
24. Host POST /api/v1/classrooms/:id/recording/stop → 200
25. GET /api/v1/classrooms/:id/recordings (participant) → 200

WHITEBOARD:
26. Host PUT /api/v1/classrooms/:id/whiteboard → 200
27. Participant GET /api/v1/classrooms/:id/whiteboard → 200

DISCOVERY:
28. GET /api/v1/classrooms/upcoming → 200, only future sessions
29. GET /api/v1/classrooms/my-sessions → 200

Mock LiveKit service calls (return placeholder tokens). Use mongodb-memory-server for database.

After completing:
tick comment TASK-085 copilot --note "All 29 smoke tests passing. Phase 3 Classroom API fully verified."
tick done TASK-085 copilot
```

---

## STAGE 5 — Documentation + Final Commit

---

### STEP 5 · TASK-086 (SONNET — Docs, Feature Board, Commit)
**Agent**: 🟢 SONNET (Copilot → Claude Sonnet 4.6)
**Wait for**: ALL of TASK-077, 078, 079, 080, 081, 082 done
**TICK before starting**:
```
tick claim TASK-086 copilot-2
```

---

**PROMPT TO SEND:**

```
TASK-086: Update all documentation, mark features complete, run lint, and do the final commit.

Do the following in order:

1. Run frontend lint: cd frontend && npm run lint
   Fix any lint errors introduced by Phase 3 code (unused imports, type errors, etc.) before committing.

2. Update .agents/feature-board.md:
   - Add Virtual Classroom (LiveKit + tldraw) row: Shared ✅, Backend ✅, Frontend ✅
   - Move it from "Upcoming" to "Active Features" table
   - Update Contract Created → ✅ for Virtual Classroom row

3. Update .agents/contracts/virtual-classroom.md:
   - Set Status to ✅ Complete
   - Add handover log entry with today's date and "Phase 3 implementation complete"

4. Update ROADMAP.md (if applicable): add Phase 3 completion note.

5. Commit all Phase 3 code with conventional commits:
   git add .
   git commit -m "feat(shared): add classroom Zod schemas for Phase 3"
   git add .
   git commit -m "feat(classroom): add Classroom models, LiveKit service, CRUD, lifecycle, controls, recording, whiteboard APIs"
   git add .
   git commit -m "feat(frontend): integrate classroom lobby, live view, scheduler, whiteboard, student sessions, recordings"
   git add .
   git commit -m "test(phase3): add unit + smoke tests for classroom system"
   git add .
   git commit -m "docs: update feature board and contracts for Phase 3 completion"

After completing:
tick comment TASK-086 copilot-2 --note "Phase 3 complete. Lint clean. Feature board updated. All commits pushed."
tick done TASK-086 copilot-2
```

---

## Quick Reference: Phase 3 Checklist

```
STAGE 1 — Shared Schemas
  [ ] STEP 1 · TASK-066 · OPUS   · Shared Zod schemas (classroom, settings, filters)

STAGE 2 — Backend Models + LiveKit Service
  [ ] STEP 2 · TASK-067 · OPUS   · Classroom + ClassroomParticipant models + LiveKit service

STAGE 3 — Backend APIs + Prototypes (parallel)
  [ ] STEP 3A · TASK-068 · OPUS         · Classroom CRUD API
  [ ] STEP 3B · TASK-069 · OPUS         · Classroom Lifecycle API (start/join/end/leave)
  [ ] STEP 3C · TASK-070 · OPUS         · Classroom Controls API (mute/kick/settings/raise hand)
  [ ] STEP 3D · TASK-071 · OPUS         · Recording API
  [ ] STEP 3E · TASK-072 · OPUS         · Whiteboard Sync Backend
  [ ] STEP 3F-1 · TASK-073 · ANTIGRAV   · Classroom Lobby prototypes (5 variants)
  [ ] STEP 3F-2 · TASK-074 · ANTIGRAV   · Live Classroom prototypes (5 variants)
  [ ] STEP 3F-3 · TASK-075 · ANTIGRAV   · Schedule Classroom prototypes (5 variants)
  [ ] STEP 3F-4 · TASK-076 · ANTIGRAV   · Whiteboard Panel prototypes (3 variants)

⭐ REVIEW GATE — YOU pick 1 winner per prototype set

STAGE 4 — Integration + Testing (parallel)
  [ ] STEP 4A · TASK-077 · SONNET · Integrate Classroom Lobby page
  [ ] STEP 4B · TASK-078 · SONNET · Integrate Live Classroom page + LiveKit
  [ ] STEP 4C · TASK-079 · SONNET · Integrate Schedule Classroom + My Sessions
  [ ] STEP 4D · TASK-080 · SONNET · Integrate Whiteboard with tldraw
  [ ] STEP 4E · TASK-081 · SONNET · Student Sessions + Course integration
  [ ] STEP 4F · TASK-082 · SONNET · Recording Viewer + Polish
  [ ] STEP 4G · TASK-083 · OPUS   · Unit tests: Classroom + LiveKit
  [ ] STEP 4H · TASK-084 · OPUS   · Unit tests: Controls + Recording + Whiteboard
  [ ] STEP 4I · TASK-085 · OPUS   · Smoke tests: All Classroom APIs

STAGE 5 — Finalize
  [ ] STEP 5 · TASK-086 · SONNET · Docs + Feature board + Final commit
```

---

## Parallel Execution Map

```
                   STAGE 1         STAGE 2         STAGE 3                          GATE    STAGE 4                         STAGE 5
OPUS               066 ──────────▶ 067 ──────────▶ 068→069→070→071→072             │       083→084→085                      │
                                                                                    │                                       │
ANTIGRAVITY                                         073,074,075,076 (all parallel)  │                                       │
                                                                                    │                                       │
YOU                                                                                ⭐ PICK  │                                │
                                                                                    │                                       │
SONNET                                                                              │       077→078→079→080→081→082 ────────▶ 086
```

### What Can Run in Parallel (within each stage)

**Stage 3 — OPUS backend tasks:**
- TASK-068 (CRUD) first — creates route/controller/service files.
- TASK-069 (Lifecycle) after 068 — extends the same files.
- TASK-070 (Controls) after 069 — extends further.
- TASK-071 (Recording) after 069 — can run parallel with 070 (different functions).
- TASK-072 (Whiteboard) after 070 — extends socket + service.

**Safest execution order**: 068 → 069 → (070 + 071 parallel) → 072

**Stage 3 — ANTIGRAVITY prototypes:**
- ALL four prototype tasks (073-076) are fully independent. Run all in the same session or sequentially — they only create files in `prototypes/` folder.

**Stage 4 — SONNET integration:**
- TASK-077 first (creates useClassroom.ts), then 078-082 in order:
  - 078 depends on 077 (needs useClassroom.ts)
  - 079 extends useClassroom.ts
  - 080 depends on 078 (needs ClassroomLivePage to embed whiteboard)
  - 081 depends on 078 (needs live page working)
  - 082 depends on 078 + 071 (needs live page + recording API)

**Stage 4 — OPUS tests:**
- TASK-083 can start as soon as TASK-068 + 069 are done (parallel with Sonnet)
- TASK-084 can start as soon as TASK-070 + 071 + 072 done
- TASK-085 depends on 083 + 084

---

## Notes

- **TICK.md is the source of truth** — always claim before starting, always done after finishing
- **Contract is at** `.agents/contracts/virtual-classroom.md` — every agent reads it before coding
- **Never skip the review gate** — Sonnet integration must wait for you to pick a prototype
- **Opus runs tests independently** — no need to wait for frontend to finish
- **Phase 2 must be complete** — Virtual Classroom depends on course system + scholar roles + enrollment
- **LiveKit dev mode**: When `LIVEKIT_API_KEY` is not set, livekitService returns placeholder data so local development works without a LiveKit server. Frontend should handle this gracefully (show mock video UI).
- **tldraw chunk size**: tldraw is ~400KB — add it to manual chunks in `vite.config.ts` to avoid build warnings
- **Existing streaming coexists**: AWS IVS (one-to-many broadcasting) stays for large streams. LiveKit (many-to-many, interactive) is for classrooms. They serve different use cases.
- **Phase 4** (Interactive Quran Teaching) planning begins only after TASK-086 is done and you confirm satisfaction
