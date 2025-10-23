export const RACE_CONSTANTS = {
  RACE_DURATION: 15,
  SPEED_CHANGE_INTERVAL: 2000,
  MIN_SPEED_MULTIPLIER: 0.4,
  MAX_SPEED_MULTIPLIER: 2.0,
  BASE_SPEED: 100,
  FINISH_LINE_X: 4500,
  DUCK_START_X: 80,
  DUCK_SPACING: 80,
};

export const VISUAL_CONSTANTS = {
  BACKGROUND_SCROLL_SPEED: 300,
  DUCK_CENTER_ZONE_MIN: 80,
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  // Background rendering
  BACKGROUND_IMAGE_PATH: '/assets/race-background.jpg',
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
  ACCELERATION_FACTOR: 0.1,
  DECELERATION_FACTOR: 0.15,
  MAX_POSITION_CHANGE: 30,
  SPEED_VARIANCE: 0.2,
  POSITION_UPDATE_RATE: 60,
  // Position thresholds
  // Minimum distance (in pixels) for minimal rubber-banding adjustments.
  // POSITION_THRESHOLD_DISTANCE balances responsiveness and prevents jitter in close races.
  POSITION_THRESHOLD_DISTANCE: 50,
  // Rubber-banding factors for minimal race balance
  RUBBER_BAND_CATCH_UP_FACTOR: 1.05, // 5% speed boost for stragglers
  RUBBER_BAND_LEAD_PENALTY_FACTOR: 0.95, // 5% speed reduction for leaders
  RUBBER_BAND_RANDOM_VARIANCE: 0.1, // ±5% random variance for natural movement
};

export const ANIMATION_CONSTANTS = {
  FPS: 60,
  FRAME_TIME: 1000 / 60,
  SMOOTHING_FACTOR: 0.1,
  INTERPOLATION_STEPS: 5,
};

export const UI_CONSTANTS = {
  MODAL_ANIMATION_DURATION: 300,
  COUNTDOWN_DURATION: 3000,
  WINNER_DISPLAY_DURATION: 5000,
  NOTIFICATION_DURATION: 3000,
  BUTTON_DEBOUNCE: 500,
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
  MAX_PARTICIPANTS: 24,
  PARTICIPANT_COUNT_SINGULAR: 1,
  PARTICIPANT_LIST_EMPTY: 0,
  // Event banner
  MAX_EVENT_NAME_LENGTH: 100,
};

// Audio file size limit constant for DRY principle
const MAX_FILE_SIZE_MB = 150;

export const AUDIO_CONSTANTS = {
  MASTER_VOLUME: 0.7,
  SFX_VOLUME: 0.8,
  MUSIC_VOLUME: 0.5,
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