import { UI_CONSTANTS } from '../utils/constants';
import '../styles/Leaderboard.css';

const Leaderboard = ({ raceHistory }) => {
  const getLeaderboardData = () => {
    const duckWins = {};

    raceHistory.forEach((race) => {
      if (race && race.winner && race.winner.name) {
        duckWins[race.winner.name] = (duckWins[race.winner.name] || 0) + 1;
      }
    });

    return Object.entries(duckWins)
      .map(([name, wins]) => ({ name, wins }))
      .sort((a, b) => b.wins - a.wins)
      .slice(0, UI_CONSTANTS.MAX_LEADERBOARD_ENTRIES);
  };

  const leaderboardData = getLeaderboardData();

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2 className="panel-title">LEADERBOARD</h2>
        <span className="races-count">Total Races: {raceHistory.length}</span>
      </div>

      <div className="leaderboard-body">
        {leaderboardData.length === 0 ? (
          <div className="no-races">No races completed yet</div>
        ) : (
          <div className="leaderboard-list">
            <div className="leaderboard-header-row">
              <span className="rank-header">RANK</span>
              <span className="name-header">PARTICIPANT</span>
              <span className="wins-header">WINS</span>
            </div>
            {leaderboardData.map((duck, index) => (
              <div key={index} className="leaderboard-item">
                <span className="rank">
                  {index === UI_CONSTANTS.RANK_FIRST_PLACE && '🏆'}
                  {index === UI_CONSTANTS.RANK_SECOND_PLACE && '🥈'}
                  {index === UI_CONSTANTS.RANK_THIRD_PLACE && '🥉'}
                  {index > UI_CONSTANTS.RANK_THIRD_PLACE && `#${index + UI_CONSTANTS.RANK_DISPLAY_OFFSET}`}
                </span>
                <span className="name">{duck.name}</span>
                <span className="wins">{duck.wins}</span>
              </div>
            ))}
          </div>
        )}

        <div className="stats-section">
          <h3 className="section-title">RAFFLE STATS</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">TOTAL RAFFLES</span>
              <span className="stat-value">{raceHistory.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">UNIQUE WINNERS</span>
              <span className="stat-value">{leaderboardData.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">LAST WINNER</span>
              <span className="stat-value">
                {raceHistory.length > UI_CONSTANTS.DEFAULT_WIN_COUNT ? raceHistory[raceHistory.length - UI_CONSTANTS.LAST_RACE_INDEX_OFFSET].winner.name : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;