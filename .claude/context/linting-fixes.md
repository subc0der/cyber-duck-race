# ESLint Issues Fixed - 2025-10-25

## Summary
Fixed all ESLint errors (7 total: 1 error, 6 warnings) found in the source code and configured proper ignore patterns.

---

## Issues Fixed

### 1. ErrorBoundary.jsx - Unused Parameter (Line 9)
**Issue:** `'error' is defined but never used`

**Fix:** Prefixed parameter with underscore to indicate intentional non-use
```javascript
// Before
static getDerivedStateFromError(error) {
  return { hasError: true };
}

// After
static getDerivedStateFromError(_error) {
  return { hasError: true };
}
```

**Lesson:** When a function parameter is required by the API/interface but not used in the implementation, prefix it with underscore (`_`) to satisfy ESLint's `no-unused-vars` rule.

---

### 2. ErrorBoundary.jsx - Undefined Global (Line 73)
**Issue:** `'process' is not defined`

**Fix:** Replaced Node.js `process.env` with Vite's `import.meta.env`
```javascript
// Before
{process.env.NODE_ENV === 'development' && this.state.error && (

// After
{import.meta.env.MODE === 'development' && this.state.error && (
```

**Lesson:** In Vite projects, use `import.meta.env.MODE` instead of `process.env.NODE_ENV` for environment checking. Vite doesn't provide the `process` global in browser code.

---

### 3. Leaderboard.jsx - Unused Import (Line 2)
**Issue:** `'UI_CONSTANTS' is defined but never used`

**Fix:** Removed unused import
```javascript
// Before
import { UI_CONSTANTS, RACE_CONSTANTS } from '../utils/constants';

// After
import { RACE_CONSTANTS } from '../utils/constants';
```

**Lesson:** Regularly check for and remove unused imports to keep code clean and reduce bundle size.

---

### 4. RaceTrack.jsx - Missing Hook Dependencies (Lines 96, 144)
**Issue:** `React Hook useEffect has a missing dependency: 'drawDucks'`

**Fix:** Wrapped `drawDucks` in `useCallback` and added it to dependency arrays
```javascript
// Step 1: Import useCallback
import { useEffect, useRef, useState, useCallback } from 'react';

// Step 2: Wrap function in useCallback
const drawDucks = useCallback((ctx, duckList, currentTime = null) => {
  // ... function implementation
}, []); // Empty deps since all values used are from parameters or constants

// Step 3: Add to dependency arrays
useEffect(() => {
  // ... code that uses drawDucks
}, [ducks, isRacing, drawDucks]); // Added drawDucks

useEffect(() => {
  // ... animation code that uses drawDucks
}, [isRacing, onRaceEnd, drawDucks]); // Added drawDucks
```

**Lesson:** Functions used inside `useEffect` should either be:
1. Defined inside the effect
2. Wrapped in `useCallback` and included in dependencies
3. Defined outside the component (if they don't depend on props/state)

---

### 5. racePhysics.js - Unused Parameter (Line 221)
**Issue:** `'progressPercent' is defined but never used`

**Fix:** Prefixed parameter with underscore
```javascript
// Before
calculateSpeedAdjustment(duck, progressPercent) {

// After
calculateSpeedAdjustment(duck, _progressPercent) {
```

**Lesson:** Same as issue #1 - use underscore prefix for required but unused parameters.

---

### 6. Created .eslintignore
**Issue:** ESLint was scanning build output (`dist/`) and causing hundreds of false positives

**Fix:** Created `.eslintignore` file
```
# Build output
dist/
build/

# Dependencies
node_modules/

# Environment files
.env
.env.local
.env.*.local

# Generated files
coverage/

# Other
gemini/
nul
```

**Lesson:** Always exclude build output, dependencies, and generated files from linting. Only lint source code.

---

### 7. RaceContext.jsx - Fast Refresh Warning (Line 6)
**Warning:** `Fast refresh only works when a file only exports components`

**Fix:** Added ESLint disable comment for this specific rule
```javascript
// eslint-disable-next-line react-refresh/only-export-components
export const useRace = () => {
```

**Explanation:** The file exports both `useRace` hook and `RaceProvider` component. This is a standard pattern in React context files. The warning is about Fast Refresh (HMR) during development, not code quality. Suppressing this warning is appropriate for context files that export both hooks and components.

**Alternative (not implemented):** Could split into two files, but the current pattern is widely accepted and used in production applications.

---

## Best Practices for Future Development

### 1. Unused Variables
- **Function parameters:** Prefix with `_` if required but unused
- **Imports:** Remove if not used
- **Variables:** Remove or use them

### 2. Environment Variables
- **Vite projects:** Use `import.meta.env.MODE` / `import.meta.env.PROD` / `import.meta.env.DEV`
- **Node.js only:** Use `process.env.NODE_ENV`

### 3. React Hooks Dependencies
- **Functions in effects:** Wrap in `useCallback` or define inside effect
- **Always:** Include all dependencies in array
- **Exception:** Can disable rule with `// eslint-disable-next-line react-hooks/exhaustive-deps` only when absolutely necessary

### 4. ESLint Configuration
- **Always:** Create `.eslintignore` for build outputs
- **Always:** Run `npm run lint` before committing
- **Fix:** Address errors immediately
- **Review:** Warnings should be reviewed but don't block commits

### 5. Import Management
- **Remove:** Unused imports immediately
- **Organize:** Group imports (React, libraries, local)
- **Auto-fix:** Many IDEs can auto-remove unused imports on save

---

## Verification Command
```bash
npm run lint
```

**Expected Result:**
```
(No output - all checks pass)
Exit code: 0
```

All ESLint errors and warnings have been resolved.

---

## Files Modified in This Fix
1. `src/components/ErrorBoundary.jsx` - Fixed unused param and process.env
2. `src/components/Leaderboard.jsx` - Removed unused import
3. `src/components/RaceTrack.jsx` - Fixed hook dependencies
4. `src/utils/racePhysics.js` - Fixed unused param
5. `src/contexts/RaceContext.jsx` - Suppressed fast-refresh warning
6. `.eslintignore` - Created (NEW FILE)
7. `.claude/context/linting-fixes.md` - Documentation (NEW FILE)
