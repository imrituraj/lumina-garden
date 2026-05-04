import { useStore } from '../store/useStore';
import type { WeatherState } from '../store/useStore';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || ''; // Placeholder key fallback if not provided

export const mapWeatherCodeToState = (code: number): WeatherState => {
  // OpenWeatherMap condition codes: https://openweathermap.org/weather-conditions
  if (code >= 200 && code < 300) return 'THUNDER';
  if (code >= 300 && code < 600) return 'RAINY'; // Drizzle and Rain
  if (code >= 600 && code < 700) return 'RAINY'; // Snow (Mapping to Rainy for now per prompt)
  if (code >= 700 && code < 800) return 'CLOUDY'; // Atmosphere (Mist, smoke, etc.)
  if (code === 800) return 'SUNNY'; // Clear
  if (code > 800) return 'CLOUDY'; // Clouds

  return 'SUNNY'; // Default fallback
};

export const fetchWeatherByCoords = async (lat: number, lon: number) => {
  try {
    if (!API_KEY) {
      console.warn("No VITE_WEATHER_API_KEY provided. Falling back to SUNNY.");
      useStore.getState().setWeather('SUNNY', 'Demo City');
      return;
    }

    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    if (!response.ok) throw new Error('Weather fetch failed');
    
    const data = await response.json();
    const conditionCode = data.weather[0].id;
    let weatherState = mapWeatherCodeToState(conditionCode);
    const cityName = data.name;

    // Time-based NIGHT override (after 19:00 / 7 PM local time)
    const currentHour = new Date().getHours();
    if (currentHour >= 19 || currentHour < 6) {
      weatherState = 'NIGHT';
    }

    useStore.getState().setWeather(weatherState, cityName);
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    useStore.getState().setWeather('SUNNY', 'Local Garden'); // Fallback
  }
};

export const fetchWeatherByCity = async (city: string) => {
  try {
    if (!API_KEY) {
      useStore.getState().setWeather('SUNNY', city);
      return;
    }

    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
    if (!response.ok) throw new Error('City not found');
    
    const data = await response.json();
    const conditionCode = data.weather[0].id;
    let weatherState = mapWeatherCodeToState(conditionCode);

    const currentHour = new Date().getHours();
    if (currentHour >= 19 || currentHour < 6) {
      weatherState = 'NIGHT';
    }

    useStore.getState().setWeather(weatherState, data.name);
  } catch (error) {
    console.error("Failed to fetch city weather:", error);
    // Do not override current working state if city fails, just alert or ignore
  }
};

export const initLiveWeatherMirror = () => {
  if (!navigator.geolocation) {
    console.warn("Geolocation is not supported by this browser.");
    useStore.getState().setWeather('SUNNY', 'Default Garden');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
    },
    (error) => {
      console.warn("Geolocation denied or failed.", error);
      useStore.getState().setWeather('SUNNY', 'Manual Mode');
      // In App.tsx, we will show a search bar if cityName === 'Manual Mode'
    }
  );
};
