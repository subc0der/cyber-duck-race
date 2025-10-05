import { useState, useRef, useEffect } from 'react';
import { useRace } from '../contexts/RaceContext';
import { UI_CONSTANTS } from '../utils/constants';
import '../styles/ControlPanel.css';

const ControlPanel = ({ isRacing, onStartRace, onResetRace, onAudioStart }) => {
  const { participants } = useRace();
  const [countdown, setCountdown] = useState(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleStartRace = () => {
    // Clear any existing timers
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    let count = UI_CONSTANTS.COUNTDOWN_START_VALUE;
    setCountdown(count);

    intervalRef.current = setInterval(() => {
      count--;
      if (count === 1 && onAudioStart) {
        onAudioStart();
      }
      if (count > 0) {
        setCountdown(count);
      } else {
        setCountdown('GO!');
        timeoutRef.current = setTimeout(() => {
          setCountdown(null);
          onStartRace();
          intervalRef.current = null;
          timeoutRef.current = null;
        }, UI_CONSTANTS.COUNTDOWN_GO_DELAY);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, UI_CONSTANTS.COUNTDOWN_INTERVAL);
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
            disabled={isRacing || countdown || participants.length === UI_CONSTANTS.PARTICIPANT_LIST_EMPTY}
          >
            {isRacing ? 'RACING...' : 'START RACE'}
          </button>

          <button
            className="btn btn-reset"
            onClick={onResetRace}
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