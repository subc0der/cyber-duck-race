import { useState, useRef, useEffect } from 'react';
import { useRace } from '../contexts/RaceContext';
import { UI_CONSTANTS, AUDIO_CONSTANTS } from '../utils/constants';
import '../styles/EventBanner.css';

const EventBanner = () => {
  const { eventName, setEventName, audioFile, setAudioFile, audioVolume, setAudioVolume, setAudioRef } = useRace();
  const [showAudioPanel, setShowAudioPanel] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldRepeat, setShouldRepeat] = useState(true);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

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
    const file = e.target.files[UI_CONSTANTS.CANVAS_ORIGIN];
    if (file) {
      // Check file size
      if (file.size > AUDIO_CONSTANTS.MAX_FILE_SIZE_BYTES) {
        alert(`File size exceeds ${AUDIO_CONSTANTS.MAX_FILE_SIZE_MB}MB limit. Please select a smaller file.`);
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
        alert('Please select an MP3, WAV, or FLAC file.');
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
          title="Audio Controls"
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
        />
      </div>

      {showAudioPanel && (
        <div className="audio-upload-panel-banner">
          <div className="audio-panel-header">
            <h3 className="audio-panel-title">Background Music</h3>
            <button
              className="audio-close-btn"
              onClick={() => setShowAudioPanel(false)}
            >
              ×
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
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                  <button
                    className="audio-control-btn"
                    onClick={handleStop}
                    title="Stop"
                  >
                    ⏹️
                  </button>
                  <button
                    className={`audio-control-btn ${shouldRepeat ? 'active' : ''}`}
                    onClick={handleRepeatToggle}
                    title={shouldRepeat ? 'Repeat On' : 'Repeat Off'}
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
                  accept=".mp3,.wav,.flac,audio/mpeg,audio/wav,audio/flac"
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
