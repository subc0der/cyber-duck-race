import { useCallback } from 'react';
import RaceTrack from './components/RaceTrack';
import ControlPanel from './components/ControlPanel';
import Leaderboard from './components/Leaderboard';
import WinnerModal from './components/WinnerModal';
import ParticipantManager from './components/ParticipantManager';
import EventBanner from './components/EventBanner';
import ErrorBoundary from './components/ErrorBoundary';
import { RaceProvider, useRace } from './contexts/RaceContext';
import { UI_CONSTANTS } from './utils/constants';
import './styles/App.css';

function AppContent() {
  const {
    isRacing,
    winner,
    raceHistory,
    audioFile,
    audioVolume,
    audioRef,
    startRace,
    endRace,
    resetRace,
    closeWinnerModal
  } = useRace();

  const handleRaceStart = useCallback(() => {
    startRace();
  }, [startRace]);

  const handleRaceEnd = useCallback((winnerData) => {
    endRace(winnerData);
  }, [endRace]);

  const handleResetRace = useCallback(() => {
    resetRace();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [resetRace, audioRef]);

  const handleAudioStart = useCallback(() => {
    if (audioFile && audioFile.url && audioRef.current) {
      audioRef.current.src = audioFile.url;
      audioRef.current.volume = audioVolume;
      audioRef.current.play().catch((err) => {
        console.warn('Failed to play audio:', err);
      });
    }
  }, [audioFile, audioVolume, audioRef]);

  return (
    <div className="app">
      <EventBanner />

        <div className="app-header">
          <h1 className="app-title">CYBER DUCK RACE</h1>
          <div className="app-subtitle">Welcome to Neo-Quackyo {UI_CONSTANTS.GAME_YEAR}</div>
        </div>

        <div className="app-content">
          <div className="left-panel">
            <ParticipantManager />
          </div>

          <div className="main-panel">
            <RaceTrack
              isRacing={isRacing}
              onRaceEnd={handleRaceEnd}
            />
          </div>

          <div className="side-panel">
            <ControlPanel
              isRacing={isRacing}
              onStartRace={handleRaceStart}
              onResetRace={handleResetRace}
              onAudioStart={handleAudioStart}
            />
            <Leaderboard
              raceHistory={raceHistory}
            />
          </div>
        </div>

        {winner && (
          <WinnerModal
            winner={winner}
            onClose={closeWinnerModal}
          />
        )}

        <div className="app-footer">
          <div className="footer-text">
            Powered by CyberDuck Industries © {UI_CONSTANTS.GAME_YEAR}
          </div>
        </div>
      </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <RaceProvider>
        <AppContent />
      </RaceProvider>
    </ErrorBoundary>
  );
}

export default App;