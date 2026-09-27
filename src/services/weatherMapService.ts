import type {
  Panchayat,
  PanchayatWeather,
  GridCell,
  MapLayer,
  RiskLevel,
  PanchayatWeatherPoint,
  GridWeatherPoint,
} from '../types';
import panchayatData from '../data/panchayats.json';
import gridData from '../data/grid.json';
import weatherData from '../data/weather.json';

/**
 * Service providing weather map data and styling helpers.
 * Kept strictly decoupled from UI components so it can be swapped
 * with real FastAPI/ML model endpoints in future phases.
 */

const typedPanData = panchayatData as unknown as {
  panchayats: Panchayat[];
  panchayatWeather: Record<string, PanchayatWeather>;
};

const typedGridData = gridData as unknown as {
  blockId: string;
  resolution: string;
  rows: number;
  cols: number;
  cells: GridCell[];
};

export async function fetchPanchayats(): Promise<Panchayat[]> {
  await simulateLatency(80);
  return typedPanData.panchayats;
}

export async function fetchPanchayatWeatherData(): Promise<Record<string, PanchayatWeather>> {
  await simulateLatency(80);
  return typedPanData.panchayatWeather;
}

export async function fetchGridCells(): Promise<GridCell[]> {
  await simulateLatency(80);
  return typedGridData.cells;
}

export function getStructuredPanchayatPoints(): PanchayatWeatherPoint[] {
  return typedPanData.panchayats.map((p) => {
    const w = typedPanData.panchayatWeather[p.id];
    return {
      id: p.id,
      name: p.name,
      block: p.block,
      temperature: w?.temperature ?? 29.0,
      rainfall: w?.rainfall ?? 30.0,
      humidity: w?.humidity ?? 75,
      wind: w?.wind ?? w?.windSpeed ?? 12,
      risk: (w?.risk as RiskLevel) ?? 'Low',
      crop: w?.crop ?? 'Soybean',
      growthStage: w?.growthStage ?? 'Vegetative',
      downscalingDiff: w?.downscalingDiff ?? 0,
    };
  });
}

export function getStructuredGridPoints(): GridWeatherPoint[] {
  return typedGridData.cells.map((c) => ({
    id: c.id,
    lat: c.centroid[0],
    lng: c.centroid[1],
    temperature: c.temperature,
    rainfall: c.rainfall,
    humidity: c.humidity,
    wind: c.wind ?? c.windSpeed,
    downscalingDiff: c.downscalingDiff ?? 0,
    risk: c.risk,
    elevation: c.elevation,
    confidence: c.confidence,
  }));
}

export function getBlockWeatherSummary() {
  return weatherData.blockWeather;
}

// Color scale mappings for all 6 layers
export function getLayerColor(value: number, layer: MapLayer, riskLevel?: RiskLevel): string {
  switch (layer) {
    case 'temperature': {
      // 28 - 32°C range
      if (value >= 32.0) return '#ef4444'; // Red
      if (value >= 31.0) return '#f97316'; // Orange
      if (value >= 30.0) return '#eab308'; // Amber
      if (value >= 29.0) return '#84cc16'; // Lime
      return '#22c55e'; // Green
    }
    case 'rainfall': {
      // 20 - 80 mm range
      if (value >= 70) return '#1e40af'; // Dark Blue
      if (value >= 55) return '#2563eb'; // Deep Blue
      if (value >= 40) return '#3b82f6'; // Bright Blue
      if (value >= 25) return '#60a5fa'; // Light Blue
      return '#93c5fd'; // Soft Sky Blue
    }
    case 'humidity': {
      // 55 - 95% range
      if (value >= 90) return '#5b21b6'; // Deep Violet
      if (value >= 85) return '#7c3aed'; // Purple
      if (value >= 75) return '#8b5cf6'; // Violet
      if (value >= 65) return '#a78bfa'; // Soft Purple
      return '#c4b5fd'; // Lavender
    }
    case 'wind': {
      // 5 - 25 km/h range
      if (value >= 20) return '#042f2e'; // Dark Teal
      if (value >= 16) return '#0f766e'; // Teal
      if (value >= 13) return '#0284c7'; // Sky Blue
      if (value >= 10) return '#38bdf8'; // Soft Cyan
      return '#a5f3fc'; // Pale Cyan
    }
    case 'risk': {
      const risk = riskLevel ?? 'Low';
      if (risk === 'Severe') return '#ef4444';
      if (risk === 'High') return '#f97316';
      if (risk === 'Moderate') return '#eab308';
      return '#22c55e';
    }
    case 'downscalingDiff': {
      // Negative (cooler than block): Blue tones
      // Around 0: Neutral slate
      // Positive (warmer than block): Orange / Red tones
      if (value <= -2.5) return '#2563eb';
      if (value < -0.5) return '#38bdf8';
      if (value <= 0.5) return '#94a3b8';
      if (value < 2.0) return '#f97316';
      return '#ef4444';
    }
    default:
      return '#94a3b8';
  }
}

export function computeSimpleRisk(w: PanchayatWeather): RiskLevel {
  if (w.risk) return w.risk;
  let score = 0;
  if (w.rainfall > 50) score += 3;
  else if (w.rainfall > 30) score += 2;
  else if (w.rainfall > 15) score += 1;
  if (w.humidity > 85) score += 2;
  else if (w.humidity > 75) score += 1;
  if (w.temperature > 32) score += 2;
  else if (w.temperature > 30) score += 1;
  if (score >= 6) return 'Severe';
  if (score >= 4) return 'High';
  if (score >= 2) return 'Moderate';
  return 'Low';
}

export function formatLayerValue(layer: MapLayer, weather?: PanchayatWeather | null): string {
  if (!weather) return '—';
  switch (layer) {
    case 'temperature':
      return `${weather.temperature.toFixed(1)}°C`;
    case 'rainfall':
      return `${weather.rainfall.toFixed(1)} mm`;
    case 'humidity':
      return `${weather.humidity}%`;
    case 'wind':
      return `${weather.wind ?? weather.windSpeed} km/h`;
    case 'risk':
      return weather.risk ?? 'Low';
    case 'downscalingDiff': {
      const diff = weather.downscalingDiff ?? 0;
      return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}°C`;
    }
    default:
      return '—';
  }
}

function simulateLatency(ms = 80): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
