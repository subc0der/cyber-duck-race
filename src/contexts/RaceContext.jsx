import { createContext, useContext, useState, useCallback, useRef } from 'react';
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
  const audioRef = useRef(null);

  const [raceState, setRaceState] = useState({
    isRacing: false,
    currentRace: null,
    raceHistory: [],
    participants: [],
    eventName: '',
    audioFile: null,
    audioVolume: 0.5,
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

    // Compute validation synchronously before setState
    const currentParticipants = raceState.participants;

    if (currentParticipants.length >= UI_CONSTANTS.MAX_PARTICIPANTS) {
      return { success: false, error: `Maximum ${UI_CONSTANTS.MAX_PARTICIPANTS} participants allowed` };
    }

    if (currentParticipants.some((p) => p.name === trimmedName)) {
      return { success: false, error: 'Participant already exists' };
    }

    // Only update state if validation passed
    setRaceState((prev) => ({
      ...prev,
      participants: [...prev.participants, {
        id: Date.now(),
        name: trimmedName,
      }],
    }));

    return { success: true };
  }, [raceState.participants]);

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
    audioRef,
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
  };

  return (
    <RaceContext.Provider value={value}>
      {children}
    </RaceContext.Provider>
  );
};