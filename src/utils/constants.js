export const RACE_CONSTANTS = {
  RACE_DURATION: 15,
  SPEED_CHANGE_INTERVAL: 2000,
  MIN_SPEED_MULTIPLIER: 0.4,
  MAX_SPEED_MULTIPLIER: 2.0,
  BASE_SPEED: 100,
  FINISH_LINE_X: 4500,
  DUCK_START_X: 80,
  DUCK_SPACING: 80,
  // Final sprint timing (triggers dramatic surge near end of race)
  FINAL_SPRINT_START: 0.87, // 87% of RACE_DURATION when final sprint begins
  FINAL_SPRINT_END: 0.93, // 93% of RACE_DURATION when final sprint ends
  // Speed change timing for realistic racing dynamics
  SPEED_CHANGE_MIN_INTERVAL_MS: 1000, // Minimum 1 second between speed changes
  SPEED_CHANGE_MAX_INTERVAL_MS: 2000, // Random additional interval up to 2 seconds (total interval: 1s to 3s)
};

export const VISUAL_CONSTANTS = {
  BACKGROUND_SCROLL_SPEED: 300,
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  // Background rendering
  BACKGROUND_RECT_ORIGIN: 0,
  // Duck rendering
  DUCK_WIDTH: 25,
  DUCK_HEIGHT: 20,
  DUCK_EYE_SIZE: 3,
  DUCK_EYE_OFFSET_X: 8,
  DUCK_EYE_OFFSET_Y: 5,
  DUCK_EYE_COLOR: '#ffffff',
  DUCK_NAME_OFFSET_X: 35,
  DUCK_NAME_OFFSET_Y: 5,
  DUCK_NAME_FONT: 'bold 24px monospace',
  DUCK_GLOW_BLUR: 15,
  // Thrust trail VFX
  TRAIL_LENGTH: 120, // Length of trail behind duck in pixels (chosen for dramatic effect)
  TRAIL_WIDTH_START: 20, // Width at duck (thickest part)
  TRAIL_WIDTH_END: 4, // Width at trail end (thinnest part)
  TRAIL_WIDTH_DUCK_SCALE: 0.7, // Multiplier applied to TRAIL_WIDTH_START for width at duck position
  TRAIL_OPACITY_START: 0.6, // Opacity at duck
  TRAIL_OPACITY_END: 0, // Opacity at trail end (fully transparent)
  TRAIL_GRADIENT_STOP_MID: 0.3, // Gradient stop position for middle fade point (0-1 range)
  TRAIL_GRADIENT_STOP_FAR: 0.7, // Gradient stop position for far fade point (0-1 range)
  TRAIL_GRADIENT_MID_OPACITY: 0.6, // Opacity multiplier at mid gradient stop
  TRAIL_GRADIENT_FAR_OPACITY: 0.3, // Opacity multiplier at far gradient stop
  TRAIL_PULSE_FREQUENCY: 3, // Pulse frequency in Hz for trail animation
  TRAIL_PULSE_MIN: 0.85, // Minimum pulse intensity (0-1 range)
  TRAIL_PULSE_AMPLITUDE: 0.15, // Pulse amplitude variation (0-1 range)
  TRAIL_CURVE_CONTROL_POINT: 0.3, // Bezier curve control point multiplier for concave shape
  TRAIL_GLOW_INTENSITY: 0.8, // Shadow blur intensity multiplier for trail glow effect
  TRAIL_SPEED_FACTOR_MIN: 0.3, // Minimum speed multiplier for trail visual effects
  TRAIL_SPEED_FACTOR_MAX: 2.0, // Maximum speed multiplier for trail visual effects
  // UI positioning
  INFO_TEXT_GLOW_BLUR: 5,
  // Race info box
  RACE_INFO_BOX_WIDTH: 200,
  RACE_INFO_BOX_HEIGHT: 80,
  RACE_INFO_BOX_PADDING: 15,
  RACE_INFO_BOX_MARGIN: 20,
  RACE_INFO_BOX_BACKGROUND: 'rgba(10, 10, 10, 0.8)',
  RACE_INFO_BOX_BORDER_COLOR: '#00ffff',
  RACE_INFO_BOX_BORDER_WIDTH: 2,
  RACE_INFO_BOX_TEXT_COLOR: '#00ffff',
  RACE_INFO_BOX_FONT: 'bold 18px monospace',
  RACE_INFO_LINE_HEIGHT: 30,
  RACE_INFO_TEXT_BASELINE_OFFSET: 20,
};

