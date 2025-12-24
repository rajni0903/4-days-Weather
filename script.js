const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');
const notFoundSection = document.querySelector('.not-found');
const searchSection = document.querySelector('.search-city');
const weatherInfoSection = document.querySelector('.weather-info');
const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');
const forecastItemsContainer = document.querySelector('.forecast-items-container');

const apiKey = '31e84416a86f8a1dbf19079521a5290f';

searchBtn.addEventListener('click', () => {
  if (cityInput.value.trim() !== '') {
    updateWeatherInfo(cityInput.value);
    cityInput.value = '';
    cityInput.blur();
  }
});

cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && cityInput.value.trim() !== '') {
    updateWeatherInfo(cityInput.value);
    cityInput.value = '';
    cityInput.blur();
  }
});

async function getFetchData(endPoint, city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
  const response = await fetch(apiUrl);
  return response.json();
}

function getWeatherIcon(id) {
  if (id <= 232) return 'thunderstorm.svg';
  if (id <= 321) return 'drizzle.svg';
  if (id <= 531) return 'rain.svg';
  if (id <= 622) return 'snow.svg';
  if (id <= 781) return 'atmosphere.svg';
  if (id === 800) return 'clear.svg';
  return 'clouds.svg';
}

function getCurrentDate() {
  const now = new Date();
  const options = { weekday: 'short', day: '2-digit', month: 'short' };
  return now.toLocaleDateString('en-GB', options);
}

async function updateWeatherInfo(city) {
  const weatherData = await getFetchData('weather', city);

  if (weatherData.cod != 200) {
    showDisplaySection(notFoundSection);
    return;
  }

  const {
    name: cityName,
    sys: { country },
    main: { temp, humidity },
    weather: [{ id, main }],
    wind: { speed }
  } = weatherData;

  countryTxt.textContent = `${cityName}, ${country}`;
  tempTxt.textContent = Math.round(temp) + '°C';
  conditionTxt.textContent = main;
  humidityValueTxt.textContent = humidity + '%';
  windValueTxt.textContent = speed + ' m/s';
  currentDateTxt.textContent = getCurrentDate();

  weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;
  weatherSummaryImg.style.width = "120px";                 // ✅ FIX
  weatherSummaryImg.style.height = "120px";                // ✅ FIX
  weatherSummaryImg.style.objectFit = "contain";           // ✅ FIX

  await updateForecastsInfo(city);

  showDisplaySection(weatherInfoSection);
}

async function updateForecastsInfo(city) {
  const forecastsData = await getFetchData('forecast', city);

  if (!forecastsData.list) return;

  const timeTaken = '12:00:00';
  const todayDate = new Date().toISOString().split('T')[0];

  forecastItemsContainer.innerHTML = '';

  forecastsData.list.forEach((forecastWeather) => {
    if (forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)) {
      updateForecastItems(forecastWeather);
    }
  });
}

function updateForecastItems(weatherData) {
  const {
    dt_txt: date,
    weather: [{ id }],
    main: { temp }
  } = weatherData;

  const dataTaken = new Date(date);
  const dateOption = { day: '2-digit', month: 'short' };
  const dateResult = dataTaken.toLocaleDateString('en-GB', dateOption);

  const forecastItem = `
    <div class="forecast-item" style="min-width:80px;padding:10px;background:rgba(255,255,255,0.15);border-radius:12px;text-align:center;">
      <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
      <img src="assets/weather/${getWeatherIcon(id)}" class="forecast-item-img" style="width:45px;height:45px;object-fit:contain;" alt="Weather icon">
      <h5 class="forecast-item-temp">${Math.round(temp)}°C</h5>
    </div>
  `;

  forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

function showDisplaySection(section) {
  [weatherInfoSection, searchSection, notFoundSection].forEach((sec) => (sec.style.display = 'none'));
  section.style.display = 'flex';
}
