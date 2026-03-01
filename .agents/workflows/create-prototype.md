---
description: Create a frontend prototype following senior developer best practices
---

# 🚀 Prototype Creation Workflow

When requested to create a prototype, evaluate the current scenario and follow this structured approach to ensure high-quality, maintainable, and isolated prototype development. 

## Step 1: Evaluate and Choose the Best Approach
* **Throwaway Prototypes (Quick UI/UX validation):** If the goal is just to quickly visualize a concept without worrying about the existing app's architecture, create an isolated `HTML/CSS/JS` file in a dedicated `prototypes` folder at the root of the project or the feature directory.
* **Evolutionary Prototypes (Intended for Production later):** If the prototype is likely to evolve into a real feature, build it using the core tech stack (React, Next.js, etc.). Isolate these components in a specific `prototypes/` subdirectory within the relevant feature folder (e.g., `frontend/src/features/<feature-name>/prototypes`).

## Step 2: Establish the Prototype Environment
1. **Check for Prototype Directory:** 
   * Check if a `prototypes` directory exists in the targeted area.
   * If it doesn't exist, create it. (e.g., `mkdir -p frontend/src/features/quran/prototypes`)
2. **Setup Integration:**
   * **Option A (Isolated File):** Create a standalone file (e.g., `prototype-v1.html` or `PrototypeV1.tsx`).
   * **Option B (Toggleable/Integrated):** The preferred senior approach. Integrate it directly into the application but hide it behind a development route (like `/dev/prototypes/<name>`) or a UI toggle (feature flag). This allows stakeholders to test it within the context of the running application without affecting live users.

## Step 3: Strictly Frontend & Mocked Data
* **No Backend Implementation:** Do not create database schemas, API routes, or backend controllers for a prototype unless explicitly requested.
* **Data Mocking Strategy:** 
  1. Create a `mockData.ts` or `mockData.json` file specifically for the prototype.
  2. Implement simulated network latency using `setTimeout` wrapped in Promises to ensure loading states (skeletons, spinners) are adequately tested and visualized.
  3. Keep the mocked data robust enough to test edge cases (empty states, very long text strings, error states).

## Step 4: Styling & Polish
* Ensure the prototype looks premium and interactive. Add realistic hover states, transitions, and micro-animations to give the true "feel" of the final product. 
* Avoid "placeholder" aesthetics. A prototype should wow the stakeholder and provide a clear vision of the end goal.
* Ensure the prototype design is fully responsive and mobile-friendly.

---

## Step 5: Update Feature Board
* Add the prototype to `.agents/feature-board.md`:
  - Feature name → row in Active Features table
  - Frontend: 🔵 (prototype, not production)
  - Backend: `—` (not applicable for prototypes)
  - Notes: "Prototype only — uses mock data"
* This ensures other agents know this feature exists and has a UI direction but NO backend.

---

**Summary for Agent Execution:**
When the user says "Create a prototype for X":
1. Check `.agents/feature-board.md` — is this feature already tracked?
2. Read the current architecture.
3. Determine if it should be an isolated HTML file or an integrated React/Frontend component behind a dev route.
4. Create the `prototypes` folder if missing.
5. Build the UI (ensure it is responsive and mobile-friendly).
6. Create mock data (no backend code).
7. Update the feature board.
8. Verify and polish the visual aesthetics.
