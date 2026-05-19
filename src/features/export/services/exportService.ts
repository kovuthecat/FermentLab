import { db } from "../../../db/database";
import type { Batch } from "../../batches/types";
import { phaseRepository } from "../../phases/services/phaseRepository";
import { measurementRepository } from "../../measurements/services/measurementRepository";
import { observationRepository } from "../../observations/services/observationRepository";
import { processEventRepository } from "../../events/services/processEventRepository";
import { finalEvaluationRepository } from "../../evaluations/services/finalEvaluationRepository";
import {
  getBatchDurationHours,
  getPhaseDurationByType,
  getTemperatureStats,
  getPhStats,
  getDensityStats,
  estimateAbvFromDensity,
  getSurfaceDepthRatio,
  getCultureRefrigerationHours,
} from "../../../lib/calculations";
import type {
  BatchExportEntry,
  BatchExportInfo,
  CalculatedSummary,
  SingleBatchExport,
  AllBatchesExport,
} from "../types";

async function buildBatchEntry(batch: Batch): Promise<BatchExportEntry> {
  const [phases, measurements, observations, processEvents, evaluation, ingredients] =
    await Promise.all([
      phaseRepository.listByBatch(batch.id),
      measurementRepository.listByBatch(batch.id),
      observationRepository.listByBatch(batch.id),
      processEventRepository.listByBatch(batch.id),
      finalEvaluationRepository.getByBatch(batch.id),
      db.ingredients.where("batchId").equals(batch.id).toArray(),
    ]);

  // Calculated summary — pure functions, never persisted
  const tempStats = getTemperatureStats(measurements);
  const phStats = getPhStats(measurements);
  const densityStats = getDensityStats(measurements);

  const calculatedSummary: CalculatedSummary = {};
  const totalDuration = getBatchDurationHours(batch);
  if (totalDuration !== null) calculatedSummary.totalDurationHours = totalDuration;
  const primaryDuration = getPhaseDurationByType(phases, "primary");
  if (primaryDuration !== null) calculatedSummary.primaryDurationHours = primaryDuration;
  const secondaryDuration = getPhaseDurationByType(phases, "secondary");
  if (secondaryDuration !== null) calculatedSummary.secondaryDurationHours = secondaryDuration;
  const refrigerationDuration = getPhaseDurationByType(phases, "refrigeration");
  if (refrigerationDuration !== null) calculatedSummary.refrigerationDurationHours = refrigerationDuration;
  if (tempStats.averageC !== undefined) calculatedSummary.averageTemperatureC = tempStats.averageC;
  if (tempStats.minC !== undefined) calculatedSummary.minTemperatureC = tempStats.minC;
  if (tempStats.maxC !== undefined) calculatedSummary.maxTemperatureC = tempStats.maxC;
  if (phStats.initialPh !== undefined) calculatedSummary.initialPh = phStats.initialPh;
  if (phStats.finalPh !== undefined) calculatedSummary.finalPh = phStats.finalPh;
  if (phStats.deltaPh !== undefined) calculatedSummary.deltaPh = phStats.deltaPh;
  if (densityStats.originalGravity !== undefined) calculatedSummary.originalGravity = densityStats.originalGravity;
  if (densityStats.finalGravity !== undefined) calculatedSummary.finalGravity = densityStats.finalGravity;
  const abv = estimateAbvFromDensity(measurements);
  if (abv !== null) calculatedSummary.estimatedAbv = abv;
  const surfaceRatio = getSurfaceDepthRatio(batch);
  if (surfaceRatio !== null) calculatedSummary.surfaceDepthRatio = surfaceRatio;
  const cultureRefrigHours = getCultureRefrigerationHours(batch);
  if (cultureRefrigHours !== null) calculatedSummary.cultureRefrigerationHours = cultureRefrigHours;

  const batchInfo: BatchExportInfo = {
    id: batch.id,
    schemaVersion: batch.schemaVersion,
    profileId: batch.profileId,
    name: batch.name,
    status: batch.status,
    startedAt: batch.startedAt,
    endedAt: batch.endedAt,
    notes: batch.notes,
    targetVolumeLiters: batch.initialParameters.targetVolumeLiters,
    targetTemperatureC: batch.initialParameters.targetTemperatureC,
    initialNotes: batch.initialParameters.freeNotes,
    createdAt: batch.createdAt,
    updatedAt: batch.updatedAt,
  };

  return {
    batch: batchInfo,
    cultureSnapshot: batch.cultureSnapshot ?? null,
    container: batch.container,
    phases,
    ingredients,
    measurements,
    observations,
    processEvents,
    finalEvaluation: evaluation ?? null,
    calculatedSummary,
  };
}

export const exportService = {
  async exportBatch(batchId: string): Promise<SingleBatchExport> {
    const batch = await db.batches.get(batchId);
    if (!batch) throw new Error(`Batch introuvable : ${batchId}`);
    const entry = await buildBatchEntry(batch);
    return {
      schemaVersion: "1.0",
      exportedAt: new Date().toISOString(),
      app: { name: "FermentLab", exportType: "single_batch" },
      batch: entry.batch,
      cultureSnapshot: entry.cultureSnapshot,
      container: entry.container,
      phases: entry.phases,
      ingredients: entry.ingredients,
      measurements: entry.measurements,
      observations: entry.observations,
      processEvents: entry.processEvents,
      finalEvaluation: entry.finalEvaluation,
      calculatedSummary: entry.calculatedSummary,
    };
  },

  async exportAllBatches(): Promise<AllBatchesExport> {
    const batches = await db.batches.orderBy("startedAt").toArray();
    const batchEntries = await Promise.all(batches.map(buildBatchEntry));
    return {
      schemaVersion: "1.0",
      exportedAt: new Date().toISOString(),
      app: { name: "FermentLab", exportType: "all_batches" },
      batches: batchEntries,
    };
  },
};

function sanitizeFilename(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export function makeBatchFilename(batchName: string): string {
  const date = new Date().toISOString().split("T")[0];
  const safe = sanitizeFilename(batchName);
  return `fermentlab-batch-${safe}-${date}.json`;
}

export function makeAllBatchesFilename(): string {
  const date = new Date().toISOString().split("T")[0];
  return `fermentlab-export-${date}.json`;
}

export function downloadJson(filename: string, data: unknown): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
