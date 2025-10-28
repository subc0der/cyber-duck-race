import {
  RACE_CONSTANTS,
  DUCK_CONSTANTS,
  PHYSICS_CONSTANTS,
  VISUAL_CONSTANTS,
} from './constants';

/**
 * Generates a random number within the specified range [min, max).
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random number in range
 */
const randomInRange = (min, max) => min + Math.random() * (max - min);

/**
 * Generates a random number from a base value plus a range [base, base + range).
 * Convenience wrapper for the common pattern of MIN + random * RANGE.
 * @param {number} base - Base/minimum value
 * @param {number} range - Range to add to base
 * @returns {number} Random number from base to base + range
 */
const randomInRangeFromBase = (base, range) => base + Math.random() * range;

export class RacePhysics {
  constructor() {
    this.ducks = [];
    this.raceStartTime = null;
    this.lastSpeedUpdate = null;
    this.finishers = []; // Track order of finish (1st, 2nd, 3rd, etc.)
    this.finalSprintTriggered = false; // Track if final sprint surge has occurred
  }

  /**
   * Initializes duck racers with unique characteristics for fair racing.
   *
   * @param {Array<{name: string}>} participants - Array of participant objects with name property
   * @returns {Array<Object>} Array of initialized duck objects with racing properties
   */
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
      : [];

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
      baseSpeedFactor: randomInRange(PHYSICS_CONSTANTS.BASE_SPEED_FACTOR_MIN, PHYSICS_CONSTANTS.BASE_SPEED_FACTOR_MAX), // Random base speed multiplier
      acceleration: randomInRange(PHYSICS_CONSTANTS.ACCELERATION_MIN, PHYSICS_CONSTANTS.ACCELERATION_MAX), // How quickly they speed up
      stamina: randomInRange(PHYSICS_CONSTANTS.STAMINA_MIN, PHYSICS_CONSTANTS.STAMINA_MAX), // Affects late-race performance
      lastSpeedChange: Date.now(),
      nextSpeedChangeTime: Date.now() + randomInRangeFromBase(RACE_CONSTANTS.SPEED_CHANGE_MIN_INTERVAL_MS, RACE_CONSTANTS.SPEED_CHANGE_MAX_INTERVAL_MS), // Initial speed change time; recalculated dynamically on each speed change
      finalSprintBoost: null, // Will be set if duck gets final sprint surge
    }));

    return this.ducks;
  }

  /**
   * Updates duck positions for the current frame using time-based movement.
   *
   * @param {number} elapsedSeconds - Total time elapsed since race start (used for progress tracking)
   * @param {number} deltaTime - Time since last frame in seconds (used for frame rate independent movement)
   */
  updateDuckPositions(elapsedSeconds, deltaTime) {
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

      // Time-based movement: pixels per second * seconds = pixels moved
      duck.position += effectiveSpeed * deltaTime;

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
   * - Final sprint: dramatic surge mechanic near race end (FINAL_SPRINT_START to FINAL_SPRINT_END)
   * - No predetermined winner - actual race dynamics determine the outcome
   *
   * @param {number} elapsedSeconds - Time elapsed since race start
   */
  updateSpeedMultipliers(elapsedSeconds) {
    const progressPercent = elapsedSeconds / RACE_CONSTANTS.RACE_DURATION;
    const now = Date.now();

    // Final sprint zone defined by RACE_CONSTANTS.FINAL_SPRINT_START and FINAL_SPRINT_END
    const isFinalSprint = progressPercent >= RACE_CONSTANTS.FINAL_SPRINT_START && progressPercent <= RACE_CONSTANTS.FINAL_SPRINT_END;

    // Trigger final sprint surge once per race
    if (isFinalSprint && !this.finalSprintTriggered) {
      this.triggerFinalSprintSurge();
      this.finalSprintTriggered = true;
    }

    this.ducks.forEach(duck => {
      // Random speed changes at intervals defined by SPEED_CHANGE_MIN_INTERVAL_MS and SPEED_CHANGE_MAX_INTERVAL_MS
      // Performance: Use precalculated nextSpeedChangeTime instead of calculating every frame
      const shouldChangeSpeed = now >= duck.nextSpeedChangeTime;

      if (shouldChangeSpeed) {
        // Base speed influenced by duck's unique characteristics
        let newSpeed = duck.baseSpeedFactor;

        // Add random burst or slowdown (dramatic variation)
        newSpeed *= randomInRangeFromBase(PHYSICS_CONSTANTS.SPEED_BURST_MIN, PHYSICS_CONSTANTS.SPEED_BURST_RANGE);

        // Late race: stamina becomes a factor
        if (progressPercent > PHYSICS_CONSTANTS.LATE_RACE_THRESHOLD) {
          const staminaEffect = duck.stamina * randomInRangeFromBase(PHYSICS_CONSTANTS.STAMINA_EFFECT_MIN, PHYSICS_CONSTANTS.STAMINA_EFFECT_RANGE);
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
        // Precalculate next speed change time for performance
        duck.nextSpeedChangeTime = now + randomInRangeFromBase(RACE_CONSTANTS.SPEED_CHANGE_MIN_INTERVAL_MS, RACE_CONSTANTS.SPEED_CHANGE_MAX_INTERVAL_MS);
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

    // Pick a random duck from positions excluding the leader (if they exist)
    const surgeCandidates = sortedDucks.slice(1, 4).filter(d => d);

    if (surgeCandidates.length > 0) {
      const luckyDuck = surgeCandidates[Math.floor(Math.random() * surgeCandidates.length)];
      // Give them a massive speed boost for final sprint (defined by FINAL_SPRINT_BOOST constants)
      luckyDuck.finalSprintBoost = randomInRangeFromBase(PHYSICS_CONSTANTS.FINAL_SPRINT_BOOST_MIN, PHYSICS_CONSTANTS.FINAL_SPRINT_BOOST_RANGE);
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
  calculateSpeedAdjustment(duck, _progressPercent) {
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

  /**
   * Resets the race physics state and reinitializes ducks with new participants.
   *
   * @param {Array<{name: string}>} participants - Array of participant objects with name property
   */
  reset(participants = []) {
    this.initializeDucks(participants);
    this.raceStartTime = null;
    this.lastSpeedUpdate = null;
    this.finishers = [];
    this.finalSprintTriggered = false;
  }
}