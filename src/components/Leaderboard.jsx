import { useRace } from '../contexts/RaceContext';
import { RACE_CONSTANTS, UI_CONSTANTS } from '../utils/constants';
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
        <h2 className="panel-title">{UI_CONSTANTS.TITLES.RACE_RESULTS}</h2>
        <span className="races-count">{UI_CONSTANTS.TEXT.CURRENT_RACE}</span>
      </div>

      <div className="leaderboard-body">
        {topFinishers.length === 0 ? (
          <div className="no-races">{UI_CONSTANTS.MESSAGES.RACE_NOT_COMPLETED}</div>
        ) : (
          <div className="leaderboard-list">
            <div className="leaderboard-header-row">
              <span className="rank-header">{UI_CONSTANTS.TEXT.PLACE}</span>
              <span className="name-header">{UI_CONSTANTS.TEXT.PARTICIPANT}</span>
              <span className="wins-header">{UI_CONSTANTS.TEXT.POSITION}</span>
            </div>
            {topFinishers.map((finisher) => (
              <div key={finisher.id} className="leaderboard-item" style={{ borderLeft: `4px solid ${finisher.color}` }}>
                <span className="rank">
                  {finisher.place === 1 && `${UI_CONSTANTS.ICONS.GOLD_MEDAL} ${UI_CONSTANTS.TEXT.FIRST_PLACE}`}
                  {finisher.place === 2 && `${UI_CONSTANTS.ICONS.SILVER_MEDAL} ${UI_CONSTANTS.TEXT.SECOND_PLACE}`}
                  {finisher.place === 3 && `${UI_CONSTANTS.ICONS.BRONZE_MEDAL} ${UI_CONSTANTS.TEXT.THIRD_PLACE}`}
                </span>
                <span className="name">{finisher.name}</span>
                <span className="wins">{Math.round(finisher.position)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="stats-section">
          <h3 className="section-title">{UI_CONSTANTS.TEXT.RACE_INFO}</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">{UI_CONSTANTS.TEXT.RACE_DURATION}</span>
              <span className="stat-value">{RACE_CONSTANTS.RACE_DURATION}s</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{UI_CONSTANTS.TEXT.FIRST_PLACE_LABEL}</span>
              <span className="stat-value">
                {currentRace && currentRace.first ? currentRace.first.name : UI_CONSTANTS.TEXT.NOT_AVAILABLE}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{UI_CONSTANTS.TEXT.PARTICIPANTS_LABEL}</span>
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