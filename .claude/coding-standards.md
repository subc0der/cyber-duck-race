# Coding Standards - Cyber Duck Race

This document outlines coding standards for the project to maintain code quality and pass automated reviews on the first attempt.

---

## 1. Constants and Magic Numbers

### Rule: NO MAGIC NUMBERS
**Never use hardcoded numeric or string values directly in code.** All values should be extracted to the `constants.js` file.

#### ✅ Correct Pattern
```javascript
// In src/utils/constants.js
export const UI_CONSTANTS = {
  MAX_LEADERBOARD_ENTRIES: 10,
  RANK_FIRST_PLACE: 0,
  CANVAS_WIDTH: 800,
};

// In component
import { UI_CONSTANTS } from '../utils/constants';
const maxEntries = UI_CONSTANTS.MAX_LEADERBOARD_ENTRIES;
```

#### ❌ Incorrect Pattern
```javascript
// WRONG: Magic numbers hardcoded
const maxEntries = 10;
if (rank === 0) { /* first place */ }
canvas.width = 800;
```

### What Qualifies as a Magic Number?
- **Numeric literals**: `0`, `1`, `10`, `800`, `0.5`, etc.
- **String literals**: URLs, file paths, messages
- **Boolean conditions**: Threshold values, limits
- **Configuration values**: Timeouts, intervals, sizes

### Exceptions - When Plain Numbers Are Better
Only use plain numbers in these specific cases:
- **Array indices**: `array[0]`, `array[1]` - NOT `array[FIRST_INDEX]`
- **Loop counters**: `i++`, `i < length` - NOT `i += INCREMENT_BY_ONE`
- **toFixed/toPrecision**: `value.toFixed(0)`, `value.toFixed(2)` - NOT `value.toFixed(ZERO_DECIMALS)`
- **Math operations**: `Math.max(0, value)`, `Math.min(1, value)` when 0/1 are the natural min/max
- **Boolean/null checks**: `if (x === 0)`, `if (x === null)` - NOT `if (x === ZERO_VALUE)`
- **Mathematical constants**: `Math.PI * 2`, `Math.sqrt(2)`

### ⚠️ CRITICAL: Use Constants ONLY When Semantically Meaningful
**DON'T** reuse a constant just because it has the same numeric value!

#### ❌ WRONG - Semantic Mismatch
```javascript
// BAD: CANVAS_ORIGIN means "canvas coordinate (0,0)", not "first array index"
const file = e.target.files[UI_CONSTANTS.CANVAS_ORIGIN];  // ❌ WRONG
const min = Math.max(UI_CONSTANTS.CANVAS_ORIGIN, value);   // ❌ WRONG
progress.toFixed(UI_CONSTANTS.CANVAS_ORIGIN);              // ❌ WRONG
```

#### ✅ CORRECT - Right Tool for the Job
```javascript
// GOOD: Plain 0 when it's just a number
const file = e.target.files[0];           // ✅ First file
const min = Math.max(0, value);           // ✅ Minimum value
progress.toFixed(0);                       // ✅ Zero decimal places

// GOOD: CANVAS_ORIGIN when it means canvas coordinates
ctx.clearRect(UI_CONSTANTS.CANVAS_ORIGIN, UI_CONSTANTS.CANVAS_ORIGIN, w, h);  // ✅ Canvas origin point
ctx.createLinearGradient(0, 0, 0, height); // ✅ or just use 0 directly
```

---

## 2. File Paths and URLs

### Rule: NO HARDCODED FILE PATHS
**Never hardcode file paths or URLs.** Store them in constants.

#### ✅ Correct Pattern
```javascript
// In src/utils/constants.js
export const VISUAL_CONSTANTS = {
  BACKGROUND_IMAGE_PATH: '/subcoder/BG00.jpg',
};

// In component
img.src = VISUAL_CONSTANTS.BACKGROUND_IMAGE_PATH;
```

#### ❌ Incorrect Pattern
```javascript
// WRONG: Hardcoded path
img.src = '/subcoder/BG00.jpg';
fetch('/api/data.json');
```

### File Path Categories
Add to appropriate constant groups:
- **Images**: `VISUAL_CONSTANTS` or `ASSET_CONSTANTS`
- **API endpoints**: `API_CONSTANTS`
- **Audio files**: `AUDIO_CONSTANTS`
- **Data files**: `DATA_CONSTANTS`

---

## 3. Image Loading Best Practices

### Rule: ALWAYS HANDLE IMAGE LOAD ERRORS
When loading images dynamically, always include error handling.

