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

### Exceptions
Only these are acceptable without extraction:
- `-1`, `0`, `1` when used for array indexing or increment/decrement
- `0` when initializing counters
- Mathematical constants used in standard formulas (e.g., `Math.PI * 2`)

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
- [ ] No hardcoded file paths - all paths in constants
- [ ] Image loading has error handlers (`onload`/`onerror`)
- [ ] Image validation uses `img.complete && img.naturalWidth > 0`
- [ ] All console messages use proper grammar
- [ ] No empty cleanup functions in `useEffect`
- [ ] CSS gradient text has fallback `color` property
- [ ] All constants use descriptive names
- [ ] Code follows existing patterns in the project

---

## Resources

- See `css-standards.md` for CSS-specific guidelines
- See `src/utils/constants.js` for constant organization examples
- Check existing components for patterns before creating new ones
