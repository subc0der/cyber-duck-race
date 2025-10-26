import { useState, useRef, useEffect } from 'react';
import { UI_CONSTANTS } from '../utils/constants';
import { parseNameList, prepareNamesForImport } from '../utils/nameParser';
import { useRace } from '../contexts/RaceContext';
import { useDebounce } from '../hooks/useDebounce';
import '../styles/BulkImportModal.css';

/**
 * Helper function to get the correct plural or singular form of a word
 * @param {number} count - The count to check
 * @param {string} singular - The singular form of the word
 * @param {string} plural - The plural form of the word
 * @returns {string} The appropriate form based on count
 */
const pluralize = (count, singular, plural) => {
  return count === UI_CONSTANTS.PARTICIPANT_COUNT_SINGULAR ? singular : plural;
};

const BulkImportModal = ({ isOpen, onClose, initialText = '' }) => {
  const { participants, addParticipant } = useRace();
  const [textInput, setTextInput] = useState('');
  const [previewInfo, setPreviewInfo] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const textareaRef = useRef(null);
  const successTimeoutRef = useRef(null);
  const errorTimeoutRef = useRef(null);
  const debouncedTextInput = useDebounce(textInput, UI_CONSTANTS.BULK_IMPORT_DEBOUNCE_DELAY);

  // Handle modal state changes - set initial text when opening, clear state when closing
  useEffect(() => {
    if (isOpen) {
      setTextInput(initialText);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } else {
      // Reset state when modal closes
      setTextInput('');
      setPreviewInfo(null);
      setSuccessMessage('');
      setErrorMessage('');
      // Clear any pending timeouts
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = null;
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
        errorTimeoutRef.current = null;
      }
    }
  }, [isOpen, initialText]);

  // Update preview info whenever debounced text changes
  useEffect(() => {
    if (!debouncedTextInput.trim()) {
      setPreviewInfo(null);
      return;
    }

    const parsedNames = parseNameList(debouncedTextInput);
    const importPreview = prepareNamesForImport(parsedNames, participants);

    setPreviewInfo(importPreview);
  }, [debouncedTextInput, participants]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const handleImport = () => {
    if (!previewInfo || previewInfo.validNames.length === 0) {
      setErrorMessage(UI_CONSTANTS.MESSAGES.NO_VALID_NAMES);
      // Clear any existing error timeout before setting a new one
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setErrorMessage('');
        errorTimeoutRef.current = null;
      }, UI_CONSTANTS.NOTIFICATION_DURATION);
      return;
    }

    let importedCount = 0;

    // Import all valid names
    previewInfo.validNames.forEach((name) => {
      const result = addParticipant(name);
      if (result.success) {
        importedCount++;
      }
    });

    // Build success message
    const participantText = pluralize(
      importedCount,
      UI_CONSTANTS.MESSAGES.PARTICIPANT,
      UI_CONSTANTS.MESSAGES.PARTICIPANTS
    );
    let message = `${UI_CONSTANTS.MESSAGES.SUCCESSFULLY_IMPORTED} ${importedCount} ${participantText}`;

    if (previewInfo.duplicateCount > 0) {
      const duplicateText = pluralize(
        previewInfo.duplicateCount,
        UI_CONSTANTS.MESSAGES.DUPLICATE_SKIPPED,
        UI_CONSTANTS.MESSAGES.DUPLICATES_SKIPPED
      );
      message += ` (${previewInfo.duplicateCount} ${duplicateText} ${UI_CONSTANTS.MESSAGES.SKIPPED})`;
    }

    if (previewInfo.limitReached > 0) {
      message += ` (${previewInfo.limitReached} ${UI_CONSTANTS.MESSAGES.SKIPPED_DUE_TO_LIMIT} ${UI_CONSTANTS.MAX_PARTICIPANTS} ${UI_CONSTANTS.MESSAGES.PARTICIPANT_LIMIT})`;
    }

    setSuccessMessage(message);
    setTextInput('');
    setPreviewInfo(null);

    // Clear any existing success timeout before setting a new one
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = setTimeout(() => {
      setSuccessMessage('');
      onClose();
      successTimeoutRef.current = null;
    }, UI_CONSTANTS.BULK_IMPORT_SUCCESS_MESSAGE_DURATION);
  };

  const handleClose = () => {
    // Clear any pending timeouts
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    setTextInput('');
    setPreviewInfo(null);
    setSuccessMessage('');
    setErrorMessage('');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="bulk-import-modal-overlay" onClick={handleClose}>
      <div className="bulk-import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bulk-import-header">
          <h2 className="bulk-import-title">{UI_CONSTANTS.TITLES.IMPORT_PARTICIPANT_LIST}</h2>
          <button
            className="bulk-import-close-btn"
            onClick={handleClose}
            aria-label={UI_CONSTANTS.ARIA_LABELS.CLOSE_IMPORT_DIALOG}
          >
            {UI_CONSTANTS.ICONS.CLOSE}
          </button>
        </div>

        <div className="bulk-import-content">
          <textarea
            ref={textareaRef}
            className="bulk-import-textarea"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={UI_CONSTANTS.PLACEHOLDERS.BULK_IMPORT}
            rows={UI_CONSTANTS.BULK_IMPORT_TEXTAREA_ROWS}
            aria-label={UI_CONSTANTS.ARIA_LABELS.PASTE_PARTICIPANT_NAMES}
          />

          {previewInfo && (
            <div className="bulk-import-preview">
              <div className="bulk-import-preview-stat">
                <span className="bulk-import-preview-label">{UI_CONSTANTS.MESSAGES.READY_TO_IMPORT}</span>
                <span className="bulk-import-preview-value">
                  {previewInfo.validNames.length} {pluralize(previewInfo.validNames.length, UI_CONSTANTS.MESSAGES.NAME, UI_CONSTANTS.MESSAGES.NAMES)}
                </span>
              </div>

              {previewInfo.duplicateCount > 0 && (
                <div className="bulk-import-preview-stat bulk-import-preview-warning">
                  <span className="bulk-import-preview-label">{UI_CONSTANTS.MESSAGES.DUPLICATES_LABEL}</span>
                  <span className="bulk-import-preview-value">{previewInfo.duplicateCount} {UI_CONSTANTS.MESSAGES.WILL_BE_SKIPPED}</span>
                </div>
              )}

              {previewInfo.limitReached > 0 && (
                <div className="bulk-import-preview-stat bulk-import-preview-warning">
                  <span className="bulk-import-preview-label">{UI_CONSTANTS.MESSAGES.LIMIT_REACHED}</span>
                  <span className="bulk-import-preview-value">
                    {previewInfo.limitReached} {UI_CONSTANTS.MESSAGES.EXCEEDS_MAX_LIMIT} {UI_CONSTANTS.MAX_PARTICIPANTS}
                  </span>
                </div>
              )}
            </div>
          )}

          {successMessage && (
            <div className="bulk-import-success-message">
              {UI_CONSTANTS.ICONS.SUCCESS} {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="bulk-import-error-message">
              {UI_CONSTANTS.ICONS.ERROR} {errorMessage}
            </div>
          )}
        </div>

        <div className="bulk-import-footer">
          <button
            className="bulk-import-cancel-btn"
            onClick={handleClose}
          >
            {UI_CONSTANTS.TEXT.CANCEL}
          </button>
          <button
            className="bulk-import-submit-btn"
            onClick={handleImport}
            disabled={!previewInfo || previewInfo.validNames.length === 0}
          >
            {UI_CONSTANTS.TEXT.IMPORT} {previewInfo && previewInfo.validNames.length > 0 ? `(${previewInfo.validNames.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
