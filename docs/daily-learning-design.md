# Daily Learning Feature - Design Documentation

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