#### ✅ Correct Pattern
```javascript
const img = new Image();
img.onload = () => {
  imageRef.current = img;
};
img.onerror = () => {
  console.warn('Failed to load image, using fallback');
  imageRef.current = null;
};
img.src = CONSTANTS.IMAGE_PATH;
```

#### ❌ Incorrect Pattern
```javascript
// WRONG: No error handling
const img = new Image();
img.src = '/path/to/image.jpg';
imageRef.current = img;
```

### Image Validation
Always check both `complete` AND `naturalWidth` to verify successful load:

```javascript
if (img && img.complete && img.naturalWidth > 0) {
  // Image loaded successfully
  ctx.drawImage(img, x, y);
} else {
  // Use fallback
}
```

---

## 4. Error Messages and Logging

### Rule: USE PROPER GRAMMAR
All console messages must use proper English grammar.

#### ✅ Correct
```javascript
console.warn('Crypto API is unavailable');
console.error('Failed to load background image');
```

#### ❌ Incorrect
```javascript
console.warn('Crypto API unavailable'); // Missing verb
console.error('Image load fail'); // Incomplete sentence
```

---

## 5. Component Cleanup

### Rule: REMOVE EMPTY CLEANUP FUNCTIONS
Don't include empty cleanup functions in `useEffect` hooks.

#### ✅ Correct Pattern
```javascript
// If no cleanup needed, don't include return statement
useEffect(() => {
  img.src = CONSTANTS.IMAGE_PATH;
}, []);

// If cleanup IS needed, implement it properly
useEffect(() => {
  const controller = new AbortController();
  fetchData(controller.signal);

  return () => {
    controller.abort();
  };
}, []);
```

#### ❌ Incorrect Pattern
```javascript
// WRONG: Empty cleanup function
useEffect(() => {
  img.src = CONSTANTS.IMAGE_PATH;

  return () => {
    // No cleanup necessary
  };
}, []);
```

---

## 6. Function Return Values

### Rule: SIMPLIFY LOGIC, AVOID REDUNDANT CHECKS
When a function returns a value, use it directly instead of conditional assignment.

#### ✅ Correct
```javascript
offset = calculateOffset(ctx, offset);
```

#### ❌ Incorrect
```javascript
// WRONG: Redundant conditional
const newOffset = calculateOffset(ctx, offset);
if (newOffset === 0) {
  offset = 0;
}
```

---

## 7. Browser Compatibility

### CSS Gradients
- Always provide fallback `color` before gradient text effects
- See `css-standards.md` for details

### Web APIs
- Check for API availability before use
- Provide fallbacks for unsupported features
```javascript
if (window.crypto && window.crypto.getRandomValues) {
  // Use crypto API
} else {
  console.warn('Crypto API is unavailable, using Math.random()');
  // Use fallback
}
```

---

## 8. Code Organization

### Constants File Structure
Group related constants together:
```javascript
export const RACE_CONSTANTS = { /* race mechanics */ };
export const VISUAL_CONSTANTS = { /* rendering, assets */ };
export const UI_CONSTANTS = { /* UI behavior, layouts */ };
export const AUDIO_CONSTANTS = { /* sound files, volumes */ };
export const THEME_CONSTANTS = { /* colors, shadows */ };
```

### Constant Naming
- Use `SCREAMING_SNAKE_CASE` for constant names
- Be descriptive: `MAX_LEADERBOARD_ENTRIES` not `MAX_ENTRIES`
- Group by category: `DUCK_MIN_Y`, `DUCK_MAX_Y`, `DUCK_SPACING`

---

## 9. Comments

### When to Comment
- **DO**: Explain WHY, not WHAT
- **DO**: Document non-obvious constants
- **DO**: Mark fallbacks and browser compatibility code
- **DON'T**: State the obvious

#### ✅ Good Comments
```javascript
// Fallback for browsers without background-clip support
color: #00ffff;

// Reset offset when image scrolls past full width
if (offset <= -scaledWidth) return 0;
```

#### ❌ Bad Comments
```javascript
// Set color to cyan
color: #00ffff;

// Check if offset is less than negative scaled width
if (offset <= -scaledWidth) return 0;
```

---

## 10. Quick Checklist Before Committing

Before creating a PR, verify:

