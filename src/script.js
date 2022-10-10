'use: strict';

import Running from './running';
import Cycling from './cycling';
import './style.css';

class App {
  static getEle(selector) {
    return document.querySelector(selector);
  }

  static create(...args) {
    const [selector, ...styles] = args;
    const element = document.createElement(selector);
    styles.forEach((style) => element.classList.add(style));
    return element;
  }

  #map;

  #mapZoomLevel = 13;

  #mapEvent;

  #workouts = JSON.parse(localStorage.getItem('workouts')) || [];

  constructor() {
    this.form = App.getEle('.form');
    this.containerWorkouts = App.getEle('.workouts');
    this.inputType = App.getEle('.form__input--type');
    this.inputDistance = App.getEle('.form__input--distance');
    this.inputDuration = App.getEle('.form__input--duration');
    this.inputCadence = App.getEle('.form__input--cadence');
    this.inputElevation = App.getEle('.form__input--elevation');
    this.form.addEventListener('submit', this._newWorkout.bind(this));
    this.inputType.addEventListener(
      'change',
      this._toggleElevationField.bind(this)
    );
    this._getPosition();
    this.containerWorkouts.addEventListener(
      'click',
      this._moveToPopup.bind(this)
    );
  }

  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      this._geoSuccess.bind(this),
      this._geoError
    );
  }

  _moveToPopup(e) {
    const element = e.target.closest('.workout');
    if (!element) return;
    const workout = this.#workouts.find(
      (work) => work.id === element.dataset.id
    );
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: { duration: 1 },
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    this.form.classList.remove('hidden');
    this.inputDistance.focus();
  }

  _hideForm() {
    this.form.style.display = 'none';
    this.form.classList.add('hidden');
    setTimeout(() => {
      this.form.style.display = 'grid';
    }, 1000);
    this.form.reset();
  }

  _toggleElevationField() {
    this.inputCadence
      .closest('.form__row')
      .classList.toggle('form__row--hidden');
    this.inputElevation
      .closest('.form__row')
      .classList.toggle('form__row--hidden');
  }

  // eslint-disable-next-line consistent-return
  _newWorkout(e) {
    e.preventDefault();

    const type = this.inputType.value;
    const distance = +this.inputDistance.value;
    const duration = +this.inputDuration.value;
    const rate =
      type === 'running'
        ? +this.inputCadence.value
        : +this.inputElevation.value;
    const validateNumbers = (...args) =>
      args.every((arg) => Number.isFinite(arg));
    const validatePositive = (...args) => args.every((arg) => arg > 0);
    if (
      !validateNumbers(distance, duration, rate) ||
      (type === 'running' && !validatePositive(distance, duration, rate)) ||
      (type === 'cycling' && !validatePositive(distance, duration))
    ) {
      // eslint-disable-next-line no-alert
      return alert('Inputs must be positive numbers');
    }
    const coords = this._getCoords();
    const workout =
      type === 'running'
        ? new Running(coords, distance, duration, rate)
        : new Cycling(coords, distance, duration, rate);
    this.#workouts.push(workout);
    this._renderMarker(workout);
    this._renderWorkout(workout);
    this._hideForm();
    this._storeWorkouts();
  }

  _geoSuccess(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    this._loadMap();
    this._handleClicks();
  }

  // eslint-disable-next-line no-alert, class-methods-use-this
  _geoError = () => alert('Could not get your location');

  _loadMap() {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this._loadWorkouts();
  }

  _handleClicks = () => this.#map.on('click', this._showForm.bind(this));

  _getCoords = () => Object.values(this.#mapEvent.latlng);

  _renderMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWIdth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃🏻‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    const html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>

        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃🏻‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>

        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>

        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${
            workout.type === 'running'
              ? workout.pace.toFixed(1)
              : workout.speed.toFixed(1)
          }</span>
          <span class="workout__unit">${
            workout.type === 'running' ? 'min/km' : 'km/h'
          }</span>
        </div>

        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🦶' : '🏔'
          }</span>
          <span class="workout__value">${
            workout.type === 'running' ? workout.cadence : workout.elevationGain
          }</span>
          <span class="workout__unit">${
            workout.type === 'running' ? 'spm' : 'm'
          }</span>
        </div>
      </li>
    `;

    this.form.insertAdjacentHTML('afterend', html);
  }

  _storeWorkouts() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _loadWorkouts() {
    if (!this.#workouts.length) return;
    this.#workouts.forEach((workout) => {
      this._renderWorkout(workout);
      this._renderMarker(workout);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  clearWorkouts() {
    localStorage.removeItem('workouts');
    // eslint-disable-next-line no-restricted-globals
    location.reload();
  }
}

// eslint-disable-next-line no-unused-vars
const app = new App();