export const DUCK_CONSTANTS = {
  DUCK_NAMES: ['NEON', 'CYBER', 'MATRIX', 'BLADE', 'GHOST', 'CHROME'],
  DUCK_COLORS: ['#00ffff', '#ff00ff', '#9d00ff', '#ffff00', '#00ff00', '#ff0099'],
  // Duck movement
  DUCK_VERTICAL_MOVEMENT_CHANCE: 0.02,
  DUCK_VERTICAL_VARIANCE: 4,
  // Lane-based positioning - evenly spread across bottom half
  LANE_PADDING: 10,
  MAX_LANE_HEIGHT: 80,
  // Vertical positioning - bottom half of screen (top half = 0.5)
  RACE_AREA_TOP_FRACTION: 0.5,
  RACE_AREA_BOTTOM_PADDING: 20,
  // Display bounds (max = 3/4 of canvas width = 600px)
  DUCK_MIN_DISPLAY_X: 50,
  DUCK_MAX_DISPLAY_X: 600,
};

export const PHYSICS_CONSTANTS = {
  POSITION_UPDATE_RATE: 60,
  // Position thresholds
  // Minimum distance (in pixels) for minimal rubber-banding adjustments.
  // POSITION_THRESHOLD_DISTANCE balances responsiveness and prevents jitter in close races.
  POSITION_THRESHOLD_DISTANCE: 50,
  // Rubber-banding factors for minimal race balance
  RUBBER_BAND_CATCH_UP_FACTOR: 1.05, // 5% speed boost for stragglers
  RUBBER_BAND_LEAD_PENALTY_FACTOR: 0.95, // 5% speed reduction for leaders
  RUBBER_BAND_RANDOM_VARIANCE: 0.1, // ±5% random variance for natural movement
  // Duck characteristic ranges (random per duck for fair racing)
  BASE_SPEED_FACTOR_MIN: 0.85, // Slowest possible base speed multiplier
  BASE_SPEED_FACTOR_MAX: 1.15, // Fastest possible base speed multiplier (range = MAX - MIN)
  ACCELERATION_MIN: 0.08, // Slowest acceleration rate
  ACCELERATION_MAX: 0.12, // Fastest acceleration rate (range = MAX - MIN)
  STAMINA_MIN: 0.7, // Lowest stamina (tires easily)
  STAMINA_MAX: 1.0, // Highest stamina (range = MAX - MIN)
  // Speed variation for dramatic racing
  SPEED_BURST_MIN: 0.7, // Minimum speed multiplier for bursts/slowdowns
  SPEED_BURST_RANGE: 0.8, // Range for speed variation (max = MIN + RANGE)
  // Late race stamina effects
  LATE_RACE_THRESHOLD: 0.6, // 60% of race when stamina becomes a factor
  STAMINA_EFFECT_MIN: 0.7, // Minimum stamina multiplier effect
  STAMINA_EFFECT_RANGE: 0.6, // Range for stamina effect (max = MIN + RANGE)
  // Final sprint surge boost
  FINAL_SPRINT_BOOST_MIN: 1.5, // Minimum boost for final sprint surge
  FINAL_SPRINT_BOOST_RANGE: 0.5, // Range added to MIN for maximum boost
};

export const ACCESSIBILITY_CONSTANTS = {
  // ARIA live region announcement frequency for screen readers
  ANNOUNCEMENT_INTERVAL_MS: 3000, // Update screen readers every 3 seconds during race
};

