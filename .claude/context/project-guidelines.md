# Project Guidelines - Cyber Duck Race

## Overview
This is a cyberpunk-themed raffle winner selection tool built with React and Vite. Users add participant names, and cyber ducks race to randomly select a winner. The project emphasizes code quality, maintainability, and passing automated code reviews on the first attempt.

---

## Code Quality Standards

### Critical Rules (Must Follow)
1. **No Magic Numbers**: Extract ALL numeric/string literals to `src/utils/constants.js`
2. **No Hardcoded Paths**: Store file paths and URLs in constants
3. **Error Handling**: All async operations and image loading must have error handlers
4. **Browser Compatibility**: Provide fallbacks for experimental CSS/JS features
5. **Proper Grammar**: All console messages must use complete, grammatically correct sentences

See `.claude/coding-standards.md` for complete details.

---

## Project Structure

```
src/
├── components/              # React components
│   ├── RaceTrack.jsx        # Canvas-based race rendering
│   ├── ParticipantManager.jsx # Participant add/remove UI
│   ├── Leaderboard.jsx      # Raffle history display
│   ├── ControlPanel.jsx     # Race controls
│   └── WinnerModal.jsx      # Winner celebration
├── contexts/                # React context providers
│   └── RaceContext.jsx      # Global race state & participants
├── styles/                  # Component-specific CSS
├── utils/                   # Utilities and configuration
│   ├── constants.js         # ALL constants go here
│   └── racePhysics.js       # Winner selection mechanics
└── App.jsx                  # Main application

.claude/
├── coding-standards.md      # General coding standards
├── css-standards.md         # CSS-specific guidelines
└── context/
    └── project-guidelines.md # This file
```

---

## Constants Organization

All constants must be in `src/utils/constants.js`, organized by category:

- **RACE_CONSTANTS**: Race mechanics (duration, speed, thresholds)
- **VISUAL_CONSTANTS**: Rendering (canvas size, colors, spacing, **image paths**)
- **DUCK_CONSTANTS**: Duck properties (default names, colors, positioning)
- **PHYSICS_CONSTANTS**: Physics simulation parameters
- **ANIMATION_CONSTANTS**: Frame rates, timing
- **UI_CONSTANTS**: UI behavior, layouts, limits, participant management
- **AUDIO_CONSTANTS**: Sound files, volumes
- **THEME_CONSTANTS**: Colors, shadows, animations

---

## Common Patterns

### Image Loading
```javascript
const img = new Image();
img.onload = () => { /* success */ };
img.onerror = () => { console.warn('...'); /* fallback */ };
img.src = VISUAL_CONSTANTS.IMAGE_PATH;
```

### Canvas Rendering
- Clear canvas before each frame
- Use constants for all dimensions and positions
- Provide gradient fallbacks when images fail to load

