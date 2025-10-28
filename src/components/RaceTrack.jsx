import { useEffect, useRef, useState, useCallback } from 'react';
import { RACE_CONSTANTS, VISUAL_CONSTANTS, UI_CONSTANTS, ACCESSIBILITY_CONSTANTS } from '../utils/constants';
import { RacePhysics } from '../utils/racePhysics';
import { useRace } from '../contexts/RaceContext';
import CountdownOverlay from './CountdownOverlay';
import raceBackgroundImg from '../assets/race-background.jpg';
import '../styles/RaceTrack.css';

/**
 * Converts a hex color string to RGB object
 * @param {string} hex - Hex color string (e.g., "#00ffff")
 * @returns {{r: number, g: number, b: number}} RGB color object
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 255, b: 255 }; // Fallback to cyan
};

const RaceTrack = ({ isRacing, onRaceEnd }) => {
  const { participants, countdown } = useRace();
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const racePhysicsRef = useRef(null);
  const backgroundImageRef = useRef(null);
  const rgbCacheRef = useRef(new Map()); // Cache for RGB conversions to avoid repeated calculations
  const [ducks, setDucks] = useState([]);
  const [ariaAnnouncement, setAriaAnnouncement] = useState('');
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const lastAnnouncementTimeRef = useRef(0);

  // Initialize race physics and load background image on mount
  useEffect(() => {
    if (!racePhysicsRef.current) {
      racePhysicsRef.current = new RacePhysics();
    }

    // Load background image using Vite's asset handling
    const img = new window.Image();
    img.onload = () => {
      backgroundImageRef.current = img;
      setBackgroundLoaded(true);
    };
    img.onerror = () => {
      console.warn('Failed to load background image, using fallback gradient');
      backgroundImageRef.current = null;
      setBackgroundLoaded(true); // Still set to true to trigger initial draw with fallback
    };
    img.src = raceBackgroundImg;

    // Cleanup event listeners to prevent memory leaks
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  // Draw background on initial load
  useEffect(() => {
    if (!canvasRef.current || !backgroundLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawBackground(ctx, 0);
  }, [backgroundLoaded]);

  // Define drawing functions before useEffect hooks that use them
  const drawThrustTrails = useCallback((ctx, duckList, currentTime) => {
    duckList.forEach((duck) => {
      // Use speedMultiplier to modulate trail intensity
      const speedFactor = Math.max(
        VISUAL_CONSTANTS.TRAIL_SPEED_FACTOR_MIN,
        Math.min(VISUAL_CONSTANTS.TRAIL_SPEED_FACTOR_MAX, duck.speedMultiplier || 1)
      );

      // Add subtle pulsing animation for energy beam effect
      const pulsePhase = (currentTime / UI_CONSTANTS.MILLISECONDS_TO_SECONDS) * VISUAL_CONSTANTS.TRAIL_PULSE_FREQUENCY * Math.PI * 2;
      const pulseIntensity = VISUAL_CONSTANTS.TRAIL_PULSE_MIN + (Math.sin(pulsePhase) * VISUAL_CONSTANTS.TRAIL_PULSE_AMPLITUDE);

      // Modulate trail length and brightness based on speed
      const trailLength = VISUAL_CONSTANTS.TRAIL_LENGTH * speedFactor;
      const brightnessBoost = speedFactor * pulseIntensity;

      // Cache RGB conversion using Map to avoid mutating duck objects
      const cache = rgbCacheRef.current;
      if (!cache.has(duck.color)) {
        cache.set(duck.color, hexToRgb(duck.color));
      }
      const rgb = cache.get(duck.color);
      const gradient = ctx.createLinearGradient(
        duck.displayX,
        duck.y,
        duck.displayX - trailLength,
        duck.y
      );

      // Gradient stops: bright at duck, fading to transparent at trail end
      const baseOpacity = VISUAL_CONSTANTS.TRAIL_OPACITY_START * brightnessBoost;
      gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseOpacity})`);
      gradient.addColorStop(
        VISUAL_CONSTANTS.TRAIL_GRADIENT_STOP_MID,
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseOpacity * VISUAL_CONSTANTS.TRAIL_GRADIENT_MID_OPACITY})`
      );
      gradient.addColorStop(
        VISUAL_CONSTANTS.TRAIL_GRADIENT_STOP_FAR,
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseOpacity * VISUAL_CONSTANTS.TRAIL_GRADIENT_FAR_OPACITY})`
      );
      gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${VISUAL_CONSTANTS.TRAIL_OPACITY_END})`);

      ctx.fillStyle = gradient;
      ctx.shadowColor = duck.color;
      ctx.shadowBlur = VISUAL_CONSTANTS.DUCK_GLOW_BLUR * brightnessBoost * VISUAL_CONSTANTS.TRAIL_GLOW_INTENSITY;

      // Draw concave cone shape (wider at duck, curved inward, narrower at tail)
      const heightAtDuck = VISUAL_CONSTANTS.TRAIL_WIDTH_START * speedFactor * VISUAL_CONSTANTS.TRAIL_WIDTH_DUCK_SCALE;
      const heightAtTail = VISUAL_CONSTANTS.TRAIL_WIDTH_END * speedFactor;

      ctx.beginPath();
      // Start at top of duck position
      ctx.moveTo(duck.displayX, duck.y - heightAtDuck / 2);

      // Curve inward to tail top (concave curve)
      ctx.quadraticCurveTo(
        duck.displayX - trailLength * VISUAL_CONSTANTS.TRAIL_CURVE_CONTROL_POINT,
        duck.y - heightAtDuck * VISUAL_CONSTANTS.TRAIL_CURVE_CONTROL_POINT,
        duck.displayX - trailLength,
        duck.y - heightAtTail / 2
      );

      // Bottom tail point
      ctx.lineTo(duck.displayX - trailLength, duck.y + heightAtTail / 2);

      // Curve inward back to duck bottom (concave curve)
      ctx.quadraticCurveTo(
        duck.displayX - trailLength * VISUAL_CONSTANTS.TRAIL_CURVE_CONTROL_POINT,
        duck.y + heightAtDuck * VISUAL_CONSTANTS.TRAIL_CURVE_CONTROL_POINT,
        duck.displayX,
        duck.y + heightAtDuck / 2
      );

      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
    });
  }, []); // Empty deps since all values used are from parameters or constants

  const drawDucks = useCallback((ctx, duckList, currentTime = null) => {
    // Draw thrust trails if currentTime is provided (during racing)
    if (currentTime !== null) {
      drawThrustTrails(ctx, duckList, currentTime);
    }

    duckList.forEach((duck) => {
      ctx.fillStyle = duck.color;
      ctx.shadowColor = duck.color;
      ctx.shadowBlur = VISUAL_CONSTANTS.DUCK_GLOW_BLUR;

      // Draw ellipse (body)
      ctx.beginPath();
      ctx.ellipse(duck.displayX, duck.y, VISUAL_CONSTANTS.DUCK_WIDTH, VISUAL_CONSTANTS.DUCK_HEIGHT, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw eye (white)
      ctx.fillStyle = VISUAL_CONSTANTS.DUCK_EYE_COLOR;
      ctx.beginPath();
      ctx.arc(duck.displayX - VISUAL_CONSTANTS.DUCK_EYE_OFFSET_X, duck.y - VISUAL_CONSTANTS.DUCK_EYE_OFFSET_Y, VISUAL_CONSTANTS.DUCK_EYE_SIZE, 0, Math.PI * 2);
      ctx.fill();

      // Draw name
      ctx.fillStyle = duck.color;
      ctx.font = VISUAL_CONSTANTS.DUCK_NAME_FONT;
      ctx.fillText(duck.name, duck.displayX + VISUAL_CONSTANTS.DUCK_NAME_OFFSET_X, duck.y + VISUAL_CONSTANTS.DUCK_NAME_OFFSET_Y);

      ctx.shadowBlur = 0;
    });
  }, [drawThrustTrails]); // Include drawThrustTrails since we call it

  // Reset ducks when participants change or countdown starts
  useEffect(() => {
    if (!racePhysicsRef.current) return;

    // Clear RGB cache when participants change to prevent unbounded growth
    // Duck colors are limited (6 colors from DUCK_CONSTANTS), but clearing ensures fresh state
    rgbCacheRef.current.clear();

    const initialDucks = racePhysicsRef.current.initializeDucks(participants);
    setDucks(initialDucks);
  }, [participants, countdown]);

  // Draw initial state when not racing
  useEffect(() => {
    if (isRacing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(ctx, 0);

    // Only draw ducks if there are any
    if (ducks.length > 0) {
      drawDucks(ctx, ducks); // No trails at start line (currentTime not provided)
    }
  }, [ducks, isRacing, drawDucks]);

  useEffect(() => {
    if (!isRacing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let startTime = Date.now();
    let lastFrameTime = startTime;
    let backgroundOffset = UI_CONSTANTS.INITIAL_BACKGROUND_OFFSET;

    const animate = () => {
      const currentTime = Date.now();
      // Calculate time since last frame in seconds for frame rate independence
      const deltaTime = (currentTime - lastFrameTime) / UI_CONSTANTS.MILLISECONDS_TO_SECONDS;
      const elapsed = (currentTime - startTime) / UI_CONSTANTS.MILLISECONDS_TO_SECONDS;
      lastFrameTime = currentTime;

      if (elapsed >= RACE_CONSTANTS.RACE_DURATION) {
        const winners = racePhysicsRef.current.determineWinners();
        // Clear RGB cache to prevent memory accumulation across multiple races
        rgbCacheRef.current.clear();
        onRaceEnd(winners);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Time-based background scrolling: pixels per second * seconds = pixels moved
      backgroundOffset -= VISUAL_CONSTANTS.BACKGROUND_SCROLL_SPEED * deltaTime;
      backgroundOffset = drawBackground(ctx, backgroundOffset);

      const updatedDucks = racePhysicsRef.current.updateDuckPositions(elapsed, deltaTime);
      drawDucks(ctx, updatedDucks, currentTime); // Trails enabled (currentTime provided)

      // Update ARIA announcement for accessibility
      if (currentTime - lastAnnouncementTimeRef.current > ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_INTERVAL_MS) {
        updateAriaAnnouncement(updatedDucks, elapsed);
        lastAnnouncementTimeRef.current = currentTime;
      }

      drawRaceInfo(ctx, elapsed);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRacing, onRaceEnd, drawDucks]);

  const drawBackground = (ctx, offset) => {
    const img = backgroundImageRef.current;

    if (img && img.complete && img.naturalWidth > 0) {
      // Calculate scaling to fit canvas height while maintaining aspect ratio
      const scale = ctx.canvas.height / img.height;
      const scaledWidth = img.width * scale;

      // Draw the image twice to create seamless scrolling effect
      ctx.drawImage(img, offset, 0, scaledWidth, ctx.canvas.height);
      ctx.drawImage(img, offset + scaledWidth, 0, scaledWidth, ctx.canvas.height);

      // If we've scrolled past one full image width, reset offset
      if (offset <= -scaledWidth) {
        return 0;
      }
    } else {
      // Fallback gradient if image hasn't loaded yet
      const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
      gradient.addColorStop(UI_CONSTANTS.GRADIENT_STOP_START, '#0a0a0a');
      gradient.addColorStop(UI_CONSTANTS.GRADIENT_STOP_MIDDLE, '#1a0033');
      gradient.addColorStop(UI_CONSTANTS.GRADIENT_STOP_END, '#0a0a0a');
      ctx.fillStyle = gradient;
      ctx.fillRect(VISUAL_CONSTANTS.BACKGROUND_RECT_ORIGIN, VISUAL_CONSTANTS.BACKGROUND_RECT_ORIGIN, ctx.canvas.width, ctx.canvas.height);
    }

    return offset;
  };

  const drawRaceInfo = (ctx, elapsed) => {
    const timeLeft = Math.max(0, RACE_CONSTANTS.RACE_DURATION - elapsed);
    const progress = (elapsed / RACE_CONSTANTS.RACE_DURATION) * 100;

    const boxWidth = VISUAL_CONSTANTS.RACE_INFO_BOX_WIDTH;
    const boxHeight = VISUAL_CONSTANTS.RACE_INFO_BOX_HEIGHT;
    const boxX = ctx.canvas.width - boxWidth - VISUAL_CONSTANTS.RACE_INFO_BOX_MARGIN;
    const boxY = VISUAL_CONSTANTS.RACE_INFO_BOX_MARGIN;

    ctx.fillStyle = VISUAL_CONSTANTS.RACE_INFO_BOX_BACKGROUND;
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    ctx.strokeStyle = VISUAL_CONSTANTS.RACE_INFO_BOX_BORDER_COLOR;
    ctx.lineWidth = VISUAL_CONSTANTS.RACE_INFO_BOX_BORDER_WIDTH;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    ctx.fillStyle = VISUAL_CONSTANTS.RACE_INFO_BOX_TEXT_COLOR;
    ctx.font = VISUAL_CONSTANTS.RACE_INFO_BOX_FONT;
    ctx.shadowColor = VISUAL_CONSTANTS.RACE_INFO_BOX_TEXT_COLOR;
    ctx.shadowBlur = VISUAL_CONSTANTS.INFO_TEXT_GLOW_BLUR;

    const textX = boxX + VISUAL_CONSTANTS.RACE_INFO_BOX_PADDING;
    const textY = boxY + VISUAL_CONSTANTS.RACE_INFO_BOX_PADDING + VISUAL_CONSTANTS.RACE_INFO_TEXT_BASELINE_OFFSET;

    ctx.fillText(`TIME: ${timeLeft.toFixed(1)}s`, textX, textY);
    ctx.fillText(`PROGRESS: ${progress.toFixed(0)}%`, textX, textY + VISUAL_CONSTANTS.RACE_INFO_LINE_HEIGHT);

    ctx.shadowBlur = 0;
  };

  const updateAriaAnnouncement = (duckList, elapsed) => {
    // Sort ducks by position to find leaders
    const sortedDucks = [...duckList].sort((a, b) => b.position - a.position);
    const leader = sortedDucks[0];
    const second = sortedDucks[1];
    const progress = Math.round((elapsed / RACE_CONSTANTS.RACE_DURATION) * 100);

    // Create announcement based on race progress
    const announcement = `Race ${progress}% complete. ${leader.name} is in first place.${second ? ' ' + second.name + ' is in second place.' : ''}`;
    setAriaAnnouncement(announcement);
  };

  // Update announcement when race ends
  useEffect(() => {
    if (!isRacing && ariaAnnouncement) {
      // Clear announcement after race ends
      setAriaAnnouncement('');
      lastAnnouncementTimeRef.current = 0;
    }
  }, [isRacing, ariaAnnouncement]);

  return (
    <div className="race-track">
      {/* ARIA live region for screen reader accessibility */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {ariaAnnouncement}
      </div>
      <canvas
        ref={canvasRef}
        width={VISUAL_CONSTANTS.CANVAS_WIDTH}
        height={VISUAL_CONSTANTS.CANVAS_HEIGHT}
        className="race-canvas"
      />
      {participants.length === 0 && !isRacing && (
        <>
          <div className="background-dim-overlay"></div>
          <div className="empty-participants-message">
            Add participant names
          </div>
        </>
      )}
      <div className="track-overlay"></div>
      <CountdownOverlay />
    </div>
  );
};

export default RaceTrack;