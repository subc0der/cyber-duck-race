# Custom Duck Assets Guide

## Overview
This guide explains how to add custom duck graphics to replace the default ellipse-based rendering with your own PNG/SVG duck images.

---

## Current Duck Rendering

Currently, ducks are rendered using Canvas ellipse shapes in `src/components/RaceTrack.jsx` (lines 103-124):

```javascript
const drawDucks = (ctx, duckList) => {
  duckList.forEach((duck) => {
    ctx.fillStyle = duck.color;
    ctx.shadowColor = duck.color;
    ctx.shadowBlur = VISUAL_CONSTANTS.DUCK_GLOW_BLUR;

    ctx.beginPath();
    ctx.ellipse(duck.displayX, duck.y, VISUAL_CONSTANTS.DUCK_WIDTH, VISUAL_CONSTANTS.DUCK_HEIGHT, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye rendering
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(duck.displayX - VISUAL_CONSTANTS.DUCK_EYE_OFFSET_X, duck.y - VISUAL_CONSTANTS.DUCK_EYE_OFFSET_Y, VISUAL_CONSTANTS.DUCK_EYE_SIZE, 0, Math.PI * 2);
    ctx.fill();

    // Name label
    ctx.fillStyle = duck.color;
    ctx.font = 'bold 12px monospace';
    ctx.fillText(duck.name, duck.displayX - VISUAL_CONSTANTS.DUCK_NAME_OFFSET_X, duck.y - VISUAL_CONSTANTS.DUCK_NAME_OFFSET_Y);

    ctx.shadowBlur = 0;
  });
};
```

---

## How to Add Custom Duck Images

### Step 1: Prepare Duck Assets

1. **Create duck images** (PNG with transparency recommended):
   - Size: 50x40 pixels (or larger, will be scaled)
   - Transparent background
   - Facing right (direction of race)
   - File naming: `duck-1.png`, `duck-2.png`, etc.

2. **Save to assets folder**:
   ```
   public/assets/ducks/
   ├── duck-1.png
   ├── duck-2.png
   ├── duck-3.png
   └── ... (add as many as needed)
   ```

### Step 2: Add Constants

Update `src/utils/constants.js`:

```javascript
export const VISUAL_CONSTANTS = {
  // ... existing constants ...

  // Duck image assets
  DUCK_IMAGE_WIDTH: 50,
  DUCK_IMAGE_HEIGHT: 40,
  DUCK_IMAGE_BASE_PATH: '/assets/ducks/',
  DUCK_IMAGE_COUNT: 6, // How many different duck images you have
};
```

### Step 3: Load Duck Images

In `src/components/RaceTrack.jsx`, add image loading in the useEffect:

```javascript
const [duckImages, setDuckImages] = useState([]);

useEffect(() => {
  // Load duck images
  const images = [];
  for (let i = 1; i <= VISUAL_CONSTANTS.DUCK_IMAGE_COUNT; i++) {
    const img = new window.Image();
    img.onload = () => {
      images[i - 1] = img;
      if (images.filter(Boolean).length === VISUAL_CONSTANTS.DUCK_IMAGE_COUNT) {
        setDuckImages([...images]);
      }
    };
    img.onerror = () => {
      console.warn(`Failed to load duck image ${i}, using fallback rendering.`);
    };
    img.src = `${VISUAL_CONSTANTS.DUCK_IMAGE_BASE_PATH}duck-${i}.png`;
  }
}, []);
```

### Step 4: Update Duck Rendering

Replace the `drawDucks` function to use images:

```javascript
const drawDucks = (ctx, duckList) => {
  duckList.forEach((duck) => {
    const duckImageIndex = duck.id % duckImages.length;
    const duckImage = duckImages[duckImageIndex];

    if (duckImage && duckImage.complete) {
      // Draw duck image with color tint
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.drawImage(
        duckImage,
        duck.displayX - VISUAL_CONSTANTS.DUCK_IMAGE_WIDTH / 2,
        duck.y - VISUAL_CONSTANTS.DUCK_IMAGE_HEIGHT / 2,
        VISUAL_CONSTANTS.DUCK_IMAGE_WIDTH,
        VISUAL_CONSTANTS.DUCK_IMAGE_HEIGHT
      );
      ctx.restore();
    } else {
      // Fallback: Use current ellipse rendering
      ctx.fillStyle = duck.color;
      ctx.shadowColor = duck.color;
      ctx.shadowBlur = VISUAL_CONSTANTS.DUCK_GLOW_BLUR;
      ctx.beginPath();
      ctx.ellipse(duck.displayX, duck.y, VISUAL_CONSTANTS.DUCK_WIDTH, VISUAL_CONSTANTS.DUCK_HEIGHT, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Name label (always render)
    ctx.fillStyle = duck.color;
    ctx.font = 'bold 12px monospace';
    ctx.shadowColor = duck.color;
    ctx.shadowBlur = VISUAL_CONSTANTS.INFO_TEXT_GLOW_BLUR;
    ctx.fillText(duck.name, duck.displayX - VISUAL_CONSTANTS.DUCK_NAME_OFFSET_X, duck.y - VISUAL_CONSTANTS.DUCK_NAME_OFFSET_Y);
    ctx.shadowBlur = 0;
  });
};
```

---

## Alternative: SVG Ducks

For SVG assets, you can use the same approach but load SVG files instead:

1. Save SVG files to `public/assets/ducks/`
2. Load them the same way as PNG
3. SVGs will scale without quality loss

---

## Color Tinting (Optional)

To apply participant colors to duck images, use canvas `globalCompositeOperation`:

```javascript
// After drawing duck image
ctx.globalCompositeOperation = 'multiply';
ctx.fillStyle = duck.color;
ctx.fillRect(
  duck.displayX - VISUAL_CONSTANTS.DUCK_IMAGE_WIDTH / 2,
  duck.y - VISUAL_CONSTANTS.DUCK_IMAGE_HEIGHT / 2,
  VISUAL_CONSTANTS.DUCK_IMAGE_WIDTH,
  VISUAL_CONSTANTS.DUCK_IMAGE_HEIGHT
);
ctx.globalCompositeOperation = 'source-over'; // Reset
```

---

## Best Practices

1. **Always provide fallback rendering** - Current ellipse method ensures ducks appear even if images fail
2. **Use appropriate file sizes** - 50x40px at 72dpi is sufficient
3. **Optimize images** - Use PNG-8 or SVG for smaller file sizes
4. **Test with multiple ducks** - Ensure all images load correctly
5. **Follow naming conventions** - Use consistent numbering: `duck-1.png`, `duck-2.png`, etc.

---

## File Structure

```
public/
└── assets/
    ├── ducks/              # Duck image assets
    │   ├── duck-1.png
    │   ├── duck-2.png
    │   └── ...
    └── race-background.jpg # Race background
```

---

## Testing Checklist

- [ ] All duck images load without console errors
- [ ] Fallback rendering works when images unavailable
- [ ] Duck colors are distinguishable
- [ ] Images scale properly at different participant counts
- [ ] Performance is acceptable (60 FPS maintained)
- [ ] Images display correctly in all browsers

---

## Future Enhancements

- Animated sprite sheets for duck movement
- Randomized duck accessories (hats, glasses)
- User-uploadable custom duck images
- Duck skin selector in ParticipantManager
