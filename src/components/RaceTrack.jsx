import { useEffect, useRef, useState } from 'react';
import { RACE_CONSTANTS, VISUAL_CONSTANTS, UI_CONSTANTS } from '../utils/constants';
import { RacePhysics } from '../utils/racePhysics';
import '../styles/RaceTrack.css';

const RaceTrack = ({ isRacing, onRaceEnd }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const racePhysicsRef = useRef(null);
  const backgroundImageRef = useRef(null);
  const [ducks, setDucks] = useState([]);

  useEffect(() => {
    if (!racePhysicsRef.current) {
      racePhysicsRef.current = new RacePhysics();
    }

    const initialDucks = racePhysicsRef.current.initializeDucks();
    setDucks(initialDucks);

    // Load background image
    const img = new Image();
    img.src = '/subcoder/BG00.jpg';
    backgroundImageRef.current = img;
  }, []);

  useEffect(() => {
    if (!isRacing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let startTime = Date.now();
    let backgroundOffset = UI_CONSTANTS.INITIAL_BACKGROUND_OFFSET;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = (currentTime - startTime) / UI_CONSTANTS.MILLISECONDS_TO_SECONDS;

      if (elapsed >= RACE_CONSTANTS.RACE_DURATION) {
        const winner = racePhysicsRef.current.determineWinner();
        onRaceEnd(winner);
        return;
      }

      ctx.clearRect(UI_CONSTANTS.CANVAS_ORIGIN, UI_CONSTANTS.CANVAS_ORIGIN, canvas.width, canvas.height);

      backgroundOffset -= VISUAL_CONSTANTS.BACKGROUND_SCROLL_SPEED / UI_CONSTANTS.FRAME_RATE_DIVISOR;
      const newOffset = drawBackground(ctx, backgroundOffset);
      if (newOffset === 0) {
        backgroundOffset = 0;
      }

      const updatedDucks = racePhysicsRef.current.updateDuckPositions(elapsed);
      drawDucks(ctx, updatedDucks);
      setDucks(updatedDucks);

      drawRaceInfo(ctx, elapsed);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRacing, onRaceEnd]);

  const drawBackground = (ctx, offset) => {
    const img = backgroundImageRef.current;

    if (img && img.complete) {
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
      const gradient = ctx.createLinearGradient(UI_CONSTANTS.CANVAS_ORIGIN, UI_CONSTANTS.CANVAS_ORIGIN, UI_CONSTANTS.CANVAS_ORIGIN, ctx.canvas.height);
      gradient.addColorStop(UI_CONSTANTS.GRADIENT_STOP_START, '#0a0a0a');
      gradient.addColorStop(UI_CONSTANTS.GRADIENT_STOP_MIDDLE, '#1a0033');
      gradient.addColorStop(UI_CONSTANTS.GRADIENT_STOP_END, '#0a0a0a');
      ctx.fillStyle = gradient;
      ctx.fillRect(VISUAL_CONSTANTS.BACKGROUND_RECT_ORIGIN, VISUAL_CONSTANTS.BACKGROUND_RECT_ORIGIN, ctx.canvas.width, ctx.canvas.height);
    }

    return offset;
  };

  const drawDucks = (ctx, duckList) => {
    duckList.forEach((duck) => {
      ctx.fillStyle = duck.color;
      ctx.shadowColor = duck.color;
      ctx.shadowBlur = VISUAL_CONSTANTS.DUCK_GLOW_BLUR;

      ctx.beginPath();
      ctx.ellipse(duck.displayX, duck.y, VISUAL_CONSTANTS.DUCK_WIDTH, VISUAL_CONSTANTS.DUCK_HEIGHT, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(duck.displayX - VISUAL_CONSTANTS.DUCK_EYE_OFFSET_X, duck.y - VISUAL_CONSTANTS.DUCK_EYE_OFFSET_Y, VISUAL_CONSTANTS.DUCK_EYE_SIZE, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = duck.color;
      ctx.font = 'bold 12px monospace';
      ctx.fillText(duck.name, duck.displayX - VISUAL_CONSTANTS.DUCK_NAME_OFFSET_X, duck.y - VISUAL_CONSTANTS.DUCK_NAME_OFFSET_Y);

      ctx.shadowBlur = 0;
    });
  };

  const drawRaceInfo = (ctx, elapsed) => {
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 20px monospace';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = VISUAL_CONSTANTS.INFO_TEXT_GLOW_BLUR;

    const timeLeft = Math.max(0, RACE_CONSTANTS.RACE_DURATION - elapsed);
    ctx.fillText(`TIME: ${timeLeft.toFixed(1)}s`, VISUAL_CONSTANTS.TIME_DISPLAY_X, VISUAL_CONSTANTS.TIME_DISPLAY_Y);

    const progress = (elapsed / RACE_CONSTANTS.RACE_DURATION) * 100;
    ctx.fillText(`PROGRESS: ${progress.toFixed(0)}%`, VISUAL_CONSTANTS.PROGRESS_DISPLAY_X, VISUAL_CONSTANTS.PROGRESS_DISPLAY_Y);

    ctx.shadowBlur = 0;
  };

  return (
    <div className="race-track">
      <canvas
        ref={canvasRef}
        width={VISUAL_CONSTANTS.CANVAS_WIDTH}
        height={VISUAL_CONSTANTS.CANVAS_HEIGHT}
        className="race-canvas"
      />
      <div className="track-overlay">
        <div className="track-grid"></div>
      </div>
    </div>
  );
};

export default RaceTrack;