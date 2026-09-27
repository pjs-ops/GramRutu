import type { Advisory, Crop, CropStage, Risk, RiskLevel } from '../types';
import cropsData from '../data/crops.json';
import advisoryData from '../data/advisory.json';
import { getAllPanchayatWeather } from './panchayatService';

// These functions currently return mock data.
// Replace with fetch() calls when the FastAPI backend is ready.
// GET /api/advisory?panchayatId={id}&crop={crop}&stage={stage}
// GET /api/crops
// GET /api/crops/{id}/stages

const crops = (cropsData as { crops: Crop[] }).crops;
const advisories = (advisoryData as { advisories: Record<string, Record<string, Record<string, {
  risks: Risk[];
  recommendation: string;
  urgency: RiskLevel;
}>>> }).advisories;

export async function getCrops(): Promise<Crop[]> {
  await simulateLatency();
  return crops;
}

export async function getCropStages(cropId: string): Promise<CropStage[]> {
  await simulateLatency(100);
  const crop = crops.find((c) => c.id === cropId);
  return crop?.stages ?? [];
}

export async function getAdvisory(
  panchayatId: string,
  cropId: string,
  stageId: string
): Promise<Advisory | null> {
  await simulateLatency(300);

  const panchayatWeather = getAllPanchayatWeather();
  const weather = panchayatWeather[panchayatId];
  if (!weather) return null;

  // Determine risk level based on weather conditions
  const riskLevel = computeRiskLevel(weather.rainfall, weather.humidity, weather.temperature);

  // Look up advisory
  const cropAdvisories = advisories[cropId];
  if (!cropAdvisories) return null;

  const stageAdvisories = cropAdvisories[stageId];
  if (!stageAdvisories) {
    // Fall back to a generic advisory
    return createGenericAdvisory(panchayatId, cropId, stageId, weather, riskLevel);
  }

  const match = stageAdvisories[riskLevel] || stageAdvisories['Moderate'] || stageAdvisories['Low'];
  if (!match) return createGenericAdvisory(panchayatId, cropId, stageId, weather, riskLevel);

  return {
    id: `adv-${panchayatId}-${cropId}-${stageId}`,
    panchayatId,
    cropId,
    stageId,
    risks: match.risks,
    recommendation: match.recommendation,
    urgency: match.urgency,
    weatherContext: {
      temperature: weather.temperature,
      rainfall: weather.rainfall,
      humidity: weather.humidity,
      condition: weather.condition,
    },
  };
}

function computeRiskLevel(rainfall: number, humidity: number, temperature: number): RiskLevel {
  let score = 0;
  if (rainfall > 20) score += 3;
  else if (rainfall > 12) score += 2;
  else if (rainfall > 5) score += 1;

  if (humidity > 85) score += 2;
  else if (humidity > 75) score += 1;

  if (temperature > 35) score += 2;
  else if (temperature > 32) score += 1;

  if (score >= 5) return 'High';
  if (score >= 3) return 'Moderate';
  return 'Low';
}

function createGenericAdvisory(
  panchayatId: string,
  cropId: string,
  stageId: string,
  weather: { temperature: number; rainfall: number; humidity: number; condition: string },
  riskLevel: RiskLevel
): Advisory {
  const risks: Risk[] = [];

  if (weather.rainfall > 15) {
    risks.push({
      type: 'Waterlogging',
      level: weather.rainfall > 25 ? 'High' : 'Moderate',
      description: `Rainfall of ${weather.rainfall} mm expected`,
      parameter: 'Rainfall',
      threshold: '>15 mm/day',
    });
  } else {
    risks.push({
      type: 'Waterlogging',
      level: 'Low',
      description: 'Rainfall within normal range',
      parameter: 'Rainfall',
      threshold: '>15 mm/day',
    });
  }

  if (weather.temperature > 33) {
    risks.push({
      type: 'Heat Stress',
      level: weather.temperature > 36 ? 'High' : 'Moderate',
      description: `Temperature of ${weather.temperature}°C expected`,
      parameter: 'Temperature',
      threshold: '>33°C',
    });
  } else {
    risks.push({
      type: 'Heat Stress',
      level: 'Low',
      description: 'Temperature within acceptable range',
      parameter: 'Temperature',
      threshold: '>33°C',
    });
  }

  if (weather.humidity > 80) {
    risks.push({
      type: 'Disease Risk',
      level: weather.humidity > 88 ? 'High' : 'Moderate',
      description: `Humidity at ${weather.humidity}% increases disease pressure`,
      parameter: 'Humidity',
      threshold: '>80%',
    });
  } else {
    risks.push({
      type: 'Disease Risk',
      level: 'Low',
      description: 'Humidity within manageable range',
      parameter: 'Humidity',
      threshold: '>80%',
    });
  }

  let recommendation = 'Continue routine crop management practices.';
  if (riskLevel === 'High') {
    recommendation =
      'Weather conditions require attention. Monitor your field closely, ensure drainage is clear, and postpone any chemical spraying until conditions improve. Consult local agricultural extension services for specific guidance.';
  } else if (riskLevel === 'Moderate') {
    recommendation =
      'Some weather parameters are outside optimal ranges. Monitor crop health regularly and be prepared to take protective measures if conditions worsen.';
  }

  return {
    id: `adv-${panchayatId}-${cropId}-${stageId}`,
    panchayatId,
    cropId,
    stageId,
    risks,
    recommendation,
    urgency: riskLevel,
    weatherContext: {
      temperature: weather.temperature,
      rainfall: weather.rainfall,
      humidity: weather.humidity,
      condition: weather.condition,
    },
  };
}

function simulateLatency(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
