'use: strict';

import Workouts from './workouts';

export default class Cycling extends Workouts {
  type = 'cycling';

  constructor(coords, dinstance, duration, elevationGain) {
    super(coords, dinstance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}
