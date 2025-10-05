import { useRace } from '../contexts/RaceContext';
import '../styles/CountdownOverlay.css';

const CountdownOverlay = () => {
  const { countdown } = useRace();

  if (!countdown) return null;

  return (
    <div className="countdown-overlay" role="alert" aria-live="assertive">
      <div className="countdown-box">
        <span className="countdown-number">{countdown}</span>
      </div>
    </div>
  );
};

export default CountdownOverlay;
