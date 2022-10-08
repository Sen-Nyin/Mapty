'use: strict';

import icon from './icon.png';
import logo from './logo.png';
import './style.css';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const getEle = (selector) => document.querySelector(selector);

const form = getEle('.form');
const containerWorkouts = getEle('.workouts');
const inputType = getEle('.form__input--type');
const inputDistance = getEle('.form__input--distance');
const inputDuration = getEle('.form__input--duration');
const inputCadence = getEle('.form__input--cadence');
const inputElevation = getEle('.form__input--elevation');
let map;
let mapEvent;

// ########### Render Workout From

const renderForm = () => {
  form.classList.remove('hidden');
  inputDistance.focus();
};

// ########## Change form based on workout selection

const switchForm = () => {
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
};

// ########### Handle map clicks to obtain coordinates

const handleMapClick = () => {
  map.on('click', (mapE) => {
    mapEvent = mapE;
    renderForm();
  });
};

// ########## Display a marker on the map

const renderMarker = () => {
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWIdth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
    )
    .setPopupContent('Workout')
    .openPopup();
};

// ########## Add a workout

const addNewWorkout = (e) => {
  // stuff
  e.preventDefault();
  renderMarker();
  form.reset();
};

// ########### Tile map area

const handleTiles = (map) => {
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
};

// ########### Get current geolocation
// ########### Build map

const geoSuccess = (position) => {
  const { latitude } = position.coords;
  const { longitude } = position.coords;
  const coords = [latitude, longitude];
  map = L.map('map').setView(coords, 13);

  handleTiles(map);
  handleMapClick();
};

const geoError = () => alert('Could not get your location');

navigator.geolocation.getCurrentPosition(geoSuccess, geoError);

// ########### Event Listeners

form.addEventListener('submit', addNewWorkout);
inputType.addEventListener('change', switchForm);
