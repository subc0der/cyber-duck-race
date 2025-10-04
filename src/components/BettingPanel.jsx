import { useState } from 'react';
import { DUCK_CONSTANTS } from '../utils/constants';
import '../styles/BettingPanel.css';

const BettingPanel = ({ isRacing, disabled }) => {
  const [selectedDuck, setSelectedDuck] = useState(null);
  const [betAmount, setBetAmount] = useState(100);
  const [bets, setBets] = useState([]);

  const ducks = DUCK_CONSTANTS.DUCK_NAMES.map((name, index) => ({
    id: index,
    name,
    color: DUCK_CONSTANTS.DUCK_COLORS[index],
    odds: Math.floor(Math.random() * 4) + 2,
  }));

  const handlePlaceBet = () => {
    if (selectedDuck && betAmount > 0) {
      setBets([...bets, {
        duck: selectedDuck,
        amount: betAmount,
        odds: selectedDuck.odds,
      }]);
      setSelectedDuck(null);
      setBetAmount(100);
    }
  };

  const handleClearBets = () => {
    setBets([]);
  };

  return (
    <div className="betting-panel">
      <div className="betting-panel-header">
        <h2 className="panel-title">BETTING STATION</h2>
      </div>

      <div className="betting-panel-body">
        <div className="duck-selection">
          <h3 className="section-title">SELECT DUCK</h3>
          <div className="duck-grid">
            {ducks.map((duck) => (
              <button
                key={duck.id}
                className={`duck-option ${selectedDuck?.id === duck.id ? 'selected' : ''}`}
                onClick={() => setSelectedDuck(duck)}
                disabled={disabled}
                style={{ '--duck-color': duck.color }}
              >
                <span className="duck-name">{duck.name}</span>
                <span className="duck-odds">{duck.odds}:1</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bet-controls">
          <div className="bet-amount">
            <label className="amount-label">BET AMOUNT</label>
            <input
              type="number"
              className="amount-input"
              value={betAmount}
              onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
              min="10"
              max="10000"
              step="10"
              disabled={disabled}
            />
          </div>

          <div className="bet-actions">
            <button
              className="btn btn-bet"
              onClick={handlePlaceBet}
              disabled={!selectedDuck || betAmount <= 0 || disabled}
            >
              PLACE BET
            </button>
            <button
              className="btn btn-clear"
              onClick={handleClearBets}
              disabled={bets.length === 0 || disabled}
            >
              CLEAR ALL
            </button>
          </div>
        </div>

        <div className="active-bets">
          <h3 className="section-title">ACTIVE BETS</h3>
          {bets.length === 0 ? (
            <div className="no-bets">No active bets</div>
          ) : (
            <div className="bets-list">
              {bets.map((bet, index) => (
                <div key={index} className="bet-item">
                  <span className="bet-duck" style={{ color: bet.duck.color }}>
                    {bet.duck.name}
                  </span>
                  <span className="bet-details">
                    ${bet.amount} @ {bet.odds}:1
                  </span>
                  <span className="bet-potential">
                    Win: ${bet.amount * bet.odds}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BettingPanel;