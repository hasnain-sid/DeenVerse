---
description: Write unit and integration tests for a module following project test patterns
---

# 🧪 Add Tests Workflow

Write comprehensive tests for the specified module or feature.

## Step 1: Understand the Module
* Read the source code of the target module thoroughly.
* Identify all public functions, components, hooks, and API endpoints.
* Map out all code paths, branches, and edge cases.
* Check existing test files for project testing patterns and conventions.

## Step 2: Identify the Testing Framework
* Check `package.json` for the testing framework in use (Vitest, Jest, React Testing Library, etc.).
* If no testing framework exists, recommend and set up the most appropriate one.
* Follow the existing test file naming convention (e.g., `*.test.ts`, `*.spec.ts`).

## Step 3: Plan Test Coverage
For each function/component, identify:
- **Happy path** — Normal expected usage
- **Edge cases** — Empty inputs, boundary values, large data
- **Error cases** — Invalid inputs, network failures, missing data
- **State transitions** — Loading → success, loading → error

### Frontend Components
- Renders correctly with default props
- Renders correctly with various prop combinations
- User interactions trigger expected behavior (clicks, inputs)
- Loading, empty, and error states display correctly
- Accessibility (keyboard navigation, aria labels)

### Backend/API
- Returns correct response for valid requests
- Returns appropriate error codes for invalid requests
- Handles authentication/authorization correctly
- Validates input data properly

## Step 4: Write Tests
* Follow the **Arrange-Act-Assert** pattern.
* Use descriptive test names: `it('should display error message when API call fails')`.
* Group related tests with `describe` blocks.
* Mock external dependencies (APIs, databases, third-party libraries).
* Keep tests independent — each test should run in isolation.

## Step 5: Run & Verify
// turbo
* Run the test suite and ensure all new tests pass.
* Check for any flaky tests (run multiple times if needed).
* Verify no existing tests were broken.
* Report test coverage summary.
