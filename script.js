const cityInput=document.getElementById('city-input');const searchBtn=document.getElementById('search-btn');const currentWeather=document.getElementById('current-weather');const forecastContainer=document.getElementById('forecast-container');const forecastSection=document.getElementById('forecast');const loading=document.getElementById('loading');const themeToggle=document.getElementById('theme-toggle');let lastSearchedCity=localStorage.getItem('lastCity')||'Dhaka';themeToggle.addEventListener('click',()=>{document.documentElement.classList.toggle('dark');const icon=themeToggle.querySelector('i');icon.classList.toggle('fa-moon');icon.classList.toggle('fa-sun')});searchBtn.addEventListener('click',searchWeather);cityInput.addEventListener('keypress',(e)=>{if(e.key==='Enter')searchWeather();});function searchWeather(){const city=cityInput.value.trim();if(city){getWeatherData(city)}}
function showLoading(show){loading.classList.toggle('hidden',!show)}
async function getCoordinates(city){const res=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);const data=await res.json();if(data.results&&data.results.length>0){return{latitude:data.results[0].latitude,longitude:data.results[0].longitude,name:data.results[0].name,country:data.results[0].country||''}}
throw new Error("City not found")}
async function getWeatherData(city){showLoading(!0);currentWeather.classList.add('hidden');forecastSection.classList.add('hidden');try{const location=await getCoordinates(city);const weatherRes=await fetch(`https://api.open-meteo.com/v1/forecast?`+`latitude=${location.latitude}&longitude=${location.longitude}`+`&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`+`&daily=weather_code,temperature_2m_max,temperature_2m_min`+`&timezone=auto`);const data=await weatherRes.json();localStorage.setItem('lastCity',city);renderCurrentWeather(data,location);renderForecast(data.daily)}catch(error){showError("City not found or something went wrong. Please try again.");console.error(error)}finally{showLoading(!1)}}
function showError(message){const errorDiv=document.createElement('div');errorDiv.className='fixed top-4 right-4 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg backdrop-blur-md z-50';errorDiv.textContent=message;document.body.appendChild(errorDiv);setTimeout(()=>{errorDiv.style.opacity='0';errorDiv.style.transition='opacity 0.3s ease';setTimeout(()=>errorDiv.remove(),300)},3000)}
function renderCurrentWeather(data,location){const current=data.current;const description=getWeatherDescription(current.weather_code);currentWeather.innerHTML=`
        <div class="glass rounded-3xl p-8">
            <div class="flex flex-col md:flex-row justify-between items-center">
                <div class="text-center md:text-left">
                    <h2 class="text-6xl font-light">${Math.round(current.temperature_2m)}°C</h2>
                    <p class="text-2xl mt-2">${description}</p>
                    <p class="text-xl mt-4">${location.name}, ${location.country}</p>
                </div>
                
                <div class="mt-6 md:mt-0 text-right space-y-2 text-lg">
                    <p>Feels like: <span class="font-semibold">${Math.round(current.apparent_temperature)}°C</span></p>
                    <p>Humidity: <span class="font-semibold">${current.relative_humidity_2m}%</span></p>
                    <p>Wind: <span class="font-semibold">${current.wind_speed_10m} km/h</span></p>
                </div>
            </div>
        </div>
    `;currentWeather.classList.remove('hidden');forecastSection.classList.remove('hidden')}
function renderForecast(daily){forecastContainer.innerHTML='';for(let i=0;i<7;i++){const date=new Date(daily.time[i]);const dayName=date.toLocaleDateString('en-US',{weekday:'short'});const card=document.createElement('div');card.className="glass rounded-2xl p-5 text-center hover:scale-105 transition";card.innerHTML=`
            <p class="font-medium">${dayName}</p>
            <p class="text-5xl my-4">${getWeatherEmoji(daily.weather_code[i])}</p>
            <p class="text-xl font-semibold">
                ${Math.round(daily.temperature_2m_max[i])}° 
                <span class="opacity-70">/ ${Math.round(daily.temperature_2m_min[i])}°</span>
            </p>
        `;forecastContainer.appendChild(card)}}
function getWeatherDescription(code){const map={0:"Clear sky",1:"Mainly clear",2:"Partly cloudy",3:"Overcast",45:"Fog",51:"Light drizzle",61:"Rain",71:"Snow",80:"Rain showers",95:"Thunderstorm"};return map[code]||"Unknown"}
function getWeatherEmoji(code){if([0,1].includes(code))return"☀️";if([2,3].includes(code))return"⛅";if([45,48].includes(code))return"🌫️";if([51,53,55,61,63,65,80,81,82].includes(code))return"🌧️";if([71,73,75,77].includes(code))return"❄️";if([95,96,99].includes(code))return"⛈️";return"🌥️"}
window.onload=()=>{getWeatherData(lastSearchedCity)}
