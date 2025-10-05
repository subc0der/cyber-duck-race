import { useState, useRef, useEffect } from 'react';
import { UI_CONSTANTS } from '../utils/constants';

export const useCountdown = (onCountdownEnd, onAudioStart) => {
  const [countdown, setCountdown] = useState(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Cleanup timers on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startCountdown = () => {
    // Clear any existing timers
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    let count = UI_CONSTANTS.COUNTDOWN_START_VALUE;
    setCountdown(count);
    setIsCountingDown(true);

    intervalRef.current = setInterval(() => {
      count--;

      if (count === 1 && onAudioStart) {
        onAudioStart();
      }

      if (count === 0) {
        // Go straight to GO! without showing 0
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setCountdown('GO!');
        timeoutRef.current = setTimeout(() => {
          onCountdownEnd();
          setCountdown(null);
          setIsCountingDown(false);
          timeoutRef.current = null;
        }, UI_CONSTANTS.COUNTDOWN_GO_DELAY);
      } else {
        setCountdown(count);
      }
    }, UI_CONSTANTS.COUNTDOWN_INTERVAL);
  };

  const resetCountdown = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCountdown(null);
    setIsCountingDown(false);
  };

  return { countdown, isCountingDown, startCountdown, resetCountdown };
};
