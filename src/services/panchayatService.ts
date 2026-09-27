import type { Panchayat, PanchayatWeather } from '../types';
import panchayatData from '../data/panchayats.json';

// These functions currently return mock data.
// Replace with fetch() calls when the FastAPI backend is ready.
// GET /api/panchayats
// GET /api/panchayats/{id}
// GET /api/panchayats/{id}/weather

const data = panchayatData as unknown as {
  panchayats: Panchayat[];
  panchayatWeather: Record<string, PanchayatWeather>;
};

export async function getPanchayats(): Promise<Panchayat[]> {
  await simulateLatency();
  return data.panchayats;
}

export async function getPanchayatById(id: string): Promise<Panchayat | undefined> {
  await simulateLatency();
  return data.panchayats.find((p) => p.id === id);
}

export async function getPanchayatWeather(id: string): Promise<PanchayatWeather | undefined> {
  await simulateLatency();
  return data.panchayatWeather[id];
}

export async function searchPanchayats(query: string): Promise<Panchayat[]> {
  await simulateLatency(100);
  if (!query.trim()) return data.panchayats;
  const q = query.toLowerCase();
  return data.panchayats.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.block.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q)
  );
}

export function getAllPanchayatWeather(): Record<string, PanchayatWeather> {
  return data.panchayatWeather;
}

function simulateLatency(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
