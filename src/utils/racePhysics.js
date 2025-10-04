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
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    this.predeterminedWinner = array[0] % DUCK_CONSTANTS.DUCK_NAMES.length;

    this.ducks = DUCK_CONSTANTS.DUCK_NAMES.map((name, index) => ({
      id: index,
      name,
      color: DUCK_CONSTANTS.DUCK_COLORS[index],
      position: 0,
      displayX: RACE_CONSTANTS.DUCK_START_X + (index % 3) * 100,
      y: 150 + Math.floor(index / 2) * 80,
      currentSpeed: RACE_CONSTANTS.BASE_SPEED,
      speedMultiplier: 1,
      targetSpeedMultiplier: 1,
      isWinner: index === this.predeterminedWinner,
      variance: Math.random() * 0.2 - 0.1,
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
      const relativePosition = duck.position - (leaderPosition - 200);

      duck.displayX = VISUAL_CONSTANTS.DUCK_CENTER_ZONE_MIN +
        (relativePosition / 200) * (VISUAL_CONSTANTS.DUCK_CENTER_ZONE_MAX - VISUAL_CONSTANTS.DUCK_CENTER_ZONE_MIN);

      duck.displayX = Math.max(50, Math.min(750, duck.displayX));

      if (Math.random() < 0.02) {
        duck.y += (Math.random() - 0.5) * 4;
        duck.y = Math.max(100, Math.min(500, duck.y));
      }
    });

    return this.ducks;
  }

  updateSpeedMultipliers(elapsedSeconds) {
    const progressPercent = elapsedSeconds / RACE_CONSTANTS.RACE_DURATION;

    this.ducks.forEach(duck => {
      if (duck.isWinner) {
        if (progressPercent < 0.3) {
          duck.targetSpeedMultiplier = 0.8 + Math.random() * 0.4;
        } else if (progressPercent < 0.6) {
          duck.targetSpeedMultiplier = 0.9 + Math.random() * 0.3;
        } else if (progressPercent < 0.85) {
          duck.targetSpeedMultiplier = 1.1 + Math.random() * 0.2;
        } else {
          duck.targetSpeedMultiplier = 1.3 + Math.random() * 0.1;
        }
      } else {
        const baseMultiplier = 0.7 + Math.random() * 0.6;
        const varianceMultiplier = 1 + (Math.random() - 0.5) * 0.3;
        duck.targetSpeedMultiplier = baseMultiplier * varianceMultiplier;

        if (progressPercent > 0.8 && Math.random() < 0.3) {
          duck.targetSpeedMultiplier *= 0.85;
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

    if (duck.position < avgPosition - 50) {
      adjustment *= PHYSICS_CONSTANTS.CATCH_UP_BONUS;
    } else if (duck.position > avgPosition + 50) {
      adjustment *= PHYSICS_CONSTANTS.LEAD_PENALTY;
    }

    if (duck.isWinner && progressPercent > 0.7) {
      const winnerBoost = 1 + (progressPercent - 0.7) * 0.5;
      adjustment *= winnerBoost;
    }

    const randomFactor = 1 + (Math.random() - 0.5) * PHYSICS_CONSTANTS.SPEED_VARIANCE;
    adjustment *= randomFactor;

    return adjustment;
  }

  determineWinner() {
    const winner = this.ducks[this.predeterminedWinner];

    this.ducks.sort((a, b) => b.position - a.position);

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