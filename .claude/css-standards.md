# CSS Coding Standards

> **Note**: For general coding standards including magic numbers, file paths, and error handling, see `coding-standards.md`

## Browser Compatibility

### Gradient Text with `background-clip: text`

**Issue**: When using `background-clip: text` with `-webkit-text-fill-color: transparent`, text becomes invisible in browsers that don't support this feature.

**Solution**: Always provide a fallback `color` property BEFORE the gradient styles.

#### ✅ Correct Pattern
```css
.gradient-text {
  font-size: 48px;
  color: #00ffff;  /* REQUIRED: Fallback color for unsupported browsers */
  background: linear-gradient(90deg, #00ffff, #ff00ff, #ffff00);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

#### ❌ Incorrect Pattern
```css
.gradient-text {
  font-size: 48px;
  /* MISSING: No fallback color - text will be invisible in older browsers */
  background: linear-gradient(90deg, #00ffff, #ff00ff, #ffff00);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Rule Summary
- **ALWAYS** include a `color` property before gradient text styles
- The fallback color should match the starting color of the gradient
- Place the `color` property immediately before the `background` property
- This ensures text remains visible in browsers without `background-clip` support

## Other Browser Compatibility Best Practices

### Vendor Prefixes
- Always include `-webkit-` prefixes for gradient text features
- Use `autoprefixer` for production builds when possible
- Test in multiple browsers (Chrome, Firefox, Safari, Edge)

### Fallback Patterns
- Provide solid color fallbacks for gradients
- Provide standard properties before experimental ones
- Test with CSS features disabled to verify fallbacks work