export const UI_CONSTANTS = {
  MODAL_ANIMATION_DURATION: 300,
  COUNTDOWN_DURATION: 3000,
  WINNER_DISPLAY_DURATION: 5000,
  NOTIFICATION_DURATION: 3000,
  ERROR_MESSAGE_DURATION: 5000,
  BUTTON_DEBOUNCE: 500,
  PERCENTAGE_MULTIPLIER: 100, // For converting decimals to percentages (0.5 * 100 = 50%)
  // Countdown
  COUNTDOWN_START_VALUE: 3,
  COUNTDOWN_INTERVAL: 1000,
  COUNTDOWN_GO_DELAY: 500,
  // WinnerModal
  CONFETTI_COUNT: 50,
  CONFETTI_ANIMATION_DURATION: 3,
  CONFETTI_COLOR_COUNT: 4,
  CONFETTI_POSITION_RANGE: 100,
  DEFAULT_FINISH_TIME: '15.0',
  DEFAULT_SPEED: '100',
  // Animation frame timing
  FRAME_RATE_DIVISOR: 60,
  MILLISECONDS_TO_SECONDS: 1000,
  // Canvas positioning
  CANVAS_ORIGIN: 0,
  INITIAL_BACKGROUND_OFFSET: 0,
  // Gradient positioning
  GRADIENT_STOP_START: 0,
  GRADIENT_STOP_MIDDLE: 0.5,
  GRADIENT_STOP_END: 1,
  // App branding
  GAME_YEAR: 2099,
  // Leaderboard
  MAX_LEADERBOARD_ENTRIES: 10,
  RANK_FIRST_PLACE: 0,
  RANK_SECOND_PLACE: 1,
  RANK_THIRD_PLACE: 2,
  DEFAULT_WIN_COUNT: 0,
  RANK_DISPLAY_OFFSET: 1,
  LAST_RACE_INDEX_OFFSET: 1,
  // Participant management
  MAX_PARTICIPANT_NAME_LENGTH: 30,
  MAX_PARTICIPANTS: 25,
  PARTICIPANT_COUNT_SINGULAR: 1,
  PARTICIPANT_LIST_EMPTY: 0,
  // Bulk import
  BULK_IMPORT_TEXTAREA_ROWS: 10,
  BULK_IMPORT_SUCCESS_MESSAGE_DURATION: 3000,
  BULK_IMPORT_DEBOUNCE_DELAY: 300,
  // Used to force execution in a new macrotask in the event loop (e.g., via setTimeout(..., MACRO_TASK_DELAY))
  MACRO_TASK_DELAY: 0,
  // Event banner
  MAX_EVENT_NAME_LENGTH: 100,
  // UI Constants - Namespaced for better organization
  ICONS: {
    CLOSE: '×',
    SUCCESS: '✓',
    ERROR: '⚠',
    WARNING: '⚠️',
    REPEAT: '🔁',
    TROPHY: '🏆',
    PLAY: '▶️',
    PAUSE: '⏸️',
    STOP: '⏹️',
    IMPORT: '📋',
    GOLD_MEDAL: '🏆',
    SILVER_MEDAL: '🥈',
    BRONZE_MEDAL: '🥉',
  },
  TEXT: {
    ADD: 'Add',
    CANCEL: 'Cancel',
    IMPORT: 'Import',
    LIST: 'List',
    CLEAR_ALL: 'Clear All',
    CLOSE: 'CLOSE',
    REMOVE_AUDIO: 'Remove Audio',
    CHOOSE_AUDIO_FILE: 'Choose Audio File',
    FINISH_TIME: 'FINISH TIME',
    AVG_SPEED: 'AVG SPEED',
    CURRENT_RACE: 'Current Race',
    PLACE: 'PLACE',
    PARTICIPANT: 'PARTICIPANT',
    POSITION: 'POSITION',
    FIRST_PLACE: '1st',
    SECOND_PLACE: '2nd',
    THIRD_PLACE: '3rd',
    RACE_INFO: 'RACE INFO',
    RACE_DURATION: 'RACE DURATION',
    FIRST_PLACE_LABEL: '1ST PLACE',
    PARTICIPANTS_LABEL: 'PARTICIPANTS',
    NOT_AVAILABLE: 'N/A',
    PLAY: 'Play',
    PAUSE: 'Pause',
    STOP: 'Stop',
    REPEAT_ON: 'Repeat On',
    REPEAT_OFF: 'Repeat Off',
    VOLUME: 'Volume:',
  },
  TITLES: {
    RAFFLE_PARTICIPANTS: 'Raffle Participants',
    IMPORT_PARTICIPANT_LIST: 'Import Participant List',
    RACE_RESULTS: 'RACE RESULTS',
    WINNER: 'WINNER!',
    AUDIO_CONTROLS: 'Audio Controls',
    IMPORT_MULTIPLE: 'Import multiple participants at once',
    BACKGROUND_MUSIC: 'Background Music',
  },
  PLACEHOLDERS: {
    EVENT_NAME: 'Enter Event Name (Optional)',
    PARTICIPANT_NAME: 'Enter participant name',
    BULK_IMPORT: 'Paste names here (one per line, or comma-separated)',
  },
  MESSAGES: {
    NO_PARTICIPANTS: 'No participants yet',
    RACE_NOT_COMPLETED: 'Race not completed yet',
    NO_VALID_NAMES: 'No valid names to import',
    SUCCESSFULLY_IMPORTED: 'Successfully imported',
    PARTICIPANT: 'participant',
    PARTICIPANTS: 'participants',
    DUPLICATE_SKIPPED: 'duplicate',
    DUPLICATES_SKIPPED: 'duplicates',
    SKIPPED: 'skipped',
    SKIPPED_DUE_TO_LIMIT: 'skipped due to',
    PARTICIPANT_LIMIT: 'participant limit',
    UPLOAD_AUDIO_HINT: 'Upload an audio file to play during races',
    AUDIO_FORMATS_SUPPORTED: 'Supported: MP3, WAV, FLAC',
    FILE_SIZE_EXCEEDED: 'File size exceeds',
    MB_LIMIT: 'MB limit. Please select a smaller file.',
    INVALID_FILE_FORMAT: 'Please select an MP3, WAV, or FLAC file.',
    READY_TO_IMPORT: 'Ready to import:',
    NAME: 'name',
    NAMES: 'names',
    DUPLICATES_LABEL: 'Duplicates:',
    WILL_BE_SKIPPED: 'will be skipped',
    LIMIT_REACHED: 'Limit reached:',
    EXCEED: 'exceed',
    MAX: 'max',
  },
  ARIA_LABELS: {
    ADD_PARTICIPANT: 'Add participant to raffle',
    REMOVE_PARTICIPANT: 'Remove participant',
    CLEAR_ALL_PARTICIPANTS: 'Clear all participants from raffle',
    IMPORT_PARTICIPANTS: 'Import multiple participants',
    CLOSE_IMPORT_DIALOG: 'Close import dialog',
    CLOSE_WINNER_MODAL: 'Close winner modal',
    PASTE_PARTICIPANT_NAMES: 'Paste participant names',
    CLOSE_AUDIO_CONTROLS: 'Close audio controls panel',
    PLAY_AUDIO: 'Play audio',
    PAUSE_AUDIO: 'Pause audio',
    STOP_AUDIO: 'Stop audio',
    ENABLE_REPEAT: 'Enable repeat',
    DISABLE_REPEAT: 'Disable repeat',
    TOGGLE_AUDIO_CONTROLS: 'Toggle audio controls panel',
  },
};

