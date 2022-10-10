'use: strict';

import Workouts from './workouts';

export default class Running extends Workouts {
  type = 'running';

  constructor(coords, dinstance, duration, cadence) {
    super(coords, dinstance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
  }
}
