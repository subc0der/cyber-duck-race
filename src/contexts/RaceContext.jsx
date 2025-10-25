import { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { UI_CONSTANTS, AUDIO_CONSTANTS } from '../utils/constants';

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
    currentRaceResult: null,
    participants: [],
    eventName: '',
    audioFile: null,
    audioVolume: AUDIO_CONSTANTS.MUSIC_VOLUME,
    audioRef: null,
    winner: null,
    countdown: null,
  });

  const countdownIntervalRef = useRef(null);

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

  const endRace = useCallback((winners) => {
    setRaceState((prev) => ({
      ...prev,
      isRacing: false,
      winner: winners.first, // Keep for WinnerModal compatibility
      currentRace: null,
      currentRaceResult: {
        first: winners.first,
        second: winners.second,
        third: winners.third,
        timestamp: Date.now(),
      },
    }));
  }, []);

  const addParticipant = useCallback((name) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, error: 'Name cannot be empty' };
    }

    // Use ref to capture validation result from within setState
    let validationResult = { success: false };

    setRaceState((prev) => {
      // Perform all validation within updater to avoid external dependencies
      if (prev.participants.length >= UI_CONSTANTS.MAX_PARTICIPANTS) {
        validationResult = { success: false, error: `Maximum ${UI_CONSTANTS.MAX_PARTICIPANTS} participants allowed` };
        return prev; // No state change
      }

      if (prev.participants.some((p) => p.name === trimmedName)) {
        validationResult = { success: false, error: 'Participant already exists' };
        return prev; // No state change
      }

      // Validation passed, update state
      validationResult = { success: true };
      return {
        ...prev,
        participants: [...prev.participants, {
          id: Date.now(),
          name: trimmedName,
        }],
      };
    });

    return validationResult;
  }, []); // No dependencies - all state accessed through updater function

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
    setRaceState((prev) => {
      // Reset audio if it exists
      if (prev.audioRef) {
        prev.audioRef.pause();
        prev.audioRef.currentTime = 0;
      }

      return {
        ...prev,
        isRacing: false,
        winner: null,
        currentRace: null,
      };
    });
  }, []);

  const closeWinnerModal = useCallback(() => {
    setRaceState((prev) => ({
      ...prev,
      winner: null,
    }));
  }, []);

  const startCountdown = useCallback((onComplete, onAudioStart) => {
    // Clear any existing countdown
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    let count = UI_CONSTANTS.COUNTDOWN_START_VALUE;
    setRaceState((prev) => ({ ...prev, countdown: count }));

    countdownIntervalRef.current = setInterval(() => {
      count--;
      if (count === 1 && onAudioStart) {
        onAudioStart();
      }
      if (count > 0) {
        setRaceState((prev) => ({ ...prev, countdown: count }));
      } else {
        setRaceState((prev) => ({ ...prev, countdown: 'GO!' }));
        setTimeout(() => {
          setRaceState((prev) => ({ ...prev, countdown: null }));
          if (onComplete) onComplete();
        }, UI_CONSTANTS.COUNTDOWN_GO_DELAY);
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }
    }, UI_CONSTANTS.COUNTDOWN_INTERVAL);
  }, []);

  // Cleanup countdown interval on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const value = useMemo(() => ({
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
    startCountdown,
  }), [
    raceState,
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
    startCountdown,
  ]);

  return (
    <RaceContext.Provider value={value}>
      {children}
    </RaceContext.Provider>
  );
};