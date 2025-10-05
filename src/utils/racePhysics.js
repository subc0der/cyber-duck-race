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
    this.winner = null;
  }

  initializeDucks(participants = []) {
    const duckNames = participants.length > 0
      ? participants.map(p => p.name)
      : DUCK_CONSTANTS.DUCK_NAMES;

    let randomValue;
    if (
      typeof window !== 'undefined' &&
      window.crypto &&
      typeof window.crypto.getRandomValues === 'function'
    ) {
      const array = new Uint32Array(1);
      try {
        window.crypto.getRandomValues(array);
        randomValue = array[0];
      } catch (e) {
        console.warn('Crypto API failed, using fallback random generator.');
        randomValue = Math.floor(Math.random() * 0xFFFFFFFF);
      }
    } else {
      console.warn('Crypto API is unavailable, using fallback random generator.');
      randomValue = Math.floor(Math.random() * 0xFFFFFFFF);
    }
    this.predeterminedWinner = duckNames.length > 0 ? (randomValue % duckNames.length) : 0;

    const calculatedLaneHeight = VISUAL_CONSTANTS.CANVAS_HEIGHT / (duckNames.length || 1);
    const laneHeight = Math.min(calculatedLaneHeight, DUCK_CONSTANTS.MAX_LANE_HEIGHT);
    const totalRaceHeight = laneHeight * duckNames.length;
    const verticalOffset = (VISUAL_CONSTANTS.CANVAS_HEIGHT - totalRaceHeight) / 2;

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
      isWinner: index === this.predeterminedWinner,
      variance: Math.random() * DUCK_CONSTANTS.DUCK_SPEED_VARIANCE_RANGE - DUCK_CONSTANTS.DUCK_SPEED_VARIANCE_OFFSET,
      lastPositionChange: Date.now(),
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

      duck.speedMultiplier += (duck.targetSpeedMultiplier - duck.speedMultiplier) * PHYSICS_CONSTANTS.ACCELERATION_FACTOR;

      const effectiveSpeed = RACE_CONSTANTS.BASE_SPEED * duck.speedMultiplier * speedAdjustment;

      duck.position += effectiveSpeed / PHYSICS_CONSTANTS.POSITION_UPDATE_RATE;

      const leaderPosition = Math.max(...this.ducks.map(d => d.position));
      const relativePosition = duck.position - (leaderPosition - PHYSICS_CONSTANTS.LEADER_OFFSET);

      duck.displayX = VISUAL_CONSTANTS.DUCK_CENTER_ZONE_MIN +
        (relativePosition / PHYSICS_CONSTANTS.RELATIVE_POSITION_SCALE) * (VISUAL_CONSTANTS.DUCK_CENTER_ZONE_MAX - VISUAL_CONSTANTS.DUCK_CENTER_ZONE_MIN);

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
   * Updates speed multipliers for all ducks based on race progression.
   *
   * Speed Curve Strategy:
   * - The winner duck follows a progressive speed curve that gradually increases throughout the race
   * - Non-winner ducks maintain lower, more variable speeds to create drama and suspense
   *
   * Winner Speed Progression:
   * 1. Early Race (0-30%): Base speed 0.8 ± 0.4 variance
   *    - Winner stays competitive but doesn't lead early (creates tension)
   * 2. Mid Race (30-60%): Base speed 0.9 ± 0.3 variance
   *    - Winner gradually moves toward the pack leaders
   * 3. Late Race (60-85%): Base speed 1.1 ± 0.2 variance
   *    - Winner starts to pull ahead noticeably
   * 4. Final Sprint (85-100%): Base speed 1.3 ± 0.1 variance
   *    - Winner surges to victory with consistent high speed
   *
   * Non-Winner Speed:
   * - Base: 0.7 + random(0-0.6) for variety among participants
   * - Variance: ±30% adds unpredictability to keep race interesting
   * - Endgame slowdown (80%+): 30% chance to reduce speed by 15% (simulates fatigue)
   *
   * @param {number} elapsedSeconds - Time elapsed since race start
   */
  updateSpeedMultipliers(elapsedSeconds) {
    const progressPercent = elapsedSeconds / RACE_CONSTANTS.RACE_DURATION;

    this.ducks.forEach(duck => {
      if (duck.isWinner) {
        // Winner follows progressive speed curve to ensure victory at 15 seconds
        if (progressPercent < RACE_CONSTANTS.EARLY_RACE_THRESHOLD) {
          // Early race: slower, conservative speed to build suspense
          duck.targetSpeedMultiplier = RACE_CONSTANTS.EARLY_RACE_BASE_SPEED + Math.random() * RACE_CONSTANTS.EARLY_RACE_VARIANCE;
        } else if (progressPercent < RACE_CONSTANTS.MID_RACE_THRESHOLD) {
          // Mid race: approaching average speed, staying in contention
          duck.targetSpeedMultiplier = RACE_CONSTANTS.MID_RACE_BASE_SPEED + Math.random() * RACE_CONSTANTS.MID_RACE_VARIANCE;
        } else if (progressPercent < RACE_CONSTANTS.LATE_RACE_THRESHOLD) {
          // Late race: above average speed, starting to pull ahead
          duck.targetSpeedMultiplier = RACE_CONSTANTS.LATE_RACE_BASE_SPEED + Math.random() * RACE_CONSTANTS.LATE_RACE_VARIANCE;
        } else {
          // Final sprint: high speed with low variance for guaranteed victory
          duck.targetSpeedMultiplier = RACE_CONSTANTS.FINAL_RACE_BASE_SPEED + Math.random() * RACE_CONSTANTS.FINAL_RACE_VARIANCE;
        }
      } else {
        // Non-winners have lower base speed with high variance for unpredictability
        const baseMultiplier = RACE_CONSTANTS.LOSER_BASE_SPEED + Math.random() * RACE_CONSTANTS.LOSER_SPEED_RANGE;
        const varianceMultiplier = 1 + (Math.random() - 0.5) * RACE_CONSTANTS.LOSER_VARIANCE_MULTIPLIER;
        duck.targetSpeedMultiplier = baseMultiplier * varianceMultiplier;

        // Endgame slowdown: simulates fatigue for non-winners in final stretch
        if (progressPercent > RACE_CONSTANTS.ENDGAME_THRESHOLD && Math.random() < RACE_CONSTANTS.ENDGAME_SLOWDOWN_CHANCE) {
          duck.targetSpeedMultiplier *= RACE_CONSTANTS.ENDGAME_SLOWDOWN_FACTOR;
        }
      }

      // Clamp speed multiplier to prevent extreme values
      duck.targetSpeedMultiplier = Math.max(
        RACE_CONSTANTS.MIN_SPEED_MULTIPLIER,
        Math.min(RACE_CONSTANTS.MAX_SPEED_MULTIPLIER, duck.targetSpeedMultiplier)
      );
    });
  }

  /**
   * Calculates dynamic speed adjustment based on race position and progress.
   *
   * Rubber-banding mechanics:
   * - Ducks far behind the pack get a 20% speed bonus (catch-up mechanic)
   * - Ducks far ahead get a 10% speed penalty (prevents runaway leaders)
   * - This keeps the pack relatively close for visual excitement
   *
   * Winner boost (70%+ progress):
   * - Predetermined winner gets increasing speed boost in final 30% of race
   * - Boost increases linearly from 0% at 70% progress to 15% at 100% progress
   * - Ensures winner crosses finish line first regardless of rubber-banding
   *
   * @param {Object} duck - The duck object being adjusted
   * @param {number} progressPercent - Race completion percentage (0-1)
   * @returns {number} - Speed adjustment multiplier
   */
  calculateSpeedAdjustment(duck, progressPercent) {
    let adjustment = 1;

    const positions = this.ducks.map(d => d.position);
    const maxPosition = Math.max(...positions);
    const avgPosition = positions.reduce((a, b) => a + b, 0) / positions.length;

    // Rubber-banding: help stragglers catch up, slow down leaders
    if (duck.position < avgPosition - PHYSICS_CONSTANTS.POSITION_THRESHOLD_DISTANCE) {
      adjustment *= PHYSICS_CONSTANTS.CATCH_UP_BONUS; // 1.2x speed for ducks behind
    } else if (duck.position > avgPosition + PHYSICS_CONSTANTS.POSITION_THRESHOLD_DISTANCE) {
      adjustment *= PHYSICS_CONSTANTS.LEAD_PENALTY; // 0.9x speed for ducks ahead
    }

    // Winner boost: ensure predetermined winner wins in final stretch
    if (duck.isWinner && progressPercent > PHYSICS_CONSTANTS.WINNER_BOOST_START_PERCENT) {
      const winnerBoost = 1 + (progressPercent - PHYSICS_CONSTANTS.WINNER_BOOST_START_PERCENT) * PHYSICS_CONSTANTS.WINNER_BOOST_MULTIPLIER;
      adjustment *= winnerBoost;
    }

    // Random variance adds unpredictability to each frame
    const randomFactor = 1 + (Math.random() - 0.5) * PHYSICS_CONSTANTS.SPEED_VARIANCE;
    adjustment *= randomFactor;

    return adjustment;
  }

  /**
   * Determines and returns the winner of the race.
   * The winner is selected based on the predeterminedWinner index.
   * @returns {{id: number, name: string, color: string, time: number, avgSpeed: number, finalPosition: number}} An object containing the winner's id, name, color, race time, average speed, and final position.
   */
  determineWinner() {
    const winner = this.ducks[this.predeterminedWinner];
    return {
      id: winner.id,
      name: winner.name,
      color: winner.color,
      time: RACE_CONSTANTS.RACE_DURATION,
      avgSpeed: Math.round(winner.position / RACE_CONSTANTS.RACE_DURATION),
      finalPosition: winner.position,
    };
  }

  reset(participants = []) {
    this.initializeDucks(participants);
    this.raceStartTime = null;
    this.lastSpeedUpdate = null;
    this.winner = null;
  }
}