import { useState, useRef, useEffect } from 'react';
import { useRace } from '../contexts/RaceContext';
import { UI_CONSTANTS, AUDIO_CONSTANTS } from '../utils/constants';
import '../styles/EventBanner.css';

const EventBanner = () => {
  const { eventName, setEventName, audioFile, setAudioFile, audioVolume, setAudioVolume, audioRef } = useRace();
  const [showAudioPanel, setShowAudioPanel] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldRepeat, setShouldRepeat] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  // Cleanup error timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Attach audio event listeners once
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Update volume separately to avoid re-attaching listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = audioVolume;
    }
  }, [audioVolume]);

  // Cleanup blob URL to prevent memory leaks
  useEffect(() => {
    const currentUrl = audioFile?.url;

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [audioFile]);

  const showError = (message) => {
    setErrorMessage(message);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => {
      setErrorMessage('');
      errorTimeoutRef.current = null;
    }, 3000);
  };

  const handleChange = (e) => {
    setEventName(e.target.value);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size
      if (file.size > AUDIO_CONSTANTS.MAX_FILE_SIZE_BYTES) {
        showError(`File size exceeds ${AUDIO_CONSTANTS.MAX_FILE_SIZE_MB}MB limit. Please select a smaller file.`);
        e.target.value = ''; // Reset file input
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
        showError('Please select an MP3, WAV, or FLAC file.');
        e.target.value = ''; // Reset file input
      }
    }
  };

  const handleRemoveAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    // Blob URL cleanup is handled by useEffect cleanup
    setAudioFile(null);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (!audioFile || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.warn('Failed to play audio:', err);
      });
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
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
          title="Audio Controls"
          aria-label="Audio Controls"
        >
          🔊
        </button>

        <input
          type="text"
          className="event-banner-input"
          value={eventName}
          onChange={handleChange}
          placeholder="Enter Event Name (Optional)"
          maxLength={UI_CONSTANTS.MAX_EVENT_NAME_LENGTH}
          aria-label="Event name"
        />
      </div>

      {showAudioPanel && (
        <div className="audio-upload-panel-banner">
          <div className="audio-panel-header">
            <h3 className="audio-panel-title">Background Music</h3>
            <button
              className="audio-close-btn"
              onClick={() => setShowAudioPanel(false)}
              aria-label="Close audio panel"
            >
              ×
            </button>
          </div>

          <div className="audio-panel-body">
            {errorMessage && (
              <div className="audio-error-message">
                {errorMessage}
              </div>
            )}

            {audioFile ? (
              <div className="audio-file-info">
                <div className="audio-file-name">
                  🎵 {audioFile.name}
                </div>

                <div className="audio-controls-section">
                  <button
                    className="audio-control-btn"
                    onClick={handlePlayPause}
                    title={isPlaying ? 'Pause' : 'Play'}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                  <button
                    className="audio-control-btn"
                    onClick={handleStop}
                    title="Stop"
                    aria-label="Stop"
                  >
                    ⏹️
                  </button>
                  <button
                    className={`audio-control-btn ${shouldRepeat ? 'active' : ''}`}
                    onClick={handleRepeatToggle}
                    title={shouldRepeat ? 'Repeat On' : 'Repeat Off'}
                    aria-label={shouldRepeat ? 'Repeat On' : 'Repeat Off'}
                  >
                    🔁
                  </button>
                </div>

                <button
                  className="audio-remove-btn"
                  onClick={handleRemoveAudio}
                >
                  Remove Audio
                </button>
              </div>
            ) : (
              <div className="audio-upload-section">
                <p className="audio-upload-hint">
                  Upload an audio file to play during races
                </p>
                <button
                  className="audio-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Audio File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.wav,.flac,audio/mpeg,audio/mp3,audio/wav,audio/flac"
                  onChange={handleFileSelect}
                  className="audio-file-input"
                />
                <div className="audio-supported-formats">
                  Supported: MP3, WAV, FLAC
                </div>
              </div>
            )}

            <div className="audio-volume-control">
              <label className="audio-volume-label">
                Volume: {Math.round(audioVolume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
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
