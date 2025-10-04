import { useEffect, useState } from 'react';
import '../styles/WinnerModal.css';

const WinnerModal = ({ winner, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="winner-modal-overlay" onClick={onClose}>
      <div className="winner-modal" onClick={(e) => e.stopPropagation()}>
        {showConfetti && (
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  '--delay': `${Math.random() * 3}s`,
                  '--position': `${Math.random() * 100}%`,
                  '--color': ['#00ffff', '#ff00ff', '#9d00ff', '#ffff00'][i % 4],
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
              <span className="stat-value">{winner.time || '15.0'}s</span>
            </div>
            <div className="stat">
              <span className="stat-label">AVG SPEED</span>
              <span className="stat-value">{winner.avgSpeed || '100'}px/s</span>
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