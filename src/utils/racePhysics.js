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
    this.initializeDucks();
  }

  initializeDucks() {
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
        console.warn('Crypto API failed, using fallback random generator');
        randomValue = Math.floor(Math.random() * 0xFFFFFFFF);
      }
    } else {
      console.warn('Crypto API is unavailable, using fallback random generator.');
      randomValue = Math.floor(Math.random() * 0xFFFFFFFF);
    }
    this.predeterminedWinner = randomValue % DUCK_CONSTANTS.DUCK_NAMES.length;

    this.ducks = DUCK_CONSTANTS.DUCK_NAMES.map((name, index) => ({
      id: index,
      name,
      color: DUCK_CONSTANTS.DUCK_COLORS[index],
      position: 0,
      displayX: RACE_CONSTANTS.DUCK_START_X + (index % DUCK_CONSTANTS.DUCKS_PER_ROW) * DUCK_CONSTANTS.DUCK_HORIZONTAL_SPACING,
      y: DUCK_CONSTANTS.DUCK_INITIAL_Y + Math.floor(index / DUCK_CONSTANTS.DUCKS_PER_ROW) * DUCK_CONSTANTS.DUCK_ROW_SPACING,
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
        duck.y = Math.max(DUCK_CONSTANTS.DUCK_MIN_Y, Math.min(DUCK_CONSTANTS.DUCK_MAX_Y, duck.y));
      }
    });

    return this.ducks;
  }

  updateSpeedMultipliers(elapsedSeconds) {
    const progressPercent = elapsedSeconds / RACE_CONSTANTS.RACE_DURATION;

    this.ducks.forEach(duck => {
      if (duck.isWinner) {
        if (progressPercent < RACE_CONSTANTS.EARLY_RACE_THRESHOLD) {
          duck.targetSpeedMultiplier = RACE_CONSTANTS.EARLY_RACE_BASE_SPEED + Math.random() * RACE_CONSTANTS.EARLY_RACE_VARIANCE;
        } else if (progressPercent < RACE_CONSTANTS.MID_RACE_THRESHOLD) {
          duck.targetSpeedMultiplier = RACE_CONSTANTS.MID_RACE_BASE_SPEED + Math.random() * RACE_CONSTANTS.MID_RACE_VARIANCE;
        } else if (progressPercent < RACE_CONSTANTS.LATE_RACE_THRESHOLD) {
          duck.targetSpeedMultiplier = RACE_CONSTANTS.LATE_RACE_BASE_SPEED + Math.random() * RACE_CONSTANTS.LATE_RACE_VARIANCE;
        } else {
          duck.targetSpeedMultiplier = RACE_CONSTANTS.FINAL_RACE_BASE_SPEED + Math.random() * RACE_CONSTANTS.FINAL_RACE_VARIANCE;
        }
      } else {
        const baseMultiplier = RACE_CONSTANTS.LOSER_BASE_SPEED + Math.random() * RACE_CONSTANTS.LOSER_SPEED_RANGE;
        const varianceMultiplier = 1 + (Math.random() - 0.5) * RACE_CONSTANTS.LOSER_VARIANCE_MULTIPLIER;
        duck.targetSpeedMultiplier = baseMultiplier * varianceMultiplier;

        if (progressPercent > RACE_CONSTANTS.ENDGAME_THRESHOLD && Math.random() < RACE_CONSTANTS.ENDGAME_SLOWDOWN_CHANCE) {
          duck.targetSpeedMultiplier *= RACE_CONSTANTS.ENDGAME_SLOWDOWN_FACTOR;
        }
      }

      duck.targetSpeedMultiplier = Math.max(
        RACE_CONSTANTS.MIN_SPEED_MULTIPLIER,
        Math.min(RACE_CONSTANTS.MAX_SPEED_MULTIPLIER, duck.targetSpeedMultiplier)
      );
    });
  }

  calculateSpeedAdjustment(duck, progressPercent) {
    let adjustment = 1;

    const positions = this.ducks.map(d => d.position);
    const maxPosition = Math.max(...positions);
    const minPosition = Math.min(...positions);
    const avgPosition = positions.reduce((a, b) => a + b, 0) / positions.length;

    if (duck.position < avgPosition - PHYSICS_CONSTANTS.POSITION_THRESHOLD_DISTANCE) {
      adjustment *= PHYSICS_CONSTANTS.CATCH_UP_BONUS;
    } else if (duck.position > avgPosition + PHYSICS_CONSTANTS.POSITION_THRESHOLD_DISTANCE) {
      adjustment *= PHYSICS_CONSTANTS.LEAD_PENALTY;
    }

    if (duck.isWinner && progressPercent > PHYSICS_CONSTANTS.WINNER_BOOST_START_PERCENT) {
      const winnerBoost = 1 + (progressPercent - PHYSICS_CONSTANTS.WINNER_BOOST_START_PERCENT) * PHYSICS_CONSTANTS.WINNER_BOOST_MULTIPLIER;
      adjustment *= winnerBoost;
    }

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

  reset() {
    this.initializeDucks();
    this.raceStartTime = null;
    this.lastSpeedUpdate = null;
    this.winner = null;
  }
}