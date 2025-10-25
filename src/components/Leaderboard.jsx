import { useRace } from '../contexts/RaceContext';
import { RACE_CONSTANTS } from '../utils/constants';
import '../styles/Leaderboard.css';

const Leaderboard = () => {
  const { participants, currentRaceResult } = useRace();
  // Get the current race results
  const currentRace = currentRaceResult;

  const getTopFinishers = () => {
    if (!currentRace) return [];

    const finishers = [];
    if (currentRace.first) finishers.push({ place: 1, ...currentRace.first });
    if (currentRace.second) finishers.push({ place: 2, ...currentRace.second });
    if (currentRace.third) finishers.push({ place: 3, ...currentRace.third });

    return finishers;
  };

  const topFinishers = getTopFinishers();

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2 className="panel-title">RACE RESULTS</h2>
        <span className="races-count">Current Race</span>
      </div>

      <div className="leaderboard-body">
        {topFinishers.length === 0 ? (
          <div className="no-races">Race not completed yet</div>
        ) : (
          <div className="leaderboard-list">
            <div className="leaderboard-header-row">
              <span className="rank-header">PLACE</span>
              <span className="name-header">PARTICIPANT</span>
              <span className="wins-header">POSITION</span>
            </div>
            {topFinishers.map((finisher) => (
              <div key={finisher.id} className="leaderboard-item" style={{ borderLeft: `4px solid ${finisher.color}` }}>
                <span className="rank">
                  {finisher.place === 1 && '🏆 1st'}
                  {finisher.place === 2 && '🥈 2nd'}
                  {finisher.place === 3 && '🥉 3rd'}
                </span>
                <span className="name">{finisher.name}</span>
                <span className="wins">{Math.round(finisher.position)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="stats-section">
          <h3 className="section-title">RACE INFO</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">RACE DURATION</span>
              <span className="stat-value">{RACE_CONSTANTS.RACE_DURATION}s</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">1ST PLACE</span>
              <span className="stat-value">
                {currentRace && currentRace.first ? currentRace.first.name : 'N/A'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">PARTICIPANTS</span>
              <span className="stat-value">
                {participants.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;