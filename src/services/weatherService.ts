import type { WeatherForecast, LocationOption } from '../types';
import weatherData from '../data/weather.json';

// These functions currently return mock data.
// Replace with fetch() calls when the FastAPI backend is ready.
// GET /api/weather
// GET /api/weather?blockId={blockId}

export async function getBlockWeather(): Promise<WeatherForecast> {
  await simulateLatency();
  return weatherData.blockWeather as WeatherForecast;
}

export async function getBlockForecast48h(): Promise<WeatherForecast> {
  await simulateLatency();
  return weatherData.forecast48h as WeatherForecast;
}

export async function getBlockForecast5d(): Promise<WeatherForecast> {
  await simulateLatency();
  return weatherData.forecast5d as WeatherForecast;
}

export function getLocationOptions(): LocationOption {
  return weatherData.location as LocationOption;
}

function simulateLatency(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
