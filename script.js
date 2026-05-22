const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const currentWeather = document.getElementById('current-weather');
const forecastContainer = document.getElementById('forecast-container');
const forecastSection = document.getElementById('forecast');
const loading = document.getElementById('loading');

let lastSearchedCity = localStorage.getItem('lastCity') || 'Dhaka';

// Search handlers
searchBtn.addEventListener('click', searchWeather);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather();
});

function searchWeather() {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
}

// Toggle Loading
function toggleLoading(show) {
    loading.classList.toggle('hidden', !show);
}

// Get Coordinates
async function getCoordinates(city) {
    const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
        throw new Error("City not found");
    }

    return {
        latitude: data.results[0].latitude,
        longitude: data.results[0].longitude,
        name: data.results[0].name,
        country: data.results[0].country || ''
    };
}

// Main Weather Function
async function getWeatherData(city) {
    toggleLoading(true);
    currentWeather.classList.add('hidden');
    forecastSection.classList.add('hidden');

    try {
        const location = await getCoordinates(city);
        
        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?` +
            `latitude=\( {location.latitude}&longitude= \){location.longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
            `&timezone=auto`
        );

        const data = await weatherRes.json();

        localStorage.setItem('lastCity', city);
        
        renderCurrentWeather(data, location);
        renderForecast(data.daily);

    } catch (error) {
        alert("City not found or failed to fetch weather data. Please try again.");
        console.error(error);
    } finally {
        toggleLoading(false);
    }
}

// Render Current Weather
function renderCurrentWeather(data, location) {
    const current = data.current;
    const description = getWeatherDescription(current.weather_code);

    currentWeather.innerHTML = `
        <div class="glass rounded-3xl p-8">
            <div class="flex flex-col md:flex-row justify-between items-center">
                <div>
                    <h2 class="text-7xl font-light">${Math.round(current.temperature_2m)}°C</h2>
                    <p class="text-2xl mt-3">${description}</p>
                    <p class="text-xl mt-6">${location.name}, ${location.country}</p>
                </div>
                
                <div class="mt-8 md:mt-0 text-right space-y-3">
                    <p>Feels like: <span class="font-semibold">${Math.round(current.apparent_temperature)}°C</span></p>
                    <p>Humidity: <span class="font-semibold">${current.relative_humidity_2m}%</span></p>
                    <p>Wind: <span class="font-semibold">${current.wind_speed_10m} km/h</span></p>
                </div>
            </div>
        </div>
    `;

    currentWeather.classList.remove('hidden');
    forecastSection.classList.remove('hidden');
}

// Render 7-Day Forecast
function renderForecast(daily) {
    forecastContainer.innerHTML = '';

    for (let i = 0; i < 7; i++) {
        const date = new Date(daily.time[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        const card = document.createElement('div');
        card.className = "glass rounded-3xl p-6 text-center";
        card.innerHTML = `
            <p class="font-medium mb-2">${dayName}</p>
            <p class="text-6xl my-4">${getWeatherEmoji(daily.weather_code[i])}</p>
            <p class="text-2xl font-semibold">
                ${Math.round(daily.temperature_2m_max[i])}° 
                <span class="text-gray-400 font-normal">/ ${Math.round(daily.temperature_2m_min[i])}°</span>
            </p>
        `;
        forecastContainer.appendChild(card);
    }
}

// Helper Functions
function getWeatherDescription(code) {
    const map = {
        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Fog", 51: "Light drizzle", 61: "Rain", 71: "Snow",
        80: "Rain showers", 95: "Thunderstorm"
    };
    return map[code] || "Unknown";
}

function getWeatherEmoji(code) {
    if ([0,1].includes(code)) return "☀️";
    if ([2,3].includes(code)) return "⛅";
    if ([45,48].includes(code)) return "🌫️";
    if ([51,53,55,61,63,65,80,81,82].includes(code)) return "🌧️";
    if ([71,73,75,77].includes(code)) return "❄️";
    if ([95,96,99].includes(code)) return "⛈️";
    return "🌥️";
}

// Initialize
window.onload = () => {
    getWeatherData(lastSearchedCity);
};