- [ ] No magic numbers - all values in `constants.js`
- [ ] Constants used semantically (not `CANVAS_ORIGIN` for array index)
- [ ] No hardcoded file paths - all paths in constants
- [ ] Derived constants computed from source (e.g., `MB * 1024 * 1024`)
- [ ] Image loading has error handlers (`onload`/`onerror`)
- [ ] Image validation uses `img.complete && img.naturalWidth > 0`
- [ ] Function parameters validated (especially arrays/objects)
- [ ] All console messages use proper grammar
- [ ] No `alert()` - use inline error messages instead
- [ ] No empty cleanup functions in `useEffect`
- [ ] CSS gradient text has fallback `color` property
- [ ] All constants use descriptive names
- [ ] Code follows existing patterns in the project

---

## 11. Derived Constants (DRY Principle)

### Rule: DERIVE CONSTANTS FROM SINGLE SOURCE
When one constant is mathematically derived from another, compute it rather than hardcoding both values.

#### ✅ Correct Pattern
```javascript
// Single source of truth for file size limit
const MAX_FILE_SIZE_MB = 150;

export const AUDIO_CONSTANTS = {
  MAX_FILE_SIZE_MB: MAX_FILE_SIZE_MB,
  // Derived from MAX_FILE_SIZE_MB - always in sync
  MAX_FILE_SIZE_BYTES: MAX_FILE_SIZE_MB * 1024 * 1024,
};
```

#### ❌ Incorrect Pattern
```javascript
// WRONG: Same value hardcoded twice - can get out of sync
export const AUDIO_CONSTANTS = {
  MAX_FILE_SIZE_MB: 150,
  MAX_FILE_SIZE_BYTES: 150 * 1024 * 1024, // Hardcoded duplicate
};
```

### Benefits
- **Maintainability**: Change one value updates all derived values
- **Consistency**: No risk of values getting out of sync
- **Clarity**: Shows the relationship between constants

---

## 12. Input Validation

### Rule: VALIDATE FUNCTION PARAMETERS
Always validate input parameters, especially for arrays and objects with expected structure.

#### ✅ Correct Pattern
```javascript
initializeDucks(participants = []) {
  // Input validation: ensure participants is an array of objects with a 'name' property
  const validParticipants = Array.isArray(participants) &&
    participants.length > 0 &&
    participants.every(p => p && typeof p === 'object' && typeof p.name === 'string');

  const duckNames = validParticipants
    ? participants.map(p => p.name)
    : DUCK_CONSTANTS.DUCK_NAMES;

  // Continue with validated data...
}
```

#### ❌ Incorrect Pattern
```javascript
// WRONG: No validation - will crash if participants is invalid
initializeDucks(participants = []) {
  const duckNames = participants.length > 0
    ? participants.map(p => p.name) // Runtime error if p.name doesn't exist
    : DUCK_CONSTANTS.DUCK_NAMES;
}
```

### Validation Checklist
- Check `Array.isArray()` before array operations
- Verify object properties exist before accessing them
- Validate data types match expected values
- Provide sensible fallbacks for invalid input

---

## 13. User-Facing Error Messages

### Rule: NO ALERT() - USE INLINE ERROR MESSAGES
Never use `alert()` for error messages. Implement inline error displays that match the app's design.

#### ✅ Correct Pattern
```javascript
// Component state for error messages
const [errorMessage, setErrorMessage] = useState('');

const handleFileSelect = (e) => {
  setErrorMessage(''); // Clear previous errors

  if (file.size > MAX_SIZE) {
    setErrorMessage('File too large. Please select a smaller file.');
    setTimeout(() => setErrorMessage(''), 5000); // Auto-clear after 5s
    return;
  }
};

// In JSX
{errorMessage && (
  <div className="error-message">
    ⚠️ {errorMessage}
  </div>
)}
```

```css
/* Error message styling */
.error-message {
  margin-top: 15px;
  padding: 10px;
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid #ff0000;
  border-radius: 5px;
  color: #ff6666;
  animation: fadeIn 0.3s ease-in;
}
```

#### ❌ Incorrect Pattern
```javascript
// WRONG: Disruptive alert() blocks user interaction
if (file.size > MAX_SIZE) {
  alert('File too large!'); // ❌ Poor UX, doesn't match app design
  return;
}
```

### Error Display Best Practices
- **Inline placement**: Show errors near the relevant UI element
- **Auto-dismiss**: Clear errors after 5 seconds (configurable)
- **Themed styling**: Match error design to app's visual theme
- **Accessibility**: Include icons and clear messaging
- **Animation**: Smooth fade-in for better UX

---

## Resources

- See `css-standards.md` for CSS-specific guidelines
- See `src/utils/constants.js` for constant organization examples
- Check existing components for patterns before creating new ones
