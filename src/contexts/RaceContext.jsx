import { createContext, useContext, useState, useCallback } from 'react';

const RaceContext = createContext();

export const useRace = () => {
  const context = useContext(RaceContext);
  if (!context) {
    throw new Error('useRace must be used within a RaceProvider');
  }
  return context;
};

export const RaceProvider = ({ children }) => {
  const [raceState, setRaceState] = useState({
    isRacing: false,
    currentRace: null,
    raceHistory: [],
    bets: [],
    balance: 10000,
  });

  const startRace = useCallback(() => {
    setRaceState((prev) => ({
      ...prev,
      isRacing: true,
      currentRace: {
        startTime: Date.now(),
        ducks: [],
      },
    }));
  }, []);

  const endRace = useCallback((winner) => {
    setRaceState((prev) => ({
      ...prev,
      isRacing: false,
      currentRace: null,
      raceHistory: [...prev.raceHistory, {
        winner,
        timestamp: Date.now(),
      }],
    }));
  }, []);

  const placeBet = useCallback((duck, amount) => {
    setRaceState((prev) => {
      if (prev.balance < amount) return prev;

      return {
        ...prev,
        balance: prev.balance - amount,
        bets: [...prev.bets, {
          duck,
          amount,
          timestamp: Date.now(),
        }],
      };
    });
  }, []);

  const clearBets = useCallback(() => {
    setRaceState((prev) => ({
      ...prev,
      bets: [],
    }));
  }, []);

  const value = {
    ...raceState,
    startRace,
    endRace,
    placeBet,
    clearBets,
  };

  return (
    <RaceContext.Provider value={value}>
      {children}
    </RaceContext.Provider>
  );
};