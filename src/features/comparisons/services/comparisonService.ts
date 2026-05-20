import { batchRepository } from "../../batches/services/batchRepository";
import { phaseRepository } from "../../phases/services/phaseRepository";
import { measurementRepository } from "../../measurements/services/measurementRepository";
import { finalEvaluationRepository } from "../../evaluations/services/finalEvaluationRepository";
import {
  getBatchDurationHours,
  getPhaseDurationByType,
  getTemperatureStats,
  getPhStats,
  getDensityStats,
  estimateAbvFromDensity,
  getCultureRefrigerationHours,
} from "../../../lib/calculations";

export type BatchComparisonRow = {
  batchId: string;
  name: string;
  profileId: string;
  status: "completed" | "abandoned";
  startedAt: string;
  endedAt?: string;

  totalDurationHours?: number;
  primaryDurationHours?: number;
  secondaryDurationHours?: number;
  refrigerationDurationHours?: number;

  averageTemperatureC?: number;
  initialPh?: number;
  finalPh?: number;
  deltaPh?: number;

  originalGravity?: number;
  finalGravity?: number;
  estimatedAbv?: number;

  cultureRefrigerationHours?: number;

  overallScore?: number;
  success?: boolean;
  wouldRepeat?: boolean;
};

export const comparisonService = {
  async getComparisonRows(): Promise<BatchComparisonRow[]> {
    const allBatches = await batchRepository.list();
    const batches = allBatches
      .filter((b) => b.status === "completed" || b.status === "abandoned")
      .sort((a, b) => a.startedAt.localeCompare(b.startedAt));

    const rows: BatchComparisonRow[] = [];

    for (const batch of batches) {
      const [phases, measurements, evaluation] = await Promise.all([
        phaseRepository.listByBatch(batch.id),
        measurementRepository.listByBatch(batch.id),
        finalEvaluationRepository.getByBatch(batch.id),
      ]);

      const totalDuration = getBatchDurationHours(batch);
      const primaryDuration = getPhaseDurationByType(phases, "primary");
      const secondaryDuration = getPhaseDurationByType(phases, "secondary");
      const refrigerationDuration = getPhaseDurationByType(phases, "refrigeration");

      const tempStats = getTemperatureStats(measurements);
      const phStats = getPhStats(measurements);
      const densityStats = getDensityStats(measurements);
      const abv = estimateAbvFromDensity(measurements);
      const cultureRefrigHours = getCultureRefrigerationHours(batch);

      rows.push({
        batchId: batch.id,
        name: batch.name,
        profileId: batch.profileId,
        status: batch.status as "completed" | "abandoned",
        startedAt: batch.startedAt,
        endedAt: batch.endedAt,

        totalDurationHours: totalDuration ?? undefined,
        primaryDurationHours: primaryDuration ?? undefined,
        secondaryDurationHours: secondaryDuration ?? undefined,
        refrigerationDurationHours: refrigerationDuration ?? undefined,

        averageTemperatureC: tempStats.averageC,
        initialPh: phStats.initialPh,
        finalPh: phStats.finalPh,
        deltaPh: phStats.deltaPh,

        originalGravity: densityStats.originalGravity,
        finalGravity: densityStats.finalGravity,
        estimatedAbv: abv ?? undefined,

        cultureRefrigerationHours: cultureRefrigHours ?? undefined,

        overallScore: evaluation?.overallScore,
        success: evaluation?.success,
        wouldRepeat: evaluation?.wouldRepeat,
      });
    }

    return rows;
  },
};