### Component Styling
- Use cyberpunk theme: neon colors (#00ffff, #ff00ff, #9d00ff, #ffff00)
- Maintain consistent border/glow colors across UI panels
- Always provide fallback colors for gradient text

---

## Git Workflow

### Branch Naming
- Feature branches: `feature/descriptive-name`
- Bug fixes: `fix/descriptive-name`

### Commit Messages
Follow conventional commits format:
```
Short description of change

- Detailed bullet point 1
- Detailed bullet point 2
- Explains WHY the change was made
```

**Note**: Never include Claude Code attribution in commits as it causes confusion.

### Pull Requests
1. Create PR with descriptive title
2. Include summary, changes made, and test plan
3. Wait for Copilot review
4. Address ALL feedback before merging
5. Use squash merge to keep main branch clean

---

## Code Review Checklist

Before creating a PR, verify:
- [ ] No magic numbers anywhere in changed files
- [ ] No hardcoded file paths or URLs
- [ ] All image loading has error handling
- [ ] All console messages use proper grammar
- [ ] CSS gradient text has fallback colors
- [ ] No empty cleanup functions
- [ ] Constants use descriptive names
- [ ] Code follows existing project patterns
- [ ] App runs without errors (`npm run dev`)
- [ ] All features tested manually

### Accessibility Requirements
- [ ] All icon-only buttons have `aria-label` attributes
- [ ] Button labels match their `title` attributes
- [ ] Form inputs have associated labels or `aria-label`
- [ ] Interactive elements are keyboard accessible

### React Best Practices
- [ ] Use `onKeyDown` instead of deprecated `onKeyPress`
- [ ] Proper cleanup in `useEffect` hooks (revoke blob URLs, remove listeners)
- [ ] State validation provides user feedback (error messages)
- [ ] No validation bypass in form handlers
- [ ] Constants used appropriately (avoid misusing unrelated constants)
- [ ] Audio state managed by event listeners, not manual setState after play()
- [ ] Use `import.meta.env.DEV` in Vite apps, not `process.env.NODE_ENV`
- [ ] Guard against division/modulo by zero in dynamic calculations
- [ ] Use literal `0` instead of unrelated constants for clarity
- [ ] Separate `useEffect` dependencies - don't mix unrelated concerns
- [ ] Store timeout/interval IDs in refs and clear them before setting new ones
- [ ] Always cleanup timers (setTimeout/setInterval) on component unmount
- [ ] Clear existing timers before creating new ones to prevent overlaps
- [ ] Remove unused variables to reduce noise and unnecessary computation

---

## Testing

### Manual Testing Checklist
- [ ] App starts: `npm run dev` → http://localhost:3000
- [ ] Can add participant names
- [ ] Cannot add duplicate or empty names
- [ ] Can remove participants individually
- [ ] Can clear all participants
- [ ] Cannot start race with 0 participants
- [ ] Race starts when "START RACE" clicked with participants
- [ ] Correct number of ducks match participant count
- [ ] Participant names displayed on ducks
- [ ] Ducks move across screen with scrolling background
- [ ] Winner selected at end (15s)
- [ ] Winner modal displays participant name
- [ ] Leaderboard updates with winner
- [ ] Reset button clears race state
- [ ] No console errors or warnings
- [ ] UI theme consistent (magenta/purple/cyan colors)

---

## Common Copilot Feedback (and How to Avoid)

1. **"Hardcoded value"** → Extract to constants.js
2. **"Missing error handling"** → Add onload/onerror handlers
3. **"Image validation incomplete"** → Check `img.complete && img.naturalWidth > 0`
4. **"Grammar error"** → Use complete sentences in console messages
5. **"Missing fallback"** → Add fallback color for gradient text
6. **"Redundant logic"** → Simplify conditionals, use return values directly
7. **"Empty cleanup"** → Remove empty return statements from useEffect

---

## Key Technologies

- **React 18**: UI framework
- **Vite 5**: Build tool and dev server
- **Canvas API**: Race track rendering
- **Web Crypto API**: Secure random number generation (with Math.random fallback)
- **CSS3**: Cyberpunk styling with gradients and animations

---

## Design Philosophy

1. **Constants First**: Before writing code, define constants
2. **Error Handling**: Always handle failures gracefully
3. **Browser Compatibility**: Support older browsers with fallbacks
4. **Code Quality**: Pass reviews on first attempt
5. **Maintainability**: Future developers should easily understand code
6. **Cyberpunk Theme**: Neon colors, glowing effects, retro-futuristic aesthetic

---

## Future Enhancements (Optional)

- Custom event banner with editable text
- Unit tests for RacePhysics class
- E2E tests with Cypress/Playwright
- Sound effects (constants already defined)
- Mobile responsiveness
- Export race results (CSV/PDF)
- Persistent storage for participants and history

---

## Resources

- **Coding Standards**: `.claude/coding-standards.md`
- **CSS Guidelines**: `.claude/css-standards.md`
- **Constants Reference**: `src/utils/constants.js`
- **GitHub Copilot**: Automated code reviewer
