import { createContext, useContext, useState, useCallback } from 'react';
import { UI_CONSTANTS } from '../utils/constants';

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
    participants: [],
    eventName: '',
    audioFile: null,
    audioVolume: 0.5,
    audioRef: null,
    winner: null,
  });

  const startRace = useCallback(() => {
    setRaceState((prev) => ({
      ...prev,
      isRacing: true,
      winner: null,
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
      winner,
      currentRace: null,
      raceHistory: [...prev.raceHistory, {
        winner,
        timestamp: Date.now(),
      }],
    }));
  }, []);

  const addParticipant = useCallback((name) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, error: 'Name cannot be empty' };
    }

    let result = { success: false };

    setRaceState((prev) => {
      if (prev.participants.length >= UI_CONSTANTS.MAX_PARTICIPANTS) {
        result = { success: false, error: `Maximum ${UI_CONSTANTS.MAX_PARTICIPANTS} participants allowed` };
        return prev;
      }

      if (prev.participants.some((p) => p.name === trimmedName)) {
        result = { success: false, error: 'Participant already exists' };
        return prev;
      }

      result = { success: true };
      return {
        ...prev,
        participants: [...prev.participants, {
          id: Date.now(),
          name: trimmedName,
        }],
      };
    });

    return result;
  }, []);

  const removeParticipant = useCallback((id) => {
    setRaceState((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p.id !== id),
    }));
  }, []);

  const clearParticipants = useCallback(() => {
    setRaceState((prev) => ({
      ...prev,
      participants: [],
    }));
  }, []);

  const setEventName = useCallback((name) => {
    setRaceState((prev) => ({
      ...prev,
      eventName: name,
    }));
  }, []);

  const setAudioFile = useCallback((file) => {
    setRaceState((prev) => ({
      ...prev,
      audioFile: file,
    }));
  }, []);

  const setAudioVolume = useCallback((volume) => {
    setRaceState((prev) => ({
      ...prev,
      audioVolume: volume,
    }));
  }, []);

  const setAudioRef = useCallback((ref) => {
    setRaceState((prev) => ({
      ...prev,
      audioRef: ref,
    }));
  }, []);

  const resetRace = useCallback(() => {
    setRaceState((prev) => ({
      ...prev,
      isRacing: false,
      winner: null,
      currentRace: null,
    }));
  }, []);

  const closeWinnerModal = useCallback(() => {
    setRaceState((prev) => ({
      ...prev,
      winner: null,
    }));
  }, []);

  const value = {
    ...raceState,
    startRace,
    endRace,
    resetRace,
    closeWinnerModal,
    addParticipant,
    removeParticipant,
    clearParticipants,
    setEventName,
    setAudioFile,
    setAudioVolume,
    setAudioRef,
  };

  return (
    <RaceContext.Provider value={value}>
      {children}
    </RaceContext.Provider>
  );
};