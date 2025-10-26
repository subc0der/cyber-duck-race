import { useState } from 'react';
import { useRace } from '../contexts/RaceContext';
import { DUCK_CONSTANTS, UI_CONSTANTS } from '../utils/constants';
import { parseNameList } from '../utils/nameParser';
import BulkImportModal from './BulkImportModal';
import '../styles/ParticipantManager.css';

const ParticipantManager = () => {
  const { participants, addParticipant, removeParticipant, clearParticipants } = useRace();
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const handleAddParticipant = () => {
    if (inputValue.trim()) {
      const result = addParticipant(inputValue);
      if (result.success) {
        setInputValue('');
        setErrorMessage('');
      } else {
        setErrorMessage(result.error);
        setTimeout(() => setErrorMessage(''), UI_CONSTANTS.NOTIFICATION_DURATION);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddParticipant();
    }
  };

  const handlePaste = (e) => {
    const clipboardText = e.clipboardData.getData('text');

    // Detect multiple lines or comma-separated values
    const hasMultipleLines = clipboardText.includes('\n');
    const hasCommas = clipboardText.includes(',');

    if (hasMultipleLines || hasCommas) {
      e.preventDefault(); // Prevent default paste behavior

      const parsedNames = parseNameList(clipboardText);

      if (parsedNames.length > 1) {
        // Multiple names detected - clear input and show import modal with pasted text
        setInputValue('');
        setPastedText(clipboardText);
        setIsImportModalOpen(true);
      } else if (parsedNames.length === 1) {
        // Single name - use normal add flow
        setInputValue(parsedNames[0]);
      }
    }
  };

  const getDuckColor = (index) => {
    return DUCK_CONSTANTS.DUCK_COLORS[index % DUCK_CONSTANTS.DUCK_COLORS.length];
  };

  return (
    <div className="participant-manager">
      <h2 className="participant-title">{UI_CONSTANTS.TITLES.RAFFLE_PARTICIPANTS}</h2>

      <div className="participant-input-section">
        <input
          type="text"
          className="participant-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          placeholder={UI_CONSTANTS.PLACEHOLDERS.PARTICIPANT_NAME}
          maxLength={UI_CONSTANTS.MAX_PARTICIPANT_NAME_LENGTH}
        />
        <button
          className="participant-add-btn"
          onClick={handleAddParticipant}
          disabled={participants.length >= UI_CONSTANTS.MAX_PARTICIPANTS}
          aria-label={UI_CONSTANTS.ARIA_LABELS.ADD_PARTICIPANT}
        >
          {UI_CONSTANTS.TEXT.ADD}
        </button>
        <button
          className="participant-import-btn"
          onClick={() => setIsImportModalOpen(true)}
          disabled={participants.length >= UI_CONSTANTS.MAX_PARTICIPANTS}
          aria-label={UI_CONSTANTS.ARIA_LABELS.IMPORT_PARTICIPANTS}
          title={UI_CONSTANTS.TITLES.IMPORT_MULTIPLE}
        >
          {UI_CONSTANTS.ICONS.IMPORT} {UI_CONSTANTS.TEXT.IMPORT_LIST}
        </button>
      </div>

      {errorMessage && (
        <div className="participant-error-message">
          {errorMessage}
        </div>
      )}

      <div className="participant-count">
        {participants.length} / {UI_CONSTANTS.MAX_PARTICIPANTS} {participants.length === UI_CONSTANTS.PARTICIPANT_COUNT_SINGULAR ? UI_CONSTANTS.MESSAGES.PARTICIPANT : UI_CONSTANTS.MESSAGES.PARTICIPANTS}
      </div>

      <div className="participant-list">
        {participants.length === UI_CONSTANTS.PARTICIPANT_LIST_EMPTY ? (
          <div className="participant-empty">{UI_CONSTANTS.MESSAGES.NO_PARTICIPANTS}</div>
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
                aria-label={UI_CONSTANTS.ARIA_LABELS.REMOVE_PARTICIPANT}
              >
                {UI_CONSTANTS.ICONS.CLOSE}
              </button>
            </div>
          ))
        )}
      </div>

      {participants.length > UI_CONSTANTS.PARTICIPANT_LIST_EMPTY && (
        <button
          className="participant-clear-btn"
          onClick={clearParticipants}
          aria-label={UI_CONSTANTS.ARIA_LABELS.CLEAR_ALL_PARTICIPANTS}
        >
          {UI_CONSTANTS.TEXT.CLEAR_ALL}
        </button>
      )}

      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setPastedText('');
        }}
        initialText={pastedText}
      />
    </div>
  );
};

export default ParticipantManager;
