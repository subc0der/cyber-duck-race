import { UI_CONSTANTS } from './constants';

/**
 * Parses a bulk text input containing multiple names in various formats.
 * Supports newline-separated, comma-separated, tab-separated, and numbered lists.
 *
 * @param {string} text - Raw text input containing names
 * @returns {string[]} Array of cleaned, unique names (trimmed and deduplicated)
 *
 * Supported formats:
 * - Newline-separated: "John\nJane\nBob"
 * - Comma-separated: "John, Jane, Bob"
 * - Tab-separated: "John\tJane\tBob" (e.g., from Excel)
 * - Numbered lists: "1. John\n2. Jane\n3. Bob"
 * - Mixed formats: "John, Jane\nBob"
 */
export const parseNameList = (text) => {
  // Input validation
  if (typeof text !== 'string' || !text.trim()) {
    return [];
  }

  // Replace all delimiters (comma, tab, newline) with a single delimiter (newline)
  const uniformText = text.replace(/[,\t]+/g, '\n');

  // Split into an array, then clean, validate, and filter each name
  const names = uniformText
    .split('\n')
    .map((name) => {
      // Remove numbered list prefixes and trim whitespace
      return name.replace(/^\d+[.):-]\s*/, '').trim();
    })
    .filter((name) => {
      // Filter out empty strings and names that are too long
      return name && name.length > 0 && name.length <= UI_CONSTANTS.MAX_PARTICIPANT_NAME_LENGTH;
    });

  // Remove duplicates while preserving order
  return [...new Set(names)];
};

/**
 * Validates and prepares a list of names for bulk import.
 * Handles deduplication against existing participants and enforces max limit.
 *
 * @param {string[]} nameList - Array of names to import
 * @param {Object[]} existingParticipants - Current participants with {id, name}
 * @returns {Object} Result object with filtered names and status info
 * @returns {string[]} result.validNames - Names ready to import
 * @returns {number} result.duplicateCount - Number of duplicates skipped
 * @returns {number} result.limitReached - Number of names skipped due to max limit
 * @returns {number} result.totalParsed - Total names parsed from input
 */
export const prepareNamesForImport = (nameList, existingParticipants) => {
  // Input validation
  if (!Array.isArray(nameList) || !Array.isArray(existingParticipants)) {
    return {
      validNames: [],
      duplicateCount: 0,
      limitReached: 0,
      totalParsed: 0,
    };
  }

  const existingNames = new Set(existingParticipants.map((p) => p.name));
  const currentCount = existingParticipants.length;
  const availableSlots = UI_CONSTANTS.MAX_PARTICIPANTS - currentCount;

  let duplicateCount = 0;
  let limitReached = 0;
  const validNames = [];

  for (let i = 0; i < nameList.length; i++) {
    const name = nameList[i];

    // Check if already exists
    if (existingNames.has(name)) {
      duplicateCount++;
      continue;
    }

    // Check if we've hit the limit
    if (validNames.length >= availableSlots) {
      limitReached = nameList.length - i;
      break;
    }

    validNames.push(name);
    existingNames.add(name); // Prevent duplicates within the import batch
  }

  return {
    validNames,
    duplicateCount,
    limitReached,
    totalParsed: nameList.length,
  };
};
