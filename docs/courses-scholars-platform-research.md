# DeenVerse — Courses, Scholars & Islamic Learning Platform — Deep Research

> **Date**: March 2026
> **Purpose**: Comprehensive deep-research brief covering courses, live teaching, Quran classroom, scholar roles, certification, payments, dawah & Q&A features
> **Research Sources**: Exa web search, Context7, GitHub repositories, official docs, academic papers, industry case studies
> **Status**: Research complete — awaiting implementation decision

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Feature 1: Course System (Self-Paced + Instructor-Led)](#feature-1-course-system)
3. [Feature 2: Live Streaming Classroom (Screen Share, Whiteboard, Camera)](#feature-2-live-streaming-classroom)
4. [Feature 3: Interactive Quran Teaching](#feature-3-interactive-quran-teaching)
5. [Feature 4: Scholar Role System & Badges](#feature-4-scholar-role-system)
6. [Feature 5: Scholar Certification Path](#feature-5-scholar-certification-path)
7. [Feature 6: Payment System (Scholar Salary + Student Fees)](#feature-6-payment-system)
8. [Feature 7: Online Dawah & Q&A Platform](#feature-7-online-dawah-qa)
9. [Technology Comparison Matrix](#technology-comparison-matrix)
10. [Recommended Architecture](#recommended-architecture)
11. [Data Models](#data-models)
12. [Implementation Roadmap](#implementation-roadmap)
13. [Risk Analysis](#risk-analysis)
14. [Sources & References](#sources-references)

---

## Executive Summary

This document covers the research and architectural design for transforming DeenVerse from a social media + hadith-sharing platform into a **comprehensive Islamic education ecosystem** with:

- **Course marketplace** (Udemy/Coursera-style) with self-paced and live instructor-led courses
- **Virtual classroom** with WebRTC video, screen sharing, and collaborative whiteboard
- **Interactive Quran teaching** with word-by-word annotation, pointer tracking, and multi-language meaning display
- **Scholar role hierarchy** with verified badges (like X/Twitter blue checkmark but for Islamic scholars)
- **Certification system** where users can earn scholar credentials through exams on the platform
- **Payment infrastructure** with Stripe Connect for student fees and scholar salary payouts
- **Dawah & Q&A** features for community Islamic guidance

### Key Recommendations at a Glance

| Feature | Recommended Stack | Why |
|---|---|---|
| Courses | Custom LMS (MongoDB models + TanStack Query) | Full control, integrates with existing DeenVerse social graph |
| Live Classroom | **LiveKit** (open-source WebRTC SFU) | Self-hostable, free tier, React SDK, screen share built-in |
| Whiteboard | **tldraw** (React SDK) | Drop-in React component, collaborative, MIT-friendly |
| Quran Teaching | Custom + **Quran.com API v4** + **MASAQ dataset** | Word-by-word data + morphological annotations |
| Scholar Roles | RBAC extension of existing user schema | Extends current `role` enum, adding `scholar` + verification workflow |
| Certification | Custom exam engine (quiz + proctoring-lite) | MongoDB models + timed assessments + scholar review |
| Payments | **Stripe Connect** (Express accounts) | Marketplace standard, handles payouts, invoicing, compliance |
| Dawah & Q&A | Custom feature + existing Socket.IO | Extends existing chat/streaming for live Q&A sessions |

---

## Feature 1: Course System

### 1.1 Problem Statement

DeenVerse currently has no structured learning pathway. Users consume hadith posts and explore Quran topics, but there is no way for scholars to create structured courses with modules, lessons, quizzes, and progress tracking.

### 1.2 Market Research

**Islamic EdTech Market**: Projected to cross $10B by 2027 (MadrasaTech 2023 Report). Over 600M Muslims globally have internet access seeking structured learning. Key players: Bayyinah TV, SeekersGuidance, AlMaghrib Institute, Ilmify.

**LMS Landscape 2025-2026** (eLearning Industry, Training Industry):
- The LMS market is expected to reach $37.9B by 2026
- Top platforms: Moodle (open-source, 340M+ users), TalentLMS, Canvas LMS, Thinkific, LearnWorlds
- Key trend: AI-powered personalized learning paths, micro-learning, mobile-first
- Most Islamic education platforms (Ilmify, Quran Academy) use custom-built LMS tuned for Islamic content types (Hifz tracking, Tajweed assessment, Tarbiyah progress)

### 1.3 Implementation Options

#### Option A: Embed a Third-Party LMS (Moodle/Canvas)
| Aspect | Details |
|---|---|
| Approach | Self-host Moodle, embed via iframe or LTI integration |
| Pros | Feature-complete (assignments, grading, SCORM support), battle-tested |
| Cons | Separate tech stack (PHP), poor UX integration with React app, heavy overhead, split user experience |
| Effort | Medium (setup), High (customization to match DeenVerse UX) |
| **Verdict** | **Not recommended** — creates a silo, doesn't leverage DeenVerse's social features |

#### Option B: Use a Headless LMS API (Thinkific/LearnWorlds API)
| Aspect | Details |
|---|---|
| Approach | Use API to manage courses, render custom frontend |
| Pros | Proven content management, handles video hosting |
| Cons | Monthly costs ($99-499/mo), API rate limits, vendor lock-in, limited Islamic-specific features |
| Effort | Medium |
| **Verdict** | **Not recommended** — too expensive at scale, limited customization |

#### Option C: Custom LMS Built on DeenVerse Stack ✅ RECOMMENDED
| Aspect | Details |
|---|---|
| Approach | Build course models in MongoDB, API in Express, UI in React |
| Pros | Full control, integrates with social graph (follow scholars, share progress), Islamic-specific features (Hifz tracking, Tajweed modules), no vendor lock-in, uses existing auth/roles |
| Cons | More upfront development, need to build content editor |
| Effort | High (but incremental — start simple, iterate) |
| **Verdict** | **Recommended** — best long-term fit for DeenVerse's unique requirements |

### 1.4 Course System Architecture

```
Course Types:
├── Self-Paced Courses
│   ├── Pre-recorded video lessons (S3 + CloudFront)
│   ├── Text/markdown lessons with embedded Quran references
│   ├── PDF attachments & downloadable resources
│   ├── Quizzes & assessments after each module
│   └── Progress tracking (% complete, bookmarks, notes)
│
└── Instructor-Led Courses (Live)
    ├── Scheduled live sessions via LiveKit
    ├── Course calendar with timezone support
    ├── Attendance tracking
    ├── Homework/assignment submission
    ├── Live Q&A during sessions
    └── Session recordings (auto-saved as VOD)
```

### 1.5 Course Data Model (MongoDB)

```javascript
// Course Schema
{
  instructor: ObjectId (ref: User, must be scholar/admin),
  title: String,
  slug: String (unique, URL-friendly),
  description: String,
  shortDescription: String (max 200 chars),
  thumbnail: String (S3 URL),
  category: enum ['quran', 'hadith', 'fiqh', 'aqeedah', 'seerah', 'arabic', 'tajweed', 'tafseer', 'dawah', 'other'],
  level: enum ['beginner', 'intermediate', 'advanced'],
  language: String (default: 'en'),
  type: enum ['self-paced', 'instructor-led', 'hybrid'],
  
  // Pricing
  pricing: {
    type: enum ['free', 'paid', 'subscription'],
    amount: Number (in cents),
    currency: String (default: 'usd'),
    stripePriceId: String
  },
  
  // Structure
  modules: [{
    title: String,
    description: String,
    order: Number,
    lessons: [{
      title: String,
      type: enum ['video', 'text', 'quiz', 'live-session', 'assignment'],
      content: Mixed, // video URL, markdown, quiz questions, etc.
      duration: Number (minutes),
      order: Number,
      isFree: Boolean (preview lesson),
      resources: [{ name: String, url: String, type: String }]
    }]
  }],
  
  // Live course specifics
  schedule: {
    startDate: Date,
    endDate: Date,
    recurrence: enum ['daily', 'weekly', 'biweekly', 'custom'],
    sessions: [{ date: Date, duration: Number, topic: String }],
    timezone: String
  },
  
  // Metadata
  requirements: [String],
  learningOutcomes: [String],
  tags: [String],
  status: enum ['draft', 'pending-review', 'published', 'archived'],
  enrollmentCount: Number,
  rating: { average: Number, count: Number },
  
  // Settings
  maxStudents: Number (0 = unlimited),
  certificateOnCompletion: Boolean,
  autoEnroll: Boolean (for free courses),
  
  createdAt, updatedAt
}

// Enrollment Schema
{
  student: ObjectId (ref: User),
  course: ObjectId (ref: Course),
  status: enum ['active', 'completed', 'dropped', 'suspended'],
  progress: {
    completedLessons: [ObjectId],
    currentModule: Number,
    currentLesson: Number,
    percentComplete: Number,
    lastAccessedAt: Date
  },
  payment: {
    stripePaymentId: String,
    amount: Number,
    paidAt: Date
  },
  certificate: {
    issued: Boolean,
    issuedAt: Date,
    certificateId: String (unique)
  },
  notes: [{ lessonId: ObjectId, content: String, createdAt: Date }],
  enrolledAt: Date,
  completedAt: Date
}

// Quiz/Assessment Schema
{
  course: ObjectId (ref: Course),
  lesson: ObjectId,
  title: String,
  type: enum ['quiz', 'exam', 'certification-exam'],
  timeLimit: Number (minutes, 0 = unlimited),
  passingScore: Number (percentage),
  maxAttempts: Number,
  questions: [{
    text: String,
    type: enum ['mcq', 'true-false', 'short-answer', 'essay', 'quran-recitation'],
    options: [{ text: String, isCorrect: Boolean }],
    points: Number,
    explanation: String (shown after submission),
    ayahRef: String (optional, for Quran-specific questions)
  }],
  shuffleQuestions: Boolean,
  showCorrectAnswers: Boolean
}

// Quiz Attempt Schema
{
  student: ObjectId (ref: User),
  quiz: ObjectId (ref: Quiz),
  answers: [{ questionIndex: Number, answer: Mixed, isCorrect: Boolean }],
  score: Number,
  passed: Boolean,
  startedAt: Date,
  submittedAt: Date,
  attempt: Number
}
```

### 1.6 API Endpoints

```
# Scholar/Admin endpoints
POST   /api/v1/courses                     — Create course
PUT    /api/v1/courses/:slug               — Update course
DELETE /api/v1/courses/:slug               — Delete course
POST   /api/v1/courses/:slug/modules       — Add module
PUT    /api/v1/courses/:slug/publish       — Publish course (admin review)

# Student endpoints
GET    /api/v1/courses                     — Browse courses (paginated, filtered)
GET    /api/v1/courses/:slug               — Course detail
POST   /api/v1/courses/:slug/enroll       — Enroll in course
GET    /api/v1/courses/:slug/progress     — Get progress
PUT    /api/v1/courses/:slug/progress     — Update progress (lesson complete)
GET    /api/v1/courses/:slug/lessons/:id  — Get lesson content

# Quiz endpoints
POST   /api/v1/quizzes/:id/start          — Start quiz attempt
POST   /api/v1/quizzes/:id/submit         — Submit quiz
GET    /api/v1/quizzes/:id/results        — View results

# Discovery
GET    /api/v1/courses/featured           — Featured/trending courses
GET    /api/v1/courses/my-courses         — Student's enrolled courses
GET    /api/v1/courses/teaching           — Scholar's created courses
```

---

## Feature 2: Live Streaming Classroom

### 2.1 Problem Statement

DeenVerse currently has basic live streaming via AWS IVS (RTMP ingest → HLS playback), which is one-way broadcasting. The new requirement is a full **virtual classroom** with:
- Two-way video/audio (teacher + students)
- Screen sharing
- Collaborative whiteboard
- Camera on/off toggle
- Microphone on/off toggle
- Raise hand feature
- Chat sidebar
- Recording capability

### 2.2 Technology Comparison

| Platform | Type | Pricing | Screen Share | Whiteboard | React SDK | Self-Host | Latency |
|---|---|---|---|---|---|---|---|
| **LiveKit** | Open-source SFU | Free (self-host) / Cloud: 5K min free, then $0.006/min | ✅ Built-in | Via integration | ✅ `@livekit/components-react` | ✅ Apache 2.0 | ~100ms |
| **100ms** | Managed SaaS | 10K min free, then $0.004/min | ✅ Built-in | ✅ Built-in | ✅ `@100mslive/react-sdk` | ❌ | ~150ms |
| **Daily.co** | Managed SaaS | 2K min free, then $0.008/min | ✅ Built-in | Via Prebuilt | ✅ `@daily-co/daily-react` | ❌ | ~200ms |
| **Agora** | Managed SaaS | 10K min free, then $0.0099/min | ✅ Built-in | ✅ Flexible Classroom | ✅ `agora-rtc-react` | ❌ | ~100ms |
| **AWS IVS** (current) | Managed | Pay-per-use | ❌ (one-way) | ❌ | ❌ | ❌ | ~3-5s (HLS) |
| **OpenVidu** | Open-source (LiveKit-based) | Free (self-host) | ✅ | Via integration | ✅ | ✅ | ~100ms |

### 2.3 Recommendation: LiveKit ✅

**Why LiveKit is the best fit for DeenVerse:**

1. **Open-source (Apache 2.0)**: Self-host on your own infrastructure — zero per-minute costs at scale. Critical for an Islamic platform targeting 600M+ potential Muslim users globally.

2. **React SDK**: `@livekit/components-react` provides pre-built UI components (VideoTrack, AudioTrack, ParticipantTile, ChatWidget, ScreenShareButton) that integrate cleanly with the existing React + shadcn/ui design system.

3. **Feature-complete**:
   - Video/audio conferencing (SFU architecture, scales to 1000+ participants)
   - Screen sharing (single-click, works across browsers)
   - Recording (server-side, saves to S3-compatible storage)
   - Data channels (for whiteboard sync, pointer tracking, raise-hand signals)
   - Breakout rooms
   - Simulcast (adaptive quality based on viewer bandwidth)

4. **Node.js server SDK**: `livekit-server-sdk` generates room tokens from your Express backend — integrates directly with the existing auth system.

5. **AI agent framework**: Future support for AI-powered features (real-time translation, transcription, question answering).

6. **Existing IVS integration preserved**: Keep AWS IVS for large-scale one-way broadcasts (10K+ viewers), use LiveKit for interactive classrooms (up to ~hundreds of participants).

### 2.4 Whiteboard Integration: tldraw ✅

**Why tldraw over Excalidraw:**

| Feature | tldraw | Excalidraw |
|---|---|---|
| React component | `<Tldraw />` drop-in | Needs wrapper |
| Collaboration | Built-in via `@tldraw/sync` | Needs custom sync layer |
| Shapes/tools | Rich (pen, shapes, text, arrows, frames, media embed) | Good but fewer |
| License | tldraw SDK License (free with watermark, $$ to remove) | MIT |
| Bundle size | ~400KB | ~300KB |
| Education focus | Used by many ed-tech platforms | More general |
| Pointer sharing | ✅ Built-in cursor broadcasting | ✅ Via Y.js |

**Recommendation**: Use **tldraw** for the whiteboard component. Embed `<Tldraw />` inside the classroom view. Sync drawing state via LiveKit's data channel (or tldraw's own sync protocol). The "Made with tldraw" watermark is acceptable initially; remove with business license ($150/year) when profitable.

**Alternative**: If budget is zero and license matters, use **Excalidraw** (MIT) with custom Socket.IO sync — slightly more work but fully free.

### 2.5 Classroom Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Virtual Classroom UI                │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐ │
│  │  Teacher  │  │ Student  │  │                   │ │
│  │  Video    │  │  Grid    │  │   Whiteboard      │ │
│  │  (large)  │  │ (small)  │  │   (tldraw)        │ │
│  │           │  │          │  │                   │ │
│  └──────────┘  └──────────┘  └───────────────────┘ │
│  ┌─────────────────────────────────────────────────┐│
│  │  Controls: 🎤 Mic | 📹 Cam | 🖥 Share | ✋ Hand ││
│  │  ✏️ Whiteboard | 💬 Chat | 📝 Notes | ⏺ Record ││
│  └─────────────────────────────────────────────────┘│
│  ┌───────────────────────┐ ┌───────────────────────┐│
│  │     Chat Panel        │ │   Participants List   ││
│  │     (Socket.IO)       │ │   (raise hand, mute)  ││
│  └───────────────────────┘ └───────────────────────┘│
└─────────────────────────────────────────────────────┘

Backend Flow:
  Express API → LiveKit Server SDK (generate token)
  LiveKit SFU Server → WebRTC (media routing)
  Socket.IO → Chat, raise hand signals, whiteboard sync
  S3 → Recording storage
```

### 2.6 LiveKit Integration Code Pattern

```typescript
// Backend: Generate classroom token
import { AccessToken, VideoGrant } from 'livekit-server-sdk';

function createClassroomToken(userId, userName, roomName, isTeacher) {
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity: userId, name: userName }
  );
  
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true, // teacher and speaking students
    canSubscribe: true,
    canPublishData: true, // for whiteboard sync
  };
  
  // Teachers get admin permissions
  if (isTeacher) {
    grant.roomAdmin = true;
    grant.canUpdateOwnMetadata = true;
  }
  
  token.addGrant(grant);
  return token.toJwt();
}

// Frontend: React component
import { LiveKitRoom, VideoConference } from '@livekit/components-react';

function ClassroomView({ token, serverUrl }) {
  return (
    <LiveKitRoom token={token} serverUrl={serverUrl} connect={true}>
      <VideoConference />
    </LiveKitRoom>
  );
}
```

---

## Feature 3: Interactive Quran Teaching

### 3.1 Problem Statement

Create a dynamic Quran teaching experience where:
- Teacher and student share a synchronized Quran view
- Any Arabic word can be tapped/hovered for meaning in multiple languages
- A pointer/cursor shows where the teacher or student is currently reading
- Tajweed rules are visually highlighted
- Recitation audio can be played word-by-word or verse-by-verse

### 3.2 Data Sources Research

#### a) Quran.com API v4
- **URL**: `https://api.quran.com/api/v4/`
- **Data**: Complete Quran text (Uthmani + Imla'i scripts), 100+ translations in 50+ languages, word-by-word data, audio recitations (50+ reciters), Tajweed-colored text
- **Word-by-Word**: `/verses/by_chapter/{chapter_id}?words=true&word_fields=text_uthmani,translation` returns each word with position, transliteration, and translation
- **License**: Free for non-commercial; commercial use requires approval
- **Reliability**: Powers Quran.com (millions of users), maintained by Quran Foundation

#### b) MASAQ Dataset (Mendeley Data, 2024)
- **Data**: 131K+ morphological entries, 123K syntactic function annotations
- **Features**: Complete i'rab (grammatical analysis) for every word, part-of-speech tagging, root word identification
- **Format**: JSON, CSV, XML, XLSX
- **License**: Creative Commons Attribution 3.0
- **Use**: Powers word-level grammatical analysis — show "فاعل" (subject), "مفعول به" (object), root-pattern derivation

#### c) Quranic Arabic Corpus (corpus.quran.com)
- **Data**: Word-by-word grammar, syntax tree, semantic ontology
- **Features**: Each word broken into morphological segments (prefix, stem, suffix), linked to Arabic grammar concepts
- **Use**: Supplement MASAQ for teaching Arabic grammar through Quran

#### d) Tanzil.net
- **Data**: Verified Quran text (Uthmani + Simple), translations, metadata
- **Format**: XML, plain text, SQL
- **License**: Free for non-commercial, CC BY 3.0 for text
- **Use**: Base Quran text source (used by MASAQ itself)

#### e) EasyQuran.ai Features (Industry Reference)
- Word-by-word translation (English & Urdu)
- AI-powered study tools
- Comprehensive footnotes
- Kids Quran with illustrations
- Recitation by Mishary Al Afasy

### 3.3 Recommended Architecture

```
┌──────────────────────────────────────────────────────────┐
│              Interactive Quran Teaching View               │
│                                                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │ Surah Al-Baqarah (2) — Ayah 255 (Ayatul Kursi)  │   │
│  │                                                     │   │
│  │ ٱللَّهُ  لَآ  إِلَٰهَ  إِلَّا  هُوَ  ٱلْحَىُّ │   │
│  │   ↑        ↑     ↑       ↑      ↑      ↑          │   │
│  │ Allah   no    god    except  He    The     │   │
│  │                                   Ever-Living       │   │
│  │                                                     │   │
│  │ [Teacher pointer ━━━━━━━━━━━━━━►]                  │   │
│  │                                                     │   │
│  │ 🔤 Word Detail (on hover/tap):                      │   │
│  │ ┌──────────────────────────────┐                    │   │
│  │ │ Word: ٱللَّهُ                 │                    │   │
│  │ │ Root: أ ل ه                  │                    │   │
│  │ │ Type: اسم (Noun) - مرفوع     │                    │   │
│  │ │ English: Allah (God)         │                    │   │
│  │ │ Urdu: اللہ                   │                    │   │
│  │ │ Turkish: Allah               │                    │   │
│  │ │ French: Allah (Dieu)         │                    │   │
│  │ │ Grammar: مبتدأ (Subject)     │                    │   │
│  │ │ 🔊 Play pronunciation        │                    │   │
│  │ └──────────────────────────────┘                    │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  Controls: ◄ Prev Ayah | ► Next Ayah | 🔊 Recitation    │
│  📖 Tafseer | 📝 Notes | 🎯 Tajweed Mode                │
└──────────────────────────────────────────────────────────┘
```

### 3.4 Quran Teaching Data Model

```javascript
// Quran Word Data (pre-loaded from Quran.com API + MASAQ)
{
  surah: Number,
  ayah: Number,
  wordPosition: Number,
  textUthmani: String,      // ٱللَّهُ
  textSimple: String,       // الله
  transliteration: String,  // allāhu
  audioUrl: String,         // word-level audio
  
  // Multi-language meanings
  translations: {
    en: String,  // "Allah"
    ur: String,  // "اللہ"
    tr: String,  // "Allah"
    fr: String,  // "Dieu"
    bn: String,  // "আল্লাহ"
    // ... more languages
  },
  
  // Morphological data (from MASAQ/Quranic Corpus)
  morphology: {
    root: String,           // "أ ل ه"
    pattern: String,        // "فَعِلَ"
    pos: String,            // "noun" / "verb" / "particle"
    posArabic: String,      // "اسم" / "فعل" / "حرف"
    grammaticalCase: String, // "مرفوع" / "منصوب" / "مجرور"
    syntacticRole: String,  // "مبتدأ" / "خبر" / "فاعل"
    derivation: String      // How word derives from root
  },
  
  // Tajweed
  tajweed: {
    rules: [{ type: String, startChar: Number, endChar: Number }]
    // e.g., { type: 'ghunna', startChar: 2, endChar: 4 }
  }
}
```

### 3.5 Pointer/Cursor Synchronization

The teacher's current reading position (which word they're pointing at) is broadcast in real-time:

```
Teacher clicks word at position (surah: 2, ayah: 255, word: 3)
  → LiveKit DataChannel OR Socket.IO
    → All connected students see a highlight/pointer on that word
    → ~50ms latency (LiveKit data channel) vs ~100ms (Socket.IO)
```

**Implementation**: Use LiveKit's `DataChannel` (already available in classroom) to broadcast pointer position as lightweight JSON:
```json
{ "type": "quran-pointer", "surah": 2, "ayah": 255, "word": 3, "userId": "teacher123" }
```

---

## Feature 4: Scholar Role System

### 4.1 Current State

DeenVerse currently has three roles: `user`, `admin`, `moderator` (defined in `userSchema.js` line 52).

### 4.2 Proposed Role Hierarchy

```
Roles (ordered by privilege):
├── user (default) — Regular user, can post, comment, consume content
├── scholar — Verified Islamic scholar
│   ├── Can create and teach courses
│   ├── Can host live sessions
│   ├── Can answer Q&A with scholar authority
│   ├── Gets scholar badge (✓) next to name
│   ├── Can issue certificates to students
│   └── Can earn salary/revenue from courses
├── moderator — Content moderation (existing)
├── admin — Full platform control (existing)
└── superadmin — System-level access (optional, env-based)
```

### 4.3 Scholar Verification Workflow

```
User applies for Scholar status
  → Application Form:
      - Full name & credentials
      - Islamic education background (institution, degree, certification)
      - Areas of expertise (e.g., Tafseer, Hadith, Fiqh, Arabic)
      - Supporting documents (scanned certificates, ijazah)
      - Letter of recommendation (optional)
      - Video introduction
      - Existing teaching portfolio (if any)
  
  → Admin Review Panel:
      - View application details & documents
      - Verify credentials (manual or third-party)
      - Approve / Reject / Request More Info
      - Set scholar specialty tags
  
  → Approval:
      - User role updated to 'scholar'
      - Scholar badge appears on profile
      - Scholar dashboard unlocked
      - Can now create courses, host live sessions
      - Notification sent to user
  
  → Rejection:
      - Reason provided to applicant
      - Can re-apply after X days
```

### 4.4 Badge Display System (Like X/Twitter Verified)

```
Badge Types:
├── 🟢 Scholar (verified Islamic scholar) — Green crescent/star
├── 🔵 Admin — Blue shield
├── 🟡 Moderator — Yellow shield
├── 🏆 Certified User — Bronze badge (passed certification exams)
└── (no badge) — Regular user

Display: Next to username everywhere:
  - Posts / comments
  - Profile page
  - Chat messages
  - Course instructor cards
  - Live stream host tags
  - Search results
```

### 4.5 User Schema Extension

```javascript
// Additions to existing userSchema.js
role: {
  type: String,
  enum: ['user', 'scholar', 'moderator', 'admin'],
  default: 'user'
},

// New fields for scholars
scholarProfile: {
  verifiedAt: Date,
  verifiedBy: ObjectId (ref: User, admin who approved),
  specialties: [String], // ['tafseer', 'hadith', 'fiqh', 'arabic', 'tajweed']
  credentials: [{
    title: String,     // "Ijazah in Quran Recitation"
    institution: String, // "Al-Azhar University"
    year: Number,
    documentUrl: String  // S3 URL of scanned document
  }],
  bio: String, // Scholar-specific extended bio
  teachingLanguages: [String], // ['en', 'ar', 'ur']
  rating: { average: Number, count: Number },
  totalStudents: Number,
  totalCourses: Number,
  
  // Payment
  stripeConnectId: String, // Stripe Connected Account ID
  payoutSchedule: enum ['weekly', 'biweekly', 'monthly'],
  
  // Application status (for pending scholars)
  applicationStatus: enum ['none', 'pending', 'approved', 'rejected'],
  applicationDate: Date,
  rejectionReason: String
},

// Certification badges (for users who passed exams)
certifications: [{
  name: String,
  slug: String,
  issuedAt: Date,
  expiresAt: Date,
  certificateId: String,
  verifiedBy: ObjectId
}]
```

### 4.6 RBAC Middleware

```javascript
// New middleware: isScholar
export const isScholar = async (req, _res, next) => {
  const user = await User.findById(req.user).select("role").lean();
  if (!user) return next(new AppError("User not found", 404));
  if (user.role === 'scholar' || user.role === 'admin') return next();
  return next(new AppError("Scholar privileges required.", 403));
};

// Combined: isScholarOrAdmin
export const isScholarOrAdmin = async (req, _res, next) => {
  const user = await User.findById(req.user).select("role").lean();
  if (!user) return next(new AppError("User not found", 404));
  if (['scholar', 'admin'].includes(user.role)) return next();
  return next(new AppError("Access denied.", 403));
};
```

### 4.7 Research: RBAC Best Practices (2025)

Per **Oso HQ (2025)** and **IEEE RBAC Cloud Security (2025)**:

1. **Principle of Least Privilege**: Each role gets only the permissions it needs. Scholars can create courses but not manage users.
2. **Separate users, roles, and permissions**: Don't hardcode role checks. Use a permissions table or middleware chain.
3. **Design roles around business functions**: Scholar → teaching, Moderator → content review, Admin → platform management.
4. **Plan for role exceptions**: A user can be both scholar AND moderator (add `additionalRoles` array or use bitwise flags).
5. **Scoped roles**: Scholar permissions apply to their own courses only, not all courses.
6. **Audit trail**: Log all role changes (who promoted whom, when).

---

## Feature 5: Scholar Certification Path

### 5.1 Concept

Users can become scholars by completing a rigorous certification program on DeenVerse itself. This democratizes Islamic education while maintaining quality.

### 5.2 Certification Tiers

```
Certification Levels:
├── Level 1: "DeenVerse Certified Student" 🎓
│   ├── Complete 5 courses (minimum 2 with live components)
│   ├── Pass 5 quizzes with 80%+ score
│   ├── Submit 3 reflections rated positively by scholars
│   └── Active for 6+ months
│
├── Level 2: "DeenVerse Certified Educator" 📚
│   ├── Must hold Level 1
│   ├── Complete educator-specific training course
│   ├── Pass comprehensive exam (MCQ + essay + oral)
│   ├── Submit teaching demo (video review by panel)
│   └── Background check on Islamic credentials
│
├── Level 3: "DeenVerse Certified Scholar" 🌟
│   ├── Must hold Level 2
│   ├── External credentials verification (Ijazah, university degree)
│   ├── Teach 3 courses with average rating ≥ 4.0
│   ├── Panel interview with existing scholars
│   └── Community endorsements (5+ established scholars)
│
└── Level 4: "DeenVerse Senior Scholar" 👑 (invitation-only)
    ├── Outstanding contribution to the platform
    ├── Published research or books
    ├── 500+ students taught with 4.5+ rating
    └── Board approval
```

### 5.3 Certification Exam Architecture

Based on research from MERN-based proctored exam systems (SecureProctor, ProctoAI):

```javascript
// Certification Exam Schema
{
  title: String,
  level: enum ['level-1', 'level-2', 'level-3'],
  category: String, // 'quran', 'hadith', 'fiqh', etc.
  
  requirements: {
    minCoursesCompleted: Number,
    minQuizScore: Number,
    minActiveMonths: Number,
    prerequisiteCertification: String // slug of previous level
  },
  
  exam: {
    sections: [{
      title: String,
      type: enum ['mcq', 'essay', 'oral-recitation', 'teaching-demo'],
      timeLimit: Number (minutes),
      questions: [QuestionSchema],
      weight: Number (% of total)
    }],
    totalDuration: Number,
    passingScore: Number,
    maxAttempts: Number (per year),
    cooldownDays: Number (between attempts)
  },
  
  proctoring: {
    enabled: Boolean,
    requireCamera: Boolean,
    tabSwitchLimit: Number,
    flagThreshold: Number // suspicious activity flags before auto-fail
  }
}

// Certification Application Schema
{
  user: ObjectId,
  certificationLevel: String,
  status: enum ['pending', 'exam-scheduled', 'exam-completed', 'under-review', 'approved', 'rejected'],
  
  // Prerequisites check
  prerequisites: {
    coursesCompleted: Number,
    quizAvgScore: Number,
    accountAge: Number,
    previousCertification: ObjectId
  },
  
  // Exam results
  examAttempts: [{
    attemptDate: Date,
    sections: [{ sectionTitle: String, score: Number }],
    totalScore: Number,
    passed: Boolean,
    proctorFlags: [{ type: String, timestamp: Date }]
  }],
  
  // Review (for Level 2-3)
  panelReview: {
    reviewers: [{ reviewer: ObjectId, score: Number, notes: String }],
    decision: enum ['pending', 'approved', 'rejected'],
    decidedAt: Date
  },
  
  // Supporting documents (for Level 3)
  documents: [{ type: String, url: String, verified: Boolean }],
  
  createdAt, updatedAt
}
```

### 5.4 Proctoring Approach (Lightweight)

For Level 1-2, use **behavioral proctoring** (no camera required):
- Track tab switches, focus loss, copy/paste attempts
- Time anomaly detection (too fast = likely cheating)
- Randomize question order and answer positions

For Level 3 (Scholar certification):
- Camera monitoring via LiveKit (teacher joins as proctor)
- Screen recording
- Panel oral exam via live classroom
- Human review of teaching demo

---

## Feature 6: Payment System

### 6.1 Requirements

| Flow | Description |
|---|---|
| Students pay for courses | One-time or subscription |
| Scholars receive salary | Platform takes commission, pays scholars |
| Scholar monthly stipend | Fixed monthly pay for featured scholars (optional) |
| Course revenue share | 70/30 or 80/20 split (scholar/platform) |
| Refund policy | Within 7-day window |
| Multiple currencies | USD, GBP, EUR, SAR, AED, PKR, BDT |

### 6.2 Technology: Stripe Connect ✅

**Why Stripe Connect (Express):**

Stripe Connect is the industry standard for marketplace payment flows (used by Lyft, Instacart, Shopify). It handles:

1. **Onboarding**: Scholars create a Stripe Connected Account via hosted onboarding (handles KYC/identity verification)
2. **Payment splitting**: When a student pays $50 for a course:
   - Platform takes $15 (30% commission)
   - Scholar receives $35 (70%)
   - Stripe takes ~2.9% + $0.30 of the $50
3. **Payouts**: Scholars receive payouts automatically on their set schedule (weekly/biweekly/monthly) directly to their bank account
4. **Invoicing**: Automatic invoice generation for both students and scholars
5. **Multi-currency**: Supports 135+ currencies
6. **Tax compliance**: Stripe handles 1099s in the US, VAT in EU

**Stripe Connect Account Types:**
- **Express** (Recommended): Stripe hosts the onboarding, handles all compliance. Fastest to implement. Scholars use a Stripe-hosted dashboard.
- **Custom**: Full API control, but you handle all compliance, identity verification. Much more work.
- **Standard**: Scholars have their own full Stripe account. Less control over UX.

### 6.3 Payment Architecture

```
Student wants to enroll in paid course ($50)
  │
  ├── Frontend: Click "Enroll" → POST /api/v1/payments/checkout
  │
  ├── Backend creates Stripe Checkout Session:
  │   {
  │     mode: 'payment', // or 'subscription' for recurring courses
  │     line_items: [{ price: course.stripePriceId, quantity: 1 }],
  │     payment_intent_data: {
  │       application_fee_amount: 1500, // $15 platform fee (30%)
  │       transfer_data: {
  │         destination: scholar.stripeConnectId // Scholar's connected account
  │       }
  │     },
  │     success_url: '/courses/{slug}/welcome',
  │     cancel_url: '/courses/{slug}'
  │   }
  │
  ├── Student redirected to Stripe Checkout (secure, PCI compliant)
  │
  ├── Payment succeeds → Stripe webhook fires:
  │   POST /api/v1/webhooks/stripe
  │   event: 'checkout.session.completed'
  │
  ├── Backend webhook handler:
  │   1. Verify webhook signature (security!)
  │   2. Create Enrollment record
  │   3. Send welcome email
  │   4. Update course enrollmentCount
  │   5. Emit Socket.IO notification to student
  │
  └── Scholar receives payout on schedule
      (Stripe automatically transfers funds minus fees)
```

### 6.4 Subscription Model (Monthly Access)

```
Plans:
├── Free Tier
│   ├── Access to free courses only
│   ├── Basic Q&A participation
│   └── Community features (posts, hadith sharing)
│
├── Student Plan — $9.99/month
│   ├── Access to all self-paced courses
│   ├── 2 live sessions per month
│   ├── Priority Q&A access
│   └── Certificate downloads
│
├── Premium Plan — $19.99/month
│   ├── Everything in Student
│   ├── Unlimited live sessions
│   ├── 1-on-1 scholar sessions (30 min/month)
│   ├── Early access to new courses
│   └── Downloadable resources
│
└── Scholar Plan — Custom pricing
    ├── Custom revenue share
    ├── Featured placement
    └── Marketing support
```

### 6.5 Scholar Salary Model

```javascript
// Scholar Payment Schema
{
  scholar: ObjectId (ref: User),
  type: enum ['course-revenue', 'monthly-stipend', 'session-fee', 'bonus'],
  
  // Revenue share
  courseRevenue: {
    course: ObjectId (ref: Course),
    totalAmount: Number,      // Full course price
    platformFee: Number,      // Platform commission
    scholarAmount: Number,    // Scholar's share
    studentCount: Number      // Enrollments this period
  },
  
  // Fixed salary
  stipend: {
    amount: Number,
    period: String, // 'monthly'
    reason: String  // 'Featured Scholar', 'Content Creator'
  },
  
  // Payment status
  status: enum ['pending', 'processing', 'paid', 'failed'],
  stripeTransferId: String,
  paidAt: Date,
  
  period: { start: Date, end: Date },
  createdAt
}
```

### 6.6 API Endpoints

```
# Payment endpoints
POST   /api/v1/payments/checkout              — Create checkout session
POST   /api/v1/payments/subscription          — Create subscription
DELETE /api/v1/payments/subscription          — Cancel subscription
GET    /api/v1/payments/history               — User's payment history

# Webhook (critical — no auth, signature verified)
POST   /api/v1/webhooks/stripe                — Stripe webhook receiver

# Scholar onboarding
POST   /api/v1/scholars/stripe/connect        — Start Stripe Connect onboarding
GET    /api/v1/scholars/stripe/dashboard      — Redirect to Stripe Express dashboard
GET    /api/v1/scholars/earnings              — Scholar earnings overview
GET    /api/v1/scholars/earnings/details      — Detailed breakdown

# Admin
GET    /api/v1/admin/payments/overview        — Platform revenue dashboard
POST   /api/v1/admin/scholars/:id/stipend     — Set scholar stipend
```

---

## Feature 7: Online Dawah & Q&A

### 7.1 Research Findings

Key platforms analyzed:
- **IslamQA.info**: Largest Islamic Q&A database (300K+ answers), fatwa-based, scholar-reviewed
- **MyMufti App**: Scholar appointment system, public/private Q&A, live sessions with verified scholars
- **Rahmah Dialogue**: Multi-language dawah chats (English, French, Portuguese, Spanish, Tagalog)
- **Ask Sheikh AI**: AI-powered Q&A with human scholar verification

**Academic Research**: "Dawah in the Digital Age" (Talhah Ajmain, 2023) identifies key elements: da'i (messenger), maddah (content), thariqah (method), washilah (medium), mad'u (audience). Digital platforms enable all five elements at scale.

### 7.2 Feature Design

#### A. Live Q&A Sessions

```
Scholar hosts a live Q&A session (via LiveKit):
├── Students submit questions (text form)
├── Questions appear in queue (moderated)
├── Scholar selects question to answer
├── Answer is live-streamed + recorded
├── Audience can upvote questions (priority)
├── Session recording saved with timestamped Q&A index
└── Archive browseable: "What did Scholar X say about topic Y?"
```

#### B. Asynchronous Q&A Forum

```
Student posts a question:
├── Tagged with category (fiqh, aqeedah, family, etc.)
├── Community can upvote/discuss
├── Scholars can post authoritative answers (scholar-verified badge)
├── Multiple scholars can answer (different madhabs)
├── Best answer selected by asker or by votes
├── AI-suggested similar existing Q&As (reduce duplicates)
└── Search engine optimized (public, indexable)
```

#### C. Online Dawah Features

```
Dawah System:
├── Dawah Chat Rooms (themed, multi-language)
│   ├── Rooms for non-Muslims exploring Islam
│   ├── Rooms for new Muslims learning basics
│   ├── Rooms for specific topics (prayer, fasting, etc.)
│   └── Volunteer dawah workers (trained users + scholars)
│
├── Dawah Content Library
│   ├── Curated articles, videos, infographics
│   ├── Multi-language (driven by community translations)
│   ├── Comparison materials (Islam & other beliefs)
│   └── FAQ for common questions about Islam
│
├── Dawah Live Events
│   ├── Scheduled live talks by scholars
│   ├── Interfaith dialogues (moderated)
│   ├── Webinar-style with audience Q&A
│   └── Shareable clips for social media
│
└── Shahada Support
    ├── Private consultation with scholar
    ├── Guided shahada ceremony (live or recorded)
    ├── New Muslim welcome package (courses, community)
    └── Mentorship matching (established Muslim ↔ new Muslim)
```

### 7.3 Q&A Data Model

```javascript
// Question Schema
{
  asker: ObjectId (ref: User),
  title: String,
  body: String (markdown),
  category: enum ['fiqh', 'aqeedah', 'quran', 'hadith', 'family', 'finance', 'dawah', 'general'],
  madhab: enum ['hanafi', 'maliki', 'shafii', 'hanbali', 'any'] (optional preference),
  tags: [String],
  status: enum ['open', 'answered', 'closed'],
  isAnonymous: Boolean,
  
  votes: { up: Number, down: Number },
  viewCount: Number,
  
  answers: [{
    author: ObjectId (ref: User),
    body: String (markdown),
    isScholarAnswer: Boolean, // true if author is verified scholar
    scholarVerification: {
      verifiedBy: ObjectId,
      verifiedAt: Date,
      authenticity: enum ['verified', 'disputed', 'unverified']
    },
    references: [{ type: String, source: String }], // Quran 2:255, Bukhari 1234
    votes: { up: Number, down: Number },
    isAccepted: Boolean,
    createdAt: Date
  }],
  
  createdAt, updatedAt
}
```

---

## Technology Comparison Matrix

| Component | Option A | Option B | Option C | **Recommended** |
|---|---|---|---|---|
| **Course LMS** | Moodle (self-host) | Thinkific API | Custom MongoDB | **Custom MongoDB** |
| **Live Video** | AWS IVS + Chime | 100ms | LiveKit | **LiveKit** |
| **Whiteboard** | Custom Canvas + Socket.IO | Excalidraw (MIT) | tldraw | **tldraw** |
| **Quran Data** | Self-hosted DB only | Al-Quran Cloud API | Quran.com API v4 + MASAQ | **Quran.com v4 + MASAQ** |
| **Payment** | Paddle | PayPal Marketplace | Stripe Connect | **Stripe Connect (Express)** |
| **Roles** | External IAM (Auth0) | Custom RBAC (extend) | Casbin/Oso | **Custom RBAC (extend existing)** |
| **Certification Exam** | Third-party (Mettl) | LMS-embedded | Custom MERN | **Custom MERN** |
| **Q&A** | Stack Overflow clone | Discourse | Custom on existing stack | **Custom (Socket.IO + MongoDB)** |

---

## Recommended Architecture

### System Architecture Diagram

```
                        ┌─────────────────────┐
                        │   React Frontend     │
                        │  (Vite + TS + shadcn)│
                        └────────┬────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────▼─────┐ ┌───▼───┐ ┌─────▼─────┐
              │  Express   │ │LiveKit│ │ Stripe    │
              │  API       │ │(WebRTC│ │ Checkout  │
              │  /api/v1/* │ │Server)│ │ Portal    │
              └─────┬─────┘ └───┬───┘ └─────┬─────┘
                    │           │            │
         ┌──────────┼───────────┼────────────┼──────────┐
         │          │           │            │          │
    ┌────▼───┐ ┌────▼───┐ ┌────▼───┐ ┌─────▼────┐ ┌───▼───┐
    │MongoDB │ │ Redis  │ │  S3    │ │ Stripe   │ │LiveKit│
    │ Atlas  │ │(Cache) │ │(Media) │ │ Connect  │ │ SFU   │
    └────────┘ └────────┘ └────────┘ └──────────┘ └───────┘
```

### New Backend Services

```
backend/
├── controller/
│   ├── courseController.js       — Course CRUD, listing, enrollment
│   ├── classroomController.js    — LiveKit token generation, room management
│   ├── quranTeachingController.js — Quran session sync, word data
│   ├── scholarController.js      — Scholar applications, verification
│   ├── certificationController.js — Exams, certification flow
│   ├── paymentController.js      — Stripe checkout, subscriptions
│   ├── qaController.js           — Q&A CRUD, voting
│   └── dawahController.js        — Dawah rooms, events
├── models/
│   ├── courseSchema.js
│   ├── enrollmentSchema.js
│   ├── quizSchema.js
│   ├── quizAttemptSchema.js
│   ├── scholarApplicationSchema.js
│   ├── certificationSchema.js
│   ├── paymentSchema.js
│   ├── questionSchema.js        — Q&A questions
│   └── dawahRoomSchema.js
├── services/
│   ├── livekitService.js         — LiveKit server SDK integration
│   ├── stripeService.js          — Stripe Connect, checkouts, webhooks
│   ├── quranDataService.js       — Quran.com API proxy + MASAQ data
│   ├── certificationService.js   — Exam logic, grading, proctoring
│   └── notificationService.js    — Extended for course/payment events
├── middlewares/
│   ├── admin.js                  — existing (extend with isScholar, isScholarOrAdmin)
│   └── courseAccess.js           — Enrollment verification middleware
├── routes/
│   ├── courseRoute.js
│   ├── classroomRoute.js
│   ├── quranTeachingRoute.js
│   ├── scholarRoute.js
│   ├── certificationRoute.js
│   ├── paymentRoute.js
│   ├── qaRoute.js
│   └── dawahRoute.js
└── data/
    ├── quranWordData/            — Pre-processed MASAQ dataset (JSON)
    └── certificationTemplates/   — Exam question banks
```

### New Frontend Features

```
frontend/src/features/
├── courses/
│   ├── CoursesPage.tsx           — Browse/discover courses
│   ├── CourseDetailPage.tsx      — Course info, enroll CTA
│   ├── CoursePlayerPage.tsx      — Lesson viewer (video, text, quiz)
│   ├── CourseProgressBar.tsx     — Visual progress indicator
│   ├── CreateCoursePage.tsx      — Scholar: course builder
│   ├── useCourses.ts             — TanStack Query hooks
│   └── components/
│       ├── CourseCard.tsx
│       ├── ModuleSidebar.tsx
│       ├── LessonViewer.tsx
│       └── QuizPlayer.tsx
│
├── classroom/
│   ├── ClassroomPage.tsx         — Full virtual classroom
│   ├── WhiteboardPanel.tsx       — tldraw integration
│   ├── ClassroomControls.tsx     — Mic, cam, share, raise hand
│   ├── ParticipantList.tsx       — Student list with hand-raise
│   ├── ClassroomChat.tsx         — In-session chat
│   └── useClassroom.ts           — LiveKit hooks
│
├── quran-teaching/
│   ├── QuranTeachingPage.tsx     — Synchronized Quran reader
│   ├── WordDetail.tsx            — Word meaning popup
│   ├── PointerOverlay.tsx        — Teacher pointer visualization
│   ├── TajweedHighlighter.tsx    — Tajweed color rules
│   └── useQuranTeaching.ts
│
├── scholar/
│   ├── ScholarDashboard.tsx      — Scholar portal
│   ├── ScholarProfilePage.tsx    — Public scholar profile
│   ├── ApplyScholarPage.tsx      — Scholar application form
│   ├── ScholarBadge.tsx          — Reusable badge component
│   └── useScholar.ts
│
├── certification/
│   ├── CertificationPage.tsx     — Browse available certifications
│   ├── ExamPage.tsx              — Take exam interface
│   ├── CertificateViewer.tsx     — View/download certificate
│   ├── ApplicationTracker.tsx    — Track certification progress
│   └── useCertification.ts
│
├── payments/
│   ├── CheckoutPage.tsx          — Stripe checkout redirect
│   ├── SubscriptionPage.tsx      — Manage subscription
│   ├── PaymentHistory.tsx        — Transaction history
│   ├── ScholarEarnings.tsx       — Scholar revenue dashboard
│   └── usePayments.ts
│
├── qa/
│   ├── QAPage.tsx                — Browse questions
│   ├── QuestionDetailPage.tsx    — Question + answers
│   ├── AskQuestionPage.tsx       — Create question form
│   ├── LiveQASession.tsx         — Live Q&A (integrated with LiveKit)
│   └── useQA.ts
│
└── dawah/
    ├── DawahHubPage.tsx          — Dawah resources & rooms
    ├── DawahChatRoom.tsx         — Live dawah chat
    ├── DawahLibrary.tsx          — Curated content
    └── useDawah.ts
```

---

## Implementation Roadmap

### Phase A: Foundation (Scholar Roles + Payments)

**Priority**: Must be built first — everything else depends on roles and payment infrastructure.

| Task | Layer | Depends On | Effort |
|---|---|---|---|
| A1: Extend user schema with scholar fields | Backend | — | 1 day |
| A2: Add `isScholar` middleware | Backend | A1 | 0.5 day |
| A3: Scholar application API | Backend | A1, A2 | 2 days |
| A4: Scholar application frontend (form + tracker) | Frontend | A3 | 2 days |
| A5: Admin scholar review panel | Frontend | A3 | 2 days |
| A6: Badge display component (reusable) | Frontend | A1 | 1 day |
| A7: Stripe Connect integration (scholar onboarding) | Backend | A1 | 3 days |
| A8: Payment checkout flow | Backend + Frontend | A7 | 3 days |
| A9: Webhook handling + enrollment creation | Backend | A8 | 2 days |
| A10: Scholar earnings dashboard | Frontend | A7 | 2 days |

**Total Phase A**: ~18 days

### Phase B: Course System

| Task | Layer | Depends On | Effort |
|---|---|---|---|
| B1: Course, Enrollment, Quiz models | Backend | A1 | 2 days |
| B2: Course CRUD API (scholar creates courses) | Backend | B1, A2 | 3 days |
| B3: Course enrollment API | Backend | B1, A8 | 2 days |
| B4: Course discovery page (browse, filter, search) | Frontend | B2 | 3 days |
| B5: Course detail page (info, syllabus, enroll CTA) | Frontend | B2 | 2 days |
| B6: Course player (video lessons, text, progress tracking) | Frontend | B3 | 4 days |
| B7: Quiz/assessment player | Frontend | B1 | 3 days |
| B8: Course builder (scholar UI for creating courses) | Frontend | B2 | 5 days |
| B9: Course admin review flow | Backend + Frontend | B2 | 2 days |

**Total Phase B**: ~26 days

### Phase C: Virtual Classroom (LiveKit + Whiteboard)

| Task | Layer | Depends On | Effort |
|---|---|---|---|
| C1: LiveKit server setup (Docker or Cloud) | Infra | — | 1 day |
| C2: LiveKit token generation API | Backend | C1, A2 | 1 day |
| C3: Classroom page (LiveKit React components) | Frontend | C2 | 4 days |
| C4: Screen sharing integration | Frontend | C3 | 1 day |
| C5: tldraw whiteboard panel | Frontend | C3 | 3 days |
| C6: Whiteboard sync via LiveKit data channel | Frontend + Backend | C3, C5 | 2 days |
| C7: Classroom controls (mic, cam, raise hand) | Frontend | C3 | 2 days |
| C8: Session recording (S3 storage) | Backend | C1 | 2 days |
| C9: Integrate classroom into course live sessions | Frontend | B6, C3 | 2 days |

**Total Phase C**: ~18 days

### Phase D: Quran Teaching

| Task | Layer | Depends On | Effort |
|---|---|---|---|
| D1: Import MASAQ dataset + Quran.com API integration | Backend | — | 3 days |
| D2: Quran word data API | Backend | D1 | 2 days |
| D3: Interactive Quran reader component (word-by-word) | Frontend | D2 | 5 days |
| D4: Word detail popup (morphology, multi-lang meaning) | Frontend | D3 | 3 days |
| D5: Pointer synchronization (LiveKit data channel) | Frontend | C3, D3 | 2 days |
| D6: Tajweed highlighting | Frontend | D3 | 2 days |
| D7: Quran teaching session mode (scholar + students) | Frontend | D3, C3 | 3 days |

**Total Phase D**: ~20 days

### Phase E: Certification System

| Task | Layer | Depends On | Effort |
|---|---|---|---|
| E1: Certification + exam models | Backend | A1 | 2 days |
| E2: Certification application API | Backend | E1 | 2 days |
| E3: Exam taking API (timed, proctored-lite) | Backend | E1 | 3 days |
| E4: Proctoring middleware (focus tracking, time anomaly) | Frontend | E3 | 3 days |
| E5: Certification browse page | Frontend | E2 | 2 days |
| E6: Exam player page | Frontend | E3, E4 | 4 days |
| E7: Certificate viewer/download (PDF generation) | Backend + Frontend | E1 | 2 days |
| E8: Scholar review panel for Level 2-3 | Frontend | E2 | 3 days |

**Total Phase E**: ~21 days

### Phase F: Dawah & Q&A

| Task | Layer | Depends On | Effort |
|---|---|---|---|
| F1: Question/Answer models | Backend | A1 | 1 day |
| F2: Q&A CRUD API + voting | Backend | F1 | 3 days |
| F3: Q&A browse + detail pages | Frontend | F2 | 3 days |
| F4: Ask question form | Frontend | F2 | 1 day |
| F5: Live Q&A session (integrated with LiveKit) | Frontend | C3, F1 | 3 days |
| F6: Dawah chat rooms (Socket.IO) | Backend + Frontend | — | 3 days |
| F7: Dawah resource library | Backend + Frontend | — | 2 days |

**Total Phase F**: ~16 days

### Total Estimated Effort: ~119 development days

> This is a **major feature expansion**. Recommend parallel implementation across 2-3 developers, phased delivery with Phase A → B as MVP, then C → D → E → F.

---

## Risk Analysis

| Risk | Impact | Mitigation |
|---|---|---|
| **LiveKit scalability** | High (200+ concurrent users in classroom) | Start with LiveKit Cloud (free tier), move to self-hosted when proven; keep AWS IVS for 1000+ broadcasts |
| **Stripe Connect compliance** | High (KYC requirements for scholars globally) | Use Express accounts (Stripe handles compliance); test in multiple countries early |
| **Quran data accuracy** | Critical (incorrect word meanings = theological issue) | Use only verified sources (Quran.com, MASAQ from Tanzil); scholar review layer for all Quran content |
| **Scholar verification fraud** | High (fake credentials) | Multi-step verification (documents + panel interview + community endorsement); start with manual vetting |
| **Payment disputes** | Medium (refund requests, chargebacks) | Clear refund policy, Stripe's dispute handling, 7-day satisfaction guarantee |
| **Exam cheating** | Medium (certification integrity) | Behavioral proctoring for Level 1-2, camera proctoring + oral exam for Level 3 |
| **Scope creep** | High (9 major features) | Strict phased delivery; ship Phase A+B as MVP first, gather feedback before C-F |
| **Quran.com API rate limits** | Medium | Cache responses in Redis, pre-load word data to local DB, fallback to Tanzil static data |
| **tldraw license cost** | Low | Free with watermark initially; budget $150/year for business license when needed |
| **Multi-timezone scheduling** | Medium | Store all times in UTC, use Luxon/date-fns-tz for display; expose timezone selector in UI |

---

## Security Considerations

| Area | Approach |
|---|---|
| **Payment data** | Never touches our server — Stripe Checkout handles PCI compliance |
| **Scholar credentials** | Encrypted at rest in S3, access-controlled by scholar + admin only |
| **Exam integrity** | Unique question pools per attempt, server-side timer, IP logging |
| **LiveKit rooms** | Token-based access (JWT), room names hashed, auto-expire after session |
| **Quran content** | Read-only from verified sources; no user-submitted modifications to Quran text |
| **Role escalation** | Only admins can change user roles; audit log for all role changes |
| **Webhook verification** | Stripe webhook signatures verified with `stripe.webhooks.constructEvent()` |
| **RBAC** | Middleware chain: `isAuthenticated → isScholar/isAdmin → resource ownership check` |

---

## Environment Variables (New)

```env
# LiveKit
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_URL=wss://your-livekit-server.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_connect_...

# Quran API
QURAN_API_BASE_URL=https://api.quran.com/api/v4

# Course settings
COURSE_COMMISSION_RATE=0.30   # 30% platform commission
MAX_FREE_LIVE_SESSIONS=2      # Per month for free-tier users
```

---

## Sources & References

### Web Research
1. **Islamic EdTech Market**: MadrasaTech 2023 Report — $10B+ by 2027
2. **LMS Market**: eLearning Industry — $37.9B by 2026, AI-driven personalization
3. **Ilmify**: Islamic institution management — Hifz/Nazra tracking, fee collection, student management
4. **Stripe Connect**: Official docs — marketplace payment flows, Express/Custom/Standard accounts
5. **Stripe for Marketplaces (2026)**: Prometora guide — comprehensive Connect implementation patterns
6. **Udemy Instructor Payments**: 70/30 revenue share model, monthly payouts
7. **RBAC Best Practices 2025**: Oso HQ — least privilege, scoped roles, audit trails
8. **IEEE RBAC in Cloud Security**: In-depth analysis of role design patterns
9. **Blockchain credential verification**: IEEE, Nature — future direction for tamper-proof credentials

### GitHub Repositories
10. **LiveKit React SDK**: `@livekit/components-react` — VideoConference, ScreenShare, DataChannel
11. **LiveKit Tutorials**: OpenVidu LiveKit integration guides for React
12. **RTCboard**: `vinitngr/RTCboard` — WebRTC + Node.js + React + Redis collaboration
13. **React-WebRTC-MultiCamScreenShare**: `abrajByte/React-WebRTC-MultiCamScreenShare` — multi-camera WebRTC
14. **SyncBoard**: `priyeshpriyam/real-time-collaborative-whiteboard` — React + Socket.IO whiteboard
15. **gospace**: `parbhatia/gospace` — video + audio + canvas via WebRTC + Socket.IO
16. **PEAMT**: `YashChavanWeb/PEAMT` — MERN proctored exam system
17. **SecureProctor**: `Krrish0902/SecureProctor` — behavioral proctoring (no camera)
18. **tldraw**: `tldraw/tldraw` — React infinite canvas SDK, collaborative whiteboard

### Quran Data Sources
19. **Quran.com API v4**: Word-by-word data, 100+ translations, 50+ reciters
20. **MASAQ Dataset**: Mendeley Data — 131K morphological + 123K syntactic annotations, CC BY 3.0
21. **Quranic Arabic Corpus**: corpus.quran.com — word-by-word grammar + syntax trees
22. **al-quran-api**: `raz0229/al-quran-api` — RESTful Quran API with word search
23. **Tanzil.net**: Verified Quran text (Uthmani + Simple), multiple formats

### Industry Platforms Analyzed
24. **EasyQuran.ai**: Word-by-word, AI study tools, 16+ features
25. **QuranKeys**: Word-by-word learning, smart recitation, progress tracking
26. **IslamQA.info**: 300K+ Q&A database — gold standard for Islamic Q&A
27. **MyMufti App**: Scholar appointments, live Q&A, certified scholar marketplace
28. **Rahmah Dialogue**: Multi-language dawah platform (5 languages, Africa/Latin America/Asia)
29. **Ask Sheikh AI**: AI-powered Islamic Q&A + community features
30. **Bayyinah TV**: Premium Islamic education (Quran Arabic, Tafseer courses)

### Video Platform Comparisons
31. **LiveKit vs 100ms vs Daily vs Agora**: VideoSDK, BuildMVPFast, GetStream — comprehensive comparisons
32. **Building Video Chat with LiveKit (2025)**: Oleh Teslenko — Slack-like video in 3 days with Node.js
33. **tldraw vs Excalidraw**: Dev community — React whiteboard component comparison
34. **Dawah in Digital Age (2023)**: Talhah Ajmain (UTM) — social media for Islamic teachings

---

## Conclusion

This research covers all 9 requested features with concrete technology choices, data models, and implementation plans aligned with DeenVerse's existing architecture. The recommended approach is:

1. **Build incrementally** — Scholar roles + Payments first (foundation), then Courses, then Classroom, then everything else
2. **Leverage existing stack** — MongoDB, Express, React, Socket.IO are sufficient for 90% of this; only new dependencies are LiveKit (video), tldraw (whiteboard), and Stripe (payments)
3. **Keep AWS IVS** for large broadcasts, add LiveKit for interactive classrooms
4. **Use verified Quran data sources** (Quran.com API + MASAQ) — never build Quran content from scratch
5. **Custom over third-party** for LMS, certification, and Q&A — full control over Islamic-specific features and integration with DeenVerse's social graph

**Next Step**: Confirm this research direction, then create implementation tasks in TICK.md and begin with Phase A (Scholar Roles + Payments).
