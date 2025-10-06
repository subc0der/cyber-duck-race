import { useRace } from '../contexts/RaceContext';
import { UI_CONSTANTS } from '../utils/constants';
import '../styles/ControlPanel.css';

const ControlPanel = ({ isRacing, onStartRace, onResetRace, onAudioStart }) => {
  const { participants, countdown, startCountdown } = useRace();

  const handleStartRace = () => {
    startCountdown(onStartRace, onAudioStart);
  };

  return (
    <div className="control-buttons-wrapper">
      <button
        className="btn btn-start"
        onClick={handleStartRace}
        disabled={isRacing || countdown || participants.length === UI_CONSTANTS.PARTICIPANT_LIST_EMPTY}
        aria-label={isRacing ? 'Race in progress' : 'Start the race'}
      >
        {isRacing ? 'RACING...' : 'START RACE'}
      </button>

      <button
        className="btn btn-reset"
        onClick={onResetRace}
        disabled={!isRacing}
        aria-label="Reset the race"
      >
        RESET
      </button>
    </div>
  );
};

export default ControlPanel;