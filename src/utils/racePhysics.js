import {
  RACE_CONSTANTS,
  DUCK_CONSTANTS,
  PHYSICS_CONSTANTS,
  VISUAL_CONSTANTS,
} from './constants';

export class RacePhysics {
  constructor() {
    this.ducks = [];
    this.raceStartTime = null;
    this.lastSpeedUpdate = null;
    this.finishers = []; // Track order of finish (1st, 2nd, 3rd, etc.)
    this.finalSprintTriggered = false; // Track if final sprint surge has occurred
  }

  initializeDucks(participants = []) {
    // Input validation: ensure participants is an array of objects with a 'name' property
    const validParticipants = Array.isArray(participants) &&
      participants.length > 0 &&
      participants.every(p =>
        p &&
        typeof p === 'object' &&
        !Array.isArray(p) &&
        Object.prototype.hasOwnProperty.call(p, 'name') &&
        typeof p.name === 'string' &&
        p.name.trim().length > 0
      );

    const duckNames = validParticipants
      ? participants.map(p => p.name)
      : DUCK_CONSTANTS.DUCK_NAMES;

    // Calculate lane height to spread evenly across bottom half of screen
    const topHalfHeight = VISUAL_CONSTANTS.CANVAS_HEIGHT * DUCK_CONSTANTS.RACE_AREA_TOP_FRACTION;
    const availableHeight = VISUAL_CONSTANTS.CANVAS_HEIGHT - topHalfHeight - DUCK_CONSTANTS.RACE_AREA_BOTTOM_PADDING;

    // Divide available height evenly among all participants
    const calculatedLaneHeight = availableHeight / (duckNames.length || 1);
    const laneHeight = Math.min(calculatedLaneHeight, DUCK_CONSTANTS.MAX_LANE_HEIGHT);
    const totalRaceHeight = laneHeight * duckNames.length;

    // Center ducks vertically within the bottom half area
    const verticalOffset = topHalfHeight + (availableHeight - totalRaceHeight) / 2;

    this.ducks = duckNames.map((name, index) => ({
      id: index,
      name,
      color: DUCK_CONSTANTS.DUCK_COLORS[index % DUCK_CONSTANTS.DUCK_COLORS.length],
      position: 0,
      displayX: RACE_CONSTANTS.DUCK_START_X,
      y: verticalOffset + (laneHeight / 2) + (index * laneHeight),
      baseY: verticalOffset + (laneHeight / 2) + (index * laneHeight),
      laneHeight: laneHeight,
      currentSpeed: RACE_CONSTANTS.BASE_SPEED,
      speedMultiplier: 1,
      targetSpeedMultiplier: 1,
      hasFinished: false,
      finishTime: null,
      // Random characteristics for each duck
      baseSpeedFactor: 0.85 + Math.random() * 0.3, // Random base speed (0.85-1.15x)
      acceleration: 0.08 + Math.random() * 0.04, // How quickly they speed up (0.08-0.12)
      stamina: 0.7 + Math.random() * 0.3, // Affects late-race performance (0.7-1.0)
      lastSpeedChange: Date.now(),
      finalSprintBoost: null, // Will be set if duck gets final sprint surge
    }));

    return this.ducks;
  }

  updateDuckPositions(elapsedSeconds) {
    const now = Date.now();

    if (!this.lastSpeedUpdate || now - this.lastSpeedUpdate > RACE_CONSTANTS.SPEED_CHANGE_INTERVAL) {
      this.updateSpeedMultipliers(elapsedSeconds);
      this.lastSpeedUpdate = now;
    }

    const progressPercent = elapsedSeconds / RACE_CONSTANTS.RACE_DURATION;

    this.ducks.forEach(duck => {
      const speedAdjustment = this.calculateSpeedAdjustment(duck, progressPercent);

      // Use duck's unique acceleration rate for speed changes
      duck.speedMultiplier += (duck.targetSpeedMultiplier - duck.speedMultiplier) * duck.acceleration;

      const effectiveSpeed = RACE_CONSTANTS.BASE_SPEED * duck.speedMultiplier * speedAdjustment;

      duck.position += effectiveSpeed / PHYSICS_CONSTANTS.POSITION_UPDATE_RATE;

      // Calculate displayX based on absolute position (starts at start line, moves right)
      // This ensures ducks race from left to right across the screen
      const maxExpectedPosition = RACE_CONSTANTS.FINISH_LINE_X;
      const displayRange = DUCK_CONSTANTS.DUCK_MAX_DISPLAY_X - RACE_CONSTANTS.DUCK_START_X;
      const positionRatio = Math.min(duck.position / maxExpectedPosition, 1);
      duck.displayX = RACE_CONSTANTS.DUCK_START_X + (positionRatio * displayRange);

      // Ensure duck stays within screen bounds
      duck.displayX = Math.max(DUCK_CONSTANTS.DUCK_MIN_DISPLAY_X, Math.min(DUCK_CONSTANTS.DUCK_MAX_DISPLAY_X, duck.displayX));

      if (Math.random() < DUCK_CONSTANTS.DUCK_VERTICAL_MOVEMENT_CHANCE) {
        duck.y += (Math.random() - 0.5) * DUCK_CONSTANTS.DUCK_VERTICAL_VARIANCE;
        const laneMinY = duck.baseY - (duck.laneHeight / 2) + DUCK_CONSTANTS.LANE_PADDING;
        const laneMaxY = duck.baseY + (duck.laneHeight / 2) - DUCK_CONSTANTS.LANE_PADDING;
        duck.y = Math.max(laneMinY, Math.min(laneMaxY, duck.y));
      }
    });

    return this.ducks;
  }

  /**
   * Updates speed multipliers for all ducks with realistic racing dynamics.
   *
   * Realistic Racing Mechanics:
   * - Each duck has unique characteristics (base speed, acceleration, stamina)
   * - Random speed bursts and slowdowns create natural race variation
   * - Stamina affects late-race performance (some ducks tire, others find extra gear)
   * - Final sprint: dramatic surge mechanic in last 1-2 seconds
   * - No predetermined winner - actual race dynamics determine the outcome
   *
   * @param {number} elapsedSeconds - Time elapsed since race start
   */
  updateSpeedMultipliers(elapsedSeconds) {
    const progressPercent = elapsedSeconds / RACE_CONSTANTS.RACE_DURATION;
    const now = Date.now();

    // Final sprint zone: last 1-2 seconds (87%-93% of race)
    const isFinalSprint = progressPercent >= 0.87 && progressPercent <= 0.93;

    // Trigger final sprint surge once per race
    if (isFinalSprint && !this.finalSprintTriggered) {
      this.triggerFinalSprintSurge();
      this.finalSprintTriggered = true;
    }

    this.ducks.forEach(duck => {
      // Random speed changes every 1-3 seconds to simulate realistic racing
      const timeSinceLastChange = now - duck.lastSpeedChange;
      const shouldChangeSpeed = timeSinceLastChange > 1000 + Math.random() * 2000;

      if (shouldChangeSpeed) {
        // Base speed influenced by duck's unique characteristics
        let newSpeed = duck.baseSpeedFactor;

        // Add random burst or slowdown (±40% for more dramatic variation)
        newSpeed *= (0.7 + Math.random() * 0.8);

        // Late race: stamina becomes a factor
        if (progressPercent > 0.6) {
          const staminaEffect = duck.stamina * (0.7 + Math.random() * 0.6);
          newSpeed *= staminaEffect;
        }

        // Apply final sprint boost if duck received one
        if (duck.finalSprintBoost) {
          newSpeed *= duck.finalSprintBoost;
        }

        duck.targetSpeedMultiplier = Math.max(
          RACE_CONSTANTS.MIN_SPEED_MULTIPLIER,
          Math.min(RACE_CONSTANTS.MAX_SPEED_MULTIPLIER, newSpeed)
        );

        duck.lastSpeedChange = now;
      }
    });
  }

  /**
   * Triggers a dramatic final sprint surge for a random duck.
   * Picks a duck in 2nd-4th place and gives them a massive speed boost
   * to create exciting photo-finish moments.
   */
  triggerFinalSprintSurge() {
    // Sort ducks by current position
    const sortedDucks = [...this.ducks].sort((a, b) => b.position - a.position);

    // Pick a random duck from 2nd-4th place (if they exist)
    const surgeCandidates = sortedDucks.slice(1, 4).filter(d => d);

    if (surgeCandidates.length > 0) {
      const luckyDuck = surgeCandidates[Math.floor(Math.random() * surgeCandidates.length)];
      // Give them a massive speed boost (1.5x-2.0x) for final sprint
      luckyDuck.finalSprintBoost = 1.5 + Math.random() * 0.5;
    }
  }

  /**
   * Calculates dynamic speed adjustment with minimal rubber-banding.
   *
   * Light rubber-banding mechanics (keeps race visually interesting):
   * - Very slight catch-up bonus for stragglers (5%)
   * - Very slight penalty for leaders (5%)
   * - Allows natural spread based on duck characteristics
   *
   * @param {Object} duck - The duck object being adjusted
   * @param {number} progressPercent - Race completion percentage (0-1)
   * @returns {number} - Speed adjustment multiplier
   */
  calculateSpeedAdjustment(duck, progressPercent) {
    let adjustment = 1;

    const positions = this.ducks.map(d => d.position);
    const avgPosition = positions.reduce((a, b) => a + b, 0) / positions.length;

    // Minimal rubber-banding: very slight adjustments for visual balance
    if (duck.position < avgPosition - PHYSICS_CONSTANTS.POSITION_THRESHOLD_DISTANCE * 2) {
      adjustment *= PHYSICS_CONSTANTS.RUBBER_BAND_CATCH_UP_FACTOR;
    } else if (duck.position > avgPosition + PHYSICS_CONSTANTS.POSITION_THRESHOLD_DISTANCE * 2) {
      adjustment *= PHYSICS_CONSTANTS.RUBBER_BAND_LEAD_PENALTY_FACTOR;
    }

    // Small random variance for natural movement
    const randomFactor = 1 + (Math.random() - 0.5) * PHYSICS_CONSTANTS.RUBBER_BAND_RANDOM_VARIANCE;
    adjustment *= randomFactor;

    return adjustment;
  }

  /**
   * Determines the top 3 finishers based on actual race positions.
   * @returns {{first: Object, second: Object, third: Object}} Top 3 finishers with their stats
   */
  determineWinners() {
    // Sort ducks by position (highest position = winner)
    const sortedDucks = [...this.ducks].sort((a, b) => b.position - a.position);

    const createFinisher = (duck, place) => ({
      id: duck.id,
      name: duck.name,
      color: duck.color,
      place: place,
      position: duck.position,
      time: RACE_CONSTANTS.RACE_DURATION,
      avgSpeed: Math.round(duck.position / RACE_CONSTANTS.RACE_DURATION),
    });

    return {
      first: sortedDucks[0] ? createFinisher(sortedDucks[0], 1) : null,
      second: sortedDucks[1] ? createFinisher(sortedDucks[1], 2) : null,
      third: sortedDucks[2] ? createFinisher(sortedDucks[2], 3) : null,
    };
  }

  reset(participants = []) {
    this.initializeDucks(participants);
    this.raceStartTime = null;
    this.lastSpeedUpdate = null;
    this.finishers = [];
    this.finalSprintTriggered = false;
  }
}