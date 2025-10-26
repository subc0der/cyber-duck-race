# Lessons Learned - Cyber Duck Race

This document captures incremental lessons, code review findings, and patterns discovered during development. For comprehensive coding standards, see `../coding-standards.md`.

---

## Code Review Lessons (October 2025)

### GitHub Copilot PR #4 Review (Oct 5, 2025)

#### Issue: Semantic Misuse of Constants
**Finding**: Using `UI_CONSTANTS.CANVAS_ORIGIN` (value: 0) for non-canvas-related purposes like array indices and Math.max() operations.

**Examples Found**:
```javascript
// ❌ WRONG - CANVAS_ORIGIN misused
const file = e.target.files[UI_CONSTANTS.CANVAS_ORIGIN];
const min = Math.max(UI_CONSTANTS.CANVAS_ORIGIN, value);
progress.toFixed(UI_CONSTANTS.CANVAS_ORIGIN);

// ✅ CORRECT - Use literal 0 or appropriate constant
const file = e.target.files[0];
const min = Math.max(0, value);
progress.toFixed(0);
```

**Lesson**: Constants should only be used when semantically meaningful to the context. Don't reuse a constant just because it has the right numeric value.

---

#### Issue: Hardcoded Derived Values
**Finding**: `MAX_FILE_SIZE_BYTES` was hardcoded as `150 * 1024 * 1024` separately from `MAX_FILE_SIZE_MB: 150`, creating potential for value drift.

**Solution**:
```javascript
// ✅ DRY - Single source of truth
const MAX_FILE_SIZE_MB = 150;

export const AUDIO_CONSTANTS = {
  MAX_FILE_SIZE_MB: MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES: MAX_FILE_SIZE_MB * 1024 * 1024,
};
```

**Lesson**: When constants are mathematically related, derive them from a single source rather than duplicating values.

---

#### Issue: Missing Input Validation
**Finding**: `initializeDucks(participants)` didn't validate the participants array structure before mapping over it.

**Risk**: Runtime errors if invalid data passed (e.g., `participants.map(p => p.name)` when p doesn't have a name property).

**Solution**:
```javascript
const validParticipants = Array.isArray(participants) &&
  participants.length > 0 &&
  participants.every(p => p && typeof p === 'object' && typeof p.name === 'string');

const duckNames = validParticipants
  ? participants.map(p => p.name)
  : DUCK_CONSTANTS.DUCK_NAMES;
```

**Lesson**: Always validate function parameters, especially arrays and objects with expected structures. Provide sensible fallbacks.

---

#### Issue: Poor Error UX with alert()
**Finding**: Used `alert()` for file upload errors, which:
- Blocks user interaction
- Doesn't match app's cyberpunk theme
- Poor accessibility

**Solution**: Inline error messages with:
- State management (`const [errorMessage, setErrorMessage] = useState('')`)
- Auto-dismiss timeout (5 seconds)
- Themed styling matching app design
- Smooth animations (fadeIn)

**Lesson**: Never use `alert()` for user-facing errors. Always implement themed, inline error displays.

---

### GitHub Copilot PR #4 Follow-up Review (Oct 5, 2025)

#### Issue: Incomplete Input Validation
**Finding**: Initial validation in `racePhysics.js` checked basic structure but missed edge cases:
- Arrays passed as objects (arrays are objects in JS)
- Missing property checks using hasOwnProperty
- Empty string names after trimming

**Enhanced Solution**:
```javascript
const validParticipants = Array.isArray(participants) &&
  participants.length > 0 &&
  participants.every(p =>
    p &&
    typeof p === 'object' &&
    !Array.isArray(p) &&  // Ensure not an array
    Object.prototype.hasOwnProperty.call(p, 'name') &&  // Safe property check
    typeof p.name === 'string' &&
    p.name.trim().length > 0  // Non-empty after trim
  );
```

**Lesson**: Comprehensive validation requires checking:
1. Array type explicitly (`!Array.isArray()` for object checks)
2. Safe property existence (`Object.prototype.hasOwnProperty.call()`)
3. Value validity (non-empty strings, trimmed)

---

#### Issue: Missing ARIA Labels for Accessibility
**Finding**: Buttons with only emoji or icon content lacked `aria-label` attributes, making them inaccessible to screen readers.

**Examples Fixed**:
```javascript
// ❌ BEFORE - Icon-only button, no context for screen readers
<button onClick={handleClose}>×</button>

// ✅ AFTER - Descriptive aria-label
<button onClick={handleClose} aria-label="Close audio controls panel">×</button>

// ❌ BEFORE - Emoji button, unclear purpose
<button onClick={handlePlayPause}>{isPlaying ? '⏸️' : '▶️'}</button>

// ✅ AFTER - Dynamic aria-label matching state
<button
  onClick={handlePlayPause}
  aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
>
  {isPlaying ? '⏸️' : '▶️'}
</button>
```

**Lesson**:
- **All buttons need aria-labels**, especially:
  - Icon/emoji-only buttons (×, 🔊, ▶️, ⏸️, etc.)
  - Buttons with dynamic states (play/pause, on/off)
- **Make aria-labels descriptive**: "Close audio controls panel" not just "Close"
- **Use dynamic aria-labels** for state-dependent buttons

**Files Updated**:
- EventBanner.jsx: 5 buttons (toggle, close, play/pause, stop, repeat)
- ControlPanel.jsx: 2 buttons (start race, reset)
- ParticipantManager.jsx: 2 buttons (add, clear all)
- WinnerModal.jsx: 1 button (close)

---

## Quick Reference

### When to Create New Context Files
- **File exceeds 10KB**: Split into logical parts or create continuation file
- **New major topic**: Create dedicated file (e.g., `api-patterns.md`, `performance-tips.md`)
- **Ongoing learnings**: Use this file (`lessons-learned.md`)

### File Size Status (as of Oct 5, 2025)
- coding-standards.md: 13KB (main reference, stable)
- css-standards.md: 1.9KB
- context/custom-duck-assets.md: 6.2KB
- context/project-guidelines.md: 6.8KB
- context/lessons-learned.md: This file (new)

---

## Template for Future Lessons

### Issue: [Brief Description]
**Finding**: [What was discovered]

**Problem**: [Why it's an issue]

**Solution**:
```javascript
// Code example
```

**Lesson**: [Key takeaway]

---

**Note**: When this file approaches 10KB, create `lessons-learned-2.md` and reference it here.
