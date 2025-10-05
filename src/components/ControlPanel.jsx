import { useRace } from '../contexts/RaceContext';
import { UI_CONSTANTS } from '../utils/constants';
import { useCountdown } from '../hooks/useCountdown';
import '../styles/ControlPanel.css';

const ControlPanel = ({ isRacing, onStartRace, onResetRace, onAudioStart }) => {
  const { participants } = useRace();
  const { countdown, isCountingDown, startCountdown, resetCountdown } = useCountdown(onStartRace, onAudioStart);

  const handleStartRace = () => {
    startCountdown();
  };

  const handleResetRace = () => {
    resetCountdown();
    onResetRace();
  };

  return (
    <div className="control-panel">
      <div className="control-panel-header">
        <h2 className="panel-title">RACE CONTROL</h2>
      </div>

      <div className="control-panel-body">
        {countdown && (
          <div className="countdown-display">
            <span className="countdown-number">{countdown}</span>
          </div>
        )}

        <div className="control-buttons">
          <button
            className="btn btn-start"
            onClick={handleStartRace}
            disabled={isRacing || isCountingDown || participants.length === UI_CONSTANTS.PARTICIPANT_LIST_EMPTY}
          >
            {isRacing ? 'RACING...' : 'START RACE'}
          </button>

          <button
            className="btn btn-reset"
            onClick={handleResetRace}
            disabled={!isRacing}
          >
            RESET
          </button>
        </div>

        <div className="race-status">
          <div className="status-indicator">
            <span className={`status-light ${isRacing ? 'active' : ''}`}></span>
            <span className="status-text">
              {isRacing ? 'RACE IN PROGRESS' : 'READY TO RACE'}
            </span>
          </div>
        </div>

        <div className="race-info">
          <div className="info-item">
            <span className="info-label">MODE:</span>
            <span className="info-value">RAFFLE</span>
          </div>
          <div className="info-item">
            <span className="info-label">PARTICIPANTS:</span>
            <span className="info-value">{participants.length}</span>
          </div>
          <div className="info-item">
            <span className="info-label">TRACK:</span>
            <span className="info-value">NEO-QUACKYO</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
