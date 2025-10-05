import { useState } from 'react';
import { useRace } from '../contexts/RaceContext';
import { DUCK_CONSTANTS, UI_CONSTANTS } from '../utils/constants';
import '../styles/ParticipantManager.css';

const ParticipantManager = () => {
  const { participants, addParticipant, removeParticipant, clearParticipants } = useRace();
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleAddParticipant = () => {
    const result = addParticipant(inputValue);
    if (result.success) {
      setInputValue('');
      setErrorMessage('');
    } else {
      setErrorMessage(result.error);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddParticipant();
    }
  };

  const getDuckColor = (index) => {
    return DUCK_CONSTANTS.DUCK_COLORS[index % DUCK_CONSTANTS.DUCK_COLORS.length];
  };

  return (
    <div className="participant-manager">
      <h2 className="participant-title">Raffle Participants</h2>

      <div className="participant-input-section">
        <input
          type="text"
          className="participant-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter participant name"
          maxLength={UI_CONSTANTS.MAX_PARTICIPANT_NAME_LENGTH}
        />
        <button
          className="participant-add-btn"
          onClick={handleAddParticipant}
          disabled={participants.length >= UI_CONSTANTS.MAX_PARTICIPANTS}
        >
          Add
        </button>
      </div>

      {errorMessage && (
        <div className="participant-error-message">
          {errorMessage}
        </div>
      )}

      <div className="participant-count">
        {participants.length} / {UI_CONSTANTS.MAX_PARTICIPANTS} {participants.length === UI_CONSTANTS.PARTICIPANT_COUNT_SINGULAR ? 'participant' : 'participants'}
      </div>

      <div className="participant-list">
        {participants.length === UI_CONSTANTS.PARTICIPANT_LIST_EMPTY ? (
          <div className="participant-empty">No participants yet</div>
        ) : (
          participants.map((participant, index) => (
            <div key={participant.id} className="participant-item">
              <div
                className="participant-color-indicator"
                style={{ backgroundColor: getDuckColor(index) }}
              />
              <span className="participant-name">{participant.name}</span>
              <button
                className="participant-remove-btn"
                onClick={() => removeParticipant(participant.id)}
                aria-label="Remove participant"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {participants.length > UI_CONSTANTS.PARTICIPANT_LIST_EMPTY && (
        <button
          className="participant-clear-btn"
          onClick={clearParticipants}
        >
          Clear All
        </button>
      )}
    </div>
  );
};

export default ParticipantManager;