// Audio file size limit constant for DRY principle
const MAX_FILE_SIZE_MB = 150;

export const AUDIO_CONSTANTS = {
  MASTER_VOLUME: 0.7,
  SFX_VOLUME: 0.8,
  MUSIC_VOLUME: 0.5,
  // Volume slider configuration
  VOLUME_SLIDER_MIN: 0,
  VOLUME_SLIDER_MAX: 1,
  VOLUME_SLIDER_STEP: 0.01,
  // Audio file size limits for uploaded background music
  MAX_FILE_SIZE_MB: MAX_FILE_SIZE_MB, // User-facing limit in megabytes
  // MAX_FILE_SIZE_BYTES is derived from MAX_FILE_SIZE_MB for file validation
  // Formula: MB * 1024 (KB) * 1024 (Bytes) = Total Bytes
  // 150MB allows for high-quality audio files while preventing memory issues
  MAX_FILE_SIZE_BYTES: MAX_FILE_SIZE_MB * 1024 * 1024, // 157,286,400 bytes
  SOUND_EFFECTS: {
    COUNTDOWN: 'countdown.mp3',
    START: 'race-start.mp3',
    WINNER: 'winner.mp3',
  },
};

export const THEME_CONSTANTS = {
  COLORS: {
    PRIMARY_CYAN: '#00ffff',
    PRIMARY_PINK: '#ff00ff',
    PRIMARY_PURPLE: '#9d00ff',
    SECONDARY_YELLOW: '#ffff00',
    SECONDARY_GREEN: '#00ff00',
    BACKGROUND_DARK: '#0a0a0a',
    BACKGROUND_MEDIUM: '#1a0033',
    TEXT_PRIMARY: '#ffffff',
    TEXT_SECONDARY: '#cccccc',
    BORDER_GLOW: 'rgba(0, 255, 255, 0.5)',
  },
  SHADOWS: {
    NEON_SMALL: '0 0 10px',
    NEON_MEDIUM: '0 0 20px',
    NEON_LARGE: '0 0 30px',
    BOX_SHADOW: '0 4px 20px rgba(0, 255, 255, 0.3)',
  },
  ANIMATIONS: {
    PULSE: 'pulse 2s infinite',
    GLOW: 'glow 1.5s ease-in-out infinite alternate',
    SLIDE_IN: 'slideIn 0.3s ease-out',
    FADE_IN: 'fadeIn 0.5s ease-in',
  },
};