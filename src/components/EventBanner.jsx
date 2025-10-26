import { useState, useRef, useEffect } from 'react';
import { useRace } from '../contexts/RaceContext';
import { UI_CONSTANTS, AUDIO_CONSTANTS } from '../utils/constants';
import '../styles/EventBanner.css';

const EventBanner = () => {
  const { eventName, setEventName, audioFile, setAudioFile, audioVolume, setAudioVolume, setAudioRef } = useRace();
  const [showAudioPanel, setShowAudioPanel] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldRepeat, setShouldRepeat] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const audioPanelRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      setAudioRef(audioRef.current);
    }
  }, [setAudioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    audio.volume = audioVolume;

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioVolume]);

  // Click outside to close audio panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAudioPanel && audioPanelRef.current && !audioPanelRef.current.contains(event.target)) {
        // Check if the click is not on the toggle button
        if (!event.target.closest('.audio-toggle-btn-inline')) {
          setShowAudioPanel(false);
        }
      }
    };

    if (showAudioPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAudioPanel]);

  // Cleanup blob URL to prevent memory leaks
  useEffect(() => {
    const currentUrl = audioFile?.url;

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [audioFile]);

  const handleChange = (e) => {
    setEventName(e.target.value);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clear previous errors
      setErrorMessage('');

      // Check file size
      if (file.size > AUDIO_CONSTANTS.MAX_FILE_SIZE_BYTES) {
        setErrorMessage(`${UI_CONSTANTS.MESSAGES.FILE_SIZE_EXCEEDED} ${AUDIO_CONSTANTS.MAX_FILE_SIZE_MB}${UI_CONSTANTS.MESSAGES.MB_LIMIT}`);
        e.target.value = ''; // Reset file input
        setTimeout(() => setErrorMessage(''), UI_CONSTANTS.ERROR_MESSAGE_DURATION);
        return;
      }

      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp3'];
      if (validTypes.includes(file.type) || file.name.match(/\.(mp3|wav|flac)$/i)) {
        const fileURL = URL.createObjectURL(file);
        setAudioFile({ file, url: fileURL, name: file.name });
        if (audioRef.current) {
          audioRef.current.src = fileURL;
          audioRef.current.load();
        }
      } else {
        setErrorMessage(UI_CONSTANTS.MESSAGES.INVALID_FILE_FORMAT);
        e.target.value = ''; // Reset file input
        setTimeout(() => setErrorMessage(''), UI_CONSTANTS.ERROR_MESSAGE_DURATION);
      }
    }
  };

  const handleRemoveAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    if (audioFile && audioFile.url) {
      URL.revokeObjectURL(audioFile.url);
    }
    setAudioFile(null);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (!audioFile || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => {
        console.warn('Failed to play audio:', err);
      });
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setAudioVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleRepeatToggle = () => {
    const newRepeatState = !shouldRepeat;
    setShouldRepeat(newRepeatState);
    if (audioRef.current) {
      audioRef.current.loop = newRepeatState;
    }
  };

  return (
    <div className="event-banner">
      <div className="event-banner-content">
        <button
          className="audio-toggle-btn-inline"
          onClick={() => setShowAudioPanel(!showAudioPanel)}
          title={UI_CONSTANTS.TITLES.AUDIO_CONTROLS}
          aria-label={UI_CONSTANTS.ARIA_LABELS.TOGGLE_AUDIO_CONTROLS}
        >
          🔊
        </button>

        <input
          type="text"
          className="event-banner-input"
          value={eventName}
          onChange={handleChange}
          placeholder={UI_CONSTANTS.PLACEHOLDERS.EVENT_NAME}
          maxLength={UI_CONSTANTS.MAX_EVENT_NAME_LENGTH}
        />
      </div>

      {showAudioPanel && (
        <div ref={audioPanelRef} className="audio-upload-panel-banner">
          <div className="audio-panel-header">
            <h3 className="audio-panel-title">{UI_CONSTANTS.TITLES.BACKGROUND_MUSIC}</h3>
            <button
              className="audio-close-btn"
              onClick={() => setShowAudioPanel(false)}
              aria-label={UI_CONSTANTS.ARIA_LABELS.CLOSE_AUDIO_CONTROLS}
            >
              {UI_CONSTANTS.ICONS.CLOSE}
            </button>
          </div>

          <div className="audio-panel-body">
            {audioFile ? (
              <div className="audio-file-info">
                <div className="audio-file-name">
                  🎵 {audioFile.name}
                </div>

                <div className="audio-controls-section">
                  <button
                    className="audio-control-btn"
                    onClick={handlePlayPause}
                    title={isPlaying ? UI_CONSTANTS.TEXT.PAUSE : UI_CONSTANTS.TEXT.PLAY}
                    aria-label={isPlaying ? UI_CONSTANTS.ARIA_LABELS.PAUSE_AUDIO : UI_CONSTANTS.ARIA_LABELS.PLAY_AUDIO}
                  >
                    {isPlaying ? UI_CONSTANTS.ICONS.PAUSE : UI_CONSTANTS.ICONS.PLAY}
                  </button>
                  <button
                    className="audio-control-btn"
                    onClick={handleStop}
                    title={UI_CONSTANTS.TEXT.STOP}
                    aria-label={UI_CONSTANTS.ARIA_LABELS.STOP_AUDIO}
                  >
                    {UI_CONSTANTS.ICONS.STOP}
                  </button>
                  <button
                    className={`audio-control-btn ${shouldRepeat ? 'active' : ''}`}
                    onClick={handleRepeatToggle}
                    title={shouldRepeat ? UI_CONSTANTS.TEXT.REPEAT_ON : UI_CONSTANTS.TEXT.REPEAT_OFF}
                    aria-label={shouldRepeat ? UI_CONSTANTS.ARIA_LABELS.DISABLE_REPEAT : UI_CONSTANTS.ARIA_LABELS.ENABLE_REPEAT}
                  >
                    {UI_CONSTANTS.ICONS.REPEAT}
                  </button>
                </div>

                <button
                  className="audio-remove-btn"
                  onClick={handleRemoveAudio}
                >
                  {UI_CONSTANTS.TEXT.REMOVE_AUDIO}
                </button>
              </div>
            ) : (
              <div className="audio-upload-section">
                <p className="audio-upload-hint">
                  {UI_CONSTANTS.MESSAGES.UPLOAD_AUDIO_HINT}
                </p>
                <button
                  className="audio-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {UI_CONSTANTS.TEXT.CHOOSE_AUDIO_FILE}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.wav,.flac,audio/mpeg,audio/wav,audio/flac"
                  onChange={handleFileSelect}
                  className="audio-file-input"
                />
                <div className="audio-supported-formats">
                  {UI_CONSTANTS.MESSAGES.AUDIO_FORMATS_SUPPORTED}
                </div>
                {errorMessage && (
                  <div className="audio-error-message">
                    {UI_CONSTANTS.ICONS.WARNING} {errorMessage}
                  </div>
                )}
              </div>
            )}

            <div className="audio-volume-control">
              <label className="audio-volume-label">
                {UI_CONSTANTS.TEXT.VOLUME} {Math.round(audioVolume * UI_CONSTANTS.PERCENTAGE_MULTIPLIER)}%
              </label>
              <input
                type="range"
                min={AUDIO_CONSTANTS.VOLUME_SLIDER_MIN}
                max={AUDIO_CONSTANTS.VOLUME_SLIDER_MAX}
                step={AUDIO_CONSTANTS.VOLUME_SLIDER_STEP}
                value={audioVolume}
                onChange={handleVolumeChange}
                className="audio-volume-slider"
              />
            </div>
          </div>
        </div>
      )}

      <audio ref={audioRef} loop />
    </div>
  );
};

export default EventBanner;
