import { useEffect, useRef, useState } from 'react';
import { RACE_CONSTANTS, VISUAL_CONSTANTS } from '../utils/constants';
import { RacePhysics } from '../utils/racePhysics';
import '../styles/RaceTrack.css';

const RaceTrack = ({ isRacing, onRaceEnd }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const racePhysicsRef = useRef(null);
  const [ducks, setDucks] = useState([]);

  useEffect(() => {
    if (!racePhysicsRef.current) {
      racePhysicsRef.current = new RacePhysics();
    }

    const initialDucks = racePhysicsRef.current.initializeDucks();
    setDucks(initialDucks);
  }, []);

  useEffect(() => {
    if (!isRacing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let startTime = Date.now();
    let backgroundOffset = 0;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = (currentTime - startTime) / 1000;

      if (elapsed >= RACE_CONSTANTS.RACE_DURATION) {
        const winner = racePhysicsRef.current.determineWinner();
        onRaceEnd(winner);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      backgroundOffset -= VISUAL_CONSTANTS.BACKGROUND_SCROLL_SPEED / 60;
      if (backgroundOffset <= -canvas.width) {
        backgroundOffset = 0;
      }
      drawBackground(ctx, backgroundOffset);

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
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(0.5, '#1a0033');
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;

    for (let i = 0; i < 20; i++) {
      const x = (i * 60 + offset) % ctx.canvas.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
  };

  const drawDucks = (ctx, duckList) => {
    duckList.forEach((duck) => {
      ctx.fillStyle = duck.color;
      ctx.shadowColor = duck.color;
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.ellipse(duck.displayX, duck.y, 25, 20, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(duck.displayX - 8, duck.y - 5, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = duck.color;
      ctx.font = 'bold 12px monospace';
      ctx.fillText(duck.name, duck.displayX - 20, duck.y - 30);

      ctx.shadowBlur = 0;
    });
  };

  const drawRaceInfo = (ctx, elapsed) => {
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 20px monospace';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 5;

    const timeLeft = Math.max(0, RACE_CONSTANTS.RACE_DURATION - elapsed);
    ctx.fillText(`TIME: ${timeLeft.toFixed(1)}s`, 20, 40);

    const progress = (elapsed / RACE_CONSTANTS.RACE_DURATION) * 100;
    ctx.fillText(`PROGRESS: ${progress.toFixed(0)}%`, 20, 70);

    ctx.shadowBlur = 0;
  };

  return (
    <div className="race-track">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="race-canvas"
      />
      <div className="track-overlay">
        <div className="track-grid"></div>
      </div>
    </div>
  );
};

export default RaceTrack;