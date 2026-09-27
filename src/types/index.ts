// Location types
export interface Location {
  state: string;
  district: string;
  block: string;
}

export interface Panchayat {
  id: string;
  name: string;
  blockId: string;
  block: string;
  district: string;
  state: string;
  population: number;
  area: number; // sq km
  elevation: number; // meters
  landCover: string;
  centroid: [number, number]; // [lat, lng]
  geometry: GeoJSONPolygon;
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

// Weather types
export interface WeatherForecast {
  blockId: string;
  block: string;
  timestamp: string;
  temperature: number; // °C
  temperatureMin: number;
  temperatureMax: number;
  rainfall: number; // mm
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: string;
  condition: string;
  source: string;
}

export interface PanchayatWeather {
  panchayatId: string;
  panchayatName: string;
  timestamp: string;
  temperature: number;
  temperatureMin: number;
  temperatureMax: number;
  rainfall: number;
  humidity: number;
  windSpeed: number;
  wind?: number;
  windDirection: string;
  condition: string;
  confidence: number;
  crop?: string;
  growthStage?: string;
  downscalingDiff?: number;
  risk?: RiskLevel;
  forecasts: ForecastPeriod[];
}

export interface ForecastPeriod {
  period: '24h' | '48h' | '5d';
  label: string;
  temperature: number;
  temperatureMin: number;
  temperatureMax: number;
  rainfall: number;
  humidity: number;
  windSpeed: number;
  condition: string;
}

// Grid types
export interface GridCell {
  id: string;
  row: number;
  col: number;
  centroid: [number, number];
  bounds: [[number, number], [number, number]];
  temperature: number;
  rainfall: number;
  humidity: number;
  elevation: number;
  confidence: number;
  windSpeed: number;
  wind?: number;
  downscalingDiff?: number;
  risk?: RiskLevel;
}

export interface PanchayatWeatherPoint {
  id: string;
  name: string;
  block: string;
  temperature: number;
  rainfall: number;
  humidity: number;
  wind: number;
  risk: RiskLevel;
  crop: string;
  growthStage: string;
  downscalingDiff: number;
}

export interface GridWeatherPoint {
  id: string;
  lat: number;
  lng: number;
  temperature: number;
  rainfall: number;
  humidity: number;
  wind: number;
  downscalingDiff: number;
  risk?: RiskLevel;
  elevation?: number;
  confidence?: number;
}

// Model types
export interface ModelPrediction {
  date: string;
  location: string;
  observed: number;
  coarseForecast: number;
  downscaledForecast: number;
  error: number;
}

export interface ValidationMetrics {
  mae: number;
  rmse: number;
  r2: number;
  bias: number;
  sampleSize: number;
  period: string;
  note: string;
}

// Crop types
export interface Crop {
  id: string;
  name: string;
  category: string;
  stages: CropStage[];
}

export interface CropStage {
  id: string;
  name: string;
  durationDays: string;
  description: string;
  temperatureOptimal: [number, number];
  rainfallOptimal: [number, number];
  humidityOptimal: [number, number];
}

// Risk types
export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Severe';

export interface Risk {
  type: string;
  level: RiskLevel;
  description: string;
  parameter: string;
  threshold: string;
}

// Advisory types
export interface Advisory {
  id: string;
  panchayatId: string;
  cropId: string;
  stageId: string;
  risks: Risk[];
  recommendation: string;
  urgency: RiskLevel;
  weatherContext: {
    temperature: number;
    rainfall: number;
    humidity: number;
    condition: string;
  };
}

// UI types
export interface MetricCardData {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
}

export type MapLayer =
  | 'temperature'
  | 'rainfall'
  | 'humidity'
  | 'wind'
  | 'risk'
  | 'downscalingDiff';

export interface LocationOption {
  states: string[];
  districts: Record<string, string[]>;
  blocks: Record<string, string[]>;
}

// Language and Internationalization types
export type Language = 'en' | 'mr';

// Downscaling Contributing Factor
export interface ContributingFactor {
  id: string;
  nameEn: string;
  nameMr: string;
  valueEn: string;
  valueMr: string;
  effectEn: string;
  effectMr: string;
  magnitude: 'high' | 'medium' | 'low';
}

// What-If Scenario Result
export interface WhatIfScenarioResult {
  currentRainfall: number;
  scenarioRainfall: number;
  currentRisk: RiskLevel;
  scenarioRisk: RiskLevel;
  riskDiff: 'increased' | 'decreased' | 'unchanged';
  explanationEn: string;
  explanationMr: string;
  actionMessageEn: string;
  actionMessageMr: string;
}

// Feature: Role Toggle
export type UserRole = 'farmer' | 'officer';

// Feature: Crowdsourced Feedback
export type FeedbackChoice = 'accurate' | 'moreRain' | 'lessRain';

export interface ForecastFeedback {
  panchayatId: string;
  accurate: number;
  moreRain: number;
  lessRain: number;
  total: number;
}

export type WaterloggingSeverity = 'none' | 'minor' | 'severe';

export interface WaterloggingReportData {
  severity: WaterloggingSeverity;
  observation: string;
  photoName: string | null;
}

// Feature: Uncertainty Visualization
export interface UncertaintyPoint {
  time: string;
  rainfall: number;
  lower: number;
  upper: number;
}

// Feature: Historical Rainfall
export interface HistoricalRainfallPoint {
  month: string;
  rainfall: number;
}

export interface SeasonRainfallComparison {
  month: string;
  historical: number;
  current: number;
}

// Feature: Officer Mode
export interface OfficerAction {
  panchayatId: string;
  panchayatName: string;
  rainfall: number;
  risk: RiskLevel;
  confidence: number;
  actionEn: string;
  actionMr: string;
}

