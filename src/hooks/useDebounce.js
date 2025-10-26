import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value.
 * Returns the debounced value after the specified delay.
 *
 * @param {*} value - The value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {*} The debounced value
 *
 * Example usage:
 * ```javascript
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   // This effect runs after user stops typing for 500ms
 *   fetchResults(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 * ```
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up timeout to update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function clears timeout if value changes before delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
