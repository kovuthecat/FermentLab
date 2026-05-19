import type { Batch } from "../features/batches/types";
import type { Phase, PhaseType } from "../features/phases/types";
import type { Measurement } from "../features/measurements/types";

function diffHours(start: string, end: string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
}

export function getBatchDurationHours(batch: Batch): number | null {
  const end = batch.endedAt ?? new Date().toISOString();
  const hours = diffHours(batch.startedAt, end);
  return hours >= 0 ? hours : null;
}

export function getPhaseDurationHours(phase: Phase): number | null {
  const end = phase.endedAt ?? new Date().toISOString();
  const hours = diffHours(phase.startedAt, end);
  return hours >= 0 ? hours : null;
}

export function getPhaseDurationByType(phases: Phase[], type: PhaseType): number | null {
  const matching = phases.filter((p) => p.type === type);
  if (matching.length === 0) return null;
  let total = 0;
  for (const phase of matching) {
    const h = getPhaseDurationHours(phase);
    if (h !== null) total += h;
  }
  return total;
}

export type TemperatureStats = {
  averageC?: number;
  minC?: number;
  maxC?: number;
  count: number;
};

export function getTemperatureStats(measurements: Measurement[]): TemperatureStats {
  const temps = measurements
    .filter((m) => m.metric === "temperature" || m.metric === "ambient_temperature")
    .map((m) => m.value);
  if (temps.length === 0) return { count: 0 };
  const sum = temps.reduce((a, b) => a + b, 0);
  return {
    averageC: Math.round((sum / temps.length) * 10) / 10,
    minC: Math.min(...temps),
    maxC: Math.max(...temps),
    count: temps.length,
  };
}

export type PhStats = {
  initialPh?: number;
  finalPh?: number;
  deltaPh?: number;
  count: number;
};

export function getPhStats(measurements: Measurement[]): PhStats {
  const sorted = measurements
    .filter((m) => m.metric === "ph")
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  if (sorted.length === 0) return { count: 0 };
  const initialPh = sorted[0].value;
  const finalPh = sorted[sorted.length - 1].value;
  const deltaPh =
    sorted.length >= 2 ? Math.round((finalPh - initialPh) * 100) / 100 : undefined;
  return {
    initialPh,
    finalPh: sorted.length >= 2 ? finalPh : undefined,
    deltaPh,
    count: sorted.length,
  };
}

export type DensityStats = {
  originalGravity?: number;
  finalGravity?: number;
  count: number;
};

export function getDensityStats(measurements: Measurement[]): DensityStats {
  const sorted = measurements
    .filter((m) => m.metric === "density_sg")
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  if (sorted.length === 0) return { count: 0 };
  return {
    originalGravity: sorted[0].value,
    finalGravity: sorted.length >= 2 ? sorted[sorted.length - 1].value : undefined,
    count: sorted.length,
  };
}

export function estimateAbvFromDensity(measurements: Measurement[]): number | null {
  const { originalGravity, finalGravity } = getDensityStats(measurements);
  if (originalGravity === undefined || finalGravity === undefined) return null;
  if (originalGravity <= finalGravity) return null;
  return Math.round((originalGravity - finalGravity) * 131.25 * 100) / 100;
}

export function getSurfaceDepthRatio(batch: Batch): number | null {
  const { surfaceAreaCm2, depthCm } = batch.container;
  if (surfaceAreaCm2 === undefined || depthCm === undefined || depthCm === 0) return null;
  return Math.round((surfaceAreaCm2 / depthCm) * 10) / 10;
}

export function getCultureRefrigerationHours(batch: Batch): number | null {
  return batch.cultureSnapshot?.refrigerationDurationHours ?? null;
}
