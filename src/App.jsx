import { useState, useCallback } from 'react';
import RaceTrack from './components/RaceTrack';
import ControlPanel from './components/ControlPanel';
import BettingPanel from './components/BettingPanel';
import Leaderboard from './components/Leaderboard';
import WinnerModal from './components/WinnerModal';
import { RaceProvider } from './contexts/RaceContext';
import './styles/App.css';

function App() {
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState(null);
  const [raceHistory, setRaceHistory] = useState([]);

  const handleRaceStart = useCallback(() => {
    setIsRacing(true);
    setWinner(null);
  }, []);

  const handleRaceEnd = useCallback((winnerData) => {
    setIsRacing(false);
    setWinner(winnerData);
    setRaceHistory((prev) => [...prev, winnerData]);
  }, []);

  const handleResetRace = useCallback(() => {
    setIsRacing(false);
    setWinner(null);
  }, []);

  return (
    <RaceProvider>
      <div className="app">
        <div className="app-header">
          <h1 className="app-title">CYBER DUCK RACE</h1>
          <div className="app-subtitle">Welcome to Neo-Quackyo 2099</div>
        </div>

        <div className="app-content">
          <div className="main-panel">
            <RaceTrack
              isRacing={isRacing}
              onRaceEnd={handleRaceEnd}
            />
            <ControlPanel
              isRacing={isRacing}
              onStartRace={handleRaceStart}
              onResetRace={handleResetRace}
            />
          </div>

          <div className="side-panel">
            <BettingPanel
              isRacing={isRacing}
              disabled={isRacing}
            />
            <Leaderboard
              raceHistory={raceHistory}
            />
          </div>
        </div>

        {winner && (
          <WinnerModal
            winner={winner}
            onClose={() => setWinner(null)}
          />
        )}

        <div className="app-footer">
          <div className="footer-text">
            Powered by CyberDuck Industries © 2099
          </div>
        </div>
      </div>
    </RaceProvider>
  );
}

export default App;