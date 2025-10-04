import { useEffect, useState } from 'react';
import { UI_CONSTANTS } from '../utils/constants';
import '../styles/WinnerModal.css';

const WinnerModal = ({ winner, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, UI_CONSTANTS.WINNER_DISPLAY_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="winner-modal-overlay" onClick={onClose}>
      <div className="winner-modal" onClick={(e) => e.stopPropagation()}>
        {showConfetti && (
          <div className="confetti-container">
            {[...Array(UI_CONSTANTS.CONFETTI_COUNT)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  '--delay': `${Math.random() * UI_CONSTANTS.CONFETTI_ANIMATION_DURATION}s`,
                  '--position': `${Math.random() * UI_CONSTANTS.CONFETTI_POSITION_RANGE}%`,
                  '--color': ['#00ffff', '#ff00ff', '#9d00ff', '#ffff00'][i % UI_CONSTANTS.CONFETTI_COLOR_COUNT],
                }}
              />
            ))}
          </div>
        )}

        <div className="winner-content">
          <h1 className="winner-title">WINNER!</h1>
          <div className="winner-name" style={{ color: winner.color }}>
            {winner.name}
          </div>
          <div className="winner-stats">
            <div className="stat">
              <span className="stat-label">FINISH TIME</span>
              <span className="stat-value">{winner.time || UI_CONSTANTS.DEFAULT_FINISH_TIME}s</span>
            </div>
            <div className="stat">
              <span className="stat-label">AVG SPEED</span>
              <span className="stat-value">{winner.avgSpeed || UI_CONSTANTS.DEFAULT_SPEED}px/s</span>
            </div>
          </div>
          <button className="btn btn-close" onClick={onClose}>
            CLOSE
          </button>
        </div>

        <div className="trophy-icon">🏆</div>
      </div>
    </div>
  );
};

export default WinnerModal;