# Daily Learning Feature - Design Documentation

> **Status**: ✅ **Core Feature Implemented** — Dynamic Quran data live, streaks and public reflections pending (March 2026)

---

## 🟢 Implementation Progress (Updated March 2026)

### Frontend — ✅ Done
| File | Status | Notes |
|---|---|---|
| `frontend/src/features/daily-learning/DailyLearningPage.tsx` | ✅ Done | Split view layout (Layout 4) |
| `frontend/src/features/daily-learning/DailyLearningTabs.tsx` | ✅ Done | Ayah / Ruku / Juzz tabs |
| `frontend/src/features/daily-learning/ReflectionSplitView.tsx` | ✅ Done | Arabic + translation + action item |
| `frontend/src/features/daily-learning/useDailyLearning.ts` | ✅ Done | TanStack Query hook |

### Backend — ✅ Done (dynamic data via AlQuran Cloud)
| File | Status | Notes |
|---|---|---|
| `backend/models/DailyLearning.js` | ✅ Done | Reflection schema |
| `backend/controller/dailyLearningController.js` | ✅ Done | Dynamic content via `quranService.js` — **no longer hardcoded** |
| `backend/routes/dailyLearningRoute.js` | ✅ Done | `GET /` + `POST /reflection` |
| `backend/services/quranService.js` | ✅ Done | AlQuran Cloud API + `quran-meta/hafs` + Redis 7-day cache |
| `backend/services/actionItemService.js` | ✅ Done | Contextual action items per verse theme |

> **Note**: The "Para" tab originally planned (4th type) is not implemented — Para = Juzz in the data, so Juzz tab covers this. Removing Para tab from the UI or surfacing it as an alias of Juzz is the recommended approach.

### What Remains
- [ ] **Streaks**: `streakService.js` exists in `backend/services/` but is not wired into daily learning completion flow
- [ ] **Public community reflections**: `DailyLearning.js` model has `isPrivate` field but sharing reflections to the feed is not triggered from this page
- [ ] **Para tab**: Could be added as a UI alias of Juzz if needed for South Asian audiences

---

## Overview
The "Daily Learning" feature is designed to make Quran learning engaging, consistent, and practical for daily life. Based on the selected **Layout 4: The Split View**, this feature presents the user with a daily Ayah, Ruku, Juzz, or Para alongside practical context and actions to apply in real life.

## User Experience (UX) Flow
1. **Entry Point**: A new "Daily Learning" tab in the bottom navigation bar.
2. **Main View**:
   - Displays the selected learning unit (Ayah/Ruku/Juzz/Para) configuration.
   - The screen is split into two panels (on desktop) or stacks (on mobile).
   - **Left Panel (The Source)**: Displays the Arabic text, English translation, and Surah reference.
   - **Right Panel (Practical Context & Action)**: Displays a short tafseer/context ("Finding true peace") and an actionable item (e.g., "Set a timer for 2 minutes...").
3. **Configuration**: Users can toggle between "Ayah", "Ruku", "Juzz", and "Para" using tabs at the top of the view. The content updates accordingly.
4. **Completion**: Users click the "I completed this reflection" button to mark the daily unit as done. This saves the progress to their account.

## Technical Boilerplate Architecture

### Frontend Layer
Located in `frontend/src/features/daily-learning`:
- `components/DailyLearningTabs.tsx`: Renders the configuration tabs (Ayah, Ruku, Juzz, Para) and handles state changes.
- `components/ReflectionSplitView.tsx`: The main UI component rendering the Split View layout (The Source + Practical Context).
- `index.ts`: Module exports.

### Backend Layer
Located in `backend/`:
- **Model**: `models/DailyLearning.js`
  - Defines the Mongoose schema for user reflections.
  - Fields include `user` (ref), `learningType` (enum: ayah, ruku, juzz, para), `referenceId`, `reflectionText`, `isCompleted`, and `isPrivate`.
- **Controller**: `controller/dailyLearningController.js`
  - `getDailyLearningContent`: Fetches metadata and content for the requested daily unit type.
  - `saveUserReflection`: Persists user reflection submissions and marks the daily learning as completed.
- **Routes**: `routes/dailyLearningRoute.js`
  - `GET /`: Retrieves the current daily learning content.
  - `POST /reflection`: Submits a reflection.

## Extensibility
The design is modular so that additional features like public community reflections or streaks tracking can be stitched onto the `DailyLearning` backend model in the future.
