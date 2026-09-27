import type { GridCell, ValidationMetrics, ModelPrediction } from '../types';
import gridData from '../data/grid.json';
import validationData from '../data/validation.json';

// These functions currently return mock data.
// Replace with fetch() calls when the FastAPI backend is ready.
// GET /api/downscale?blockId={blockId}
// GET /api/validation

const grid = gridData as {
  blockId: string;
  resolution: string;
  rows: number;
  cols: number;
  cells: GridCell[];
};

const validation = validationData as {
  metrics: ValidationMetrics;
  observedVsPredicted: ModelPrediction[];
};

export async function getGridPrediction(_blockId: string): Promise<{
  blockId: string;
  resolution: string;
  rows: number;
  cols: number;
  cells: GridCell[];
}> {
  // Simulate model computation latency
  await simulateLatency(1500);
  return grid;
}

export async function getGridCell(cellId: string): Promise<GridCell | undefined> {
  await simulateLatency(100);
  return grid.cells.find((c) => c.id === cellId);
}

export async function getValidationMetrics(): Promise<ValidationMetrics> {
  await simulateLatency();
  return validation.metrics;
}

export async function getValidationData(): Promise<ModelPrediction[]> {
  await simulateLatency();
  return validation.observedVsPredicted;
}

function simulateLatency(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
