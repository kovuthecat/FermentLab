import type { CultureSnapshot, ContainerInfo, IngredientEntry } from "../batches/types";
import type { Phase } from "../phases/types";
import type { Measurement } from "../measurements/types";
import type { StructuredObservation } from "../observations/types";
import type { ProcessEvent } from "../events/types";
import type { FinalEvaluation } from "../../shared/types/common";

export type CalculatedSummary = {
  totalDurationHours?: number;
  primaryDurationHours?: number;
  secondaryDurationHours?: number;
  refrigerationDurationHours?: number;
  averageTemperatureC?: number;
  minTemperatureC?: number;
  maxTemperatureC?: number;
  initialPh?: number;
  finalPh?: number;
  deltaPh?: number;
  originalGravity?: number;
  finalGravity?: number;
  estimatedAbv?: number;
  surfaceDepthRatio?: number;
  cultureRefrigerationHours?: number;
};

export type BatchExportInfo = {
  id: string;
  schemaVersion: string;
  profileId: string;
  name: string;
  status: string;
  startedAt: string;
  endedAt?: string;
  notes?: string;
  targetVolumeLiters?: number;
  targetTemperatureC?: number;
  initialNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type BatchExportEntry = {
  batch: BatchExportInfo;
  cultureSnapshot: CultureSnapshot | null;
  container: ContainerInfo;
  phases: Phase[];
  ingredients: IngredientEntry[];
  measurements: Measurement[];
  observations: StructuredObservation[];
  processEvents: ProcessEvent[];
  finalEvaluation: FinalEvaluation | null;
  calculatedSummary: CalculatedSummary;
};

export type SingleBatchExport = {
  schemaVersion: "1.0";
  exportedAt: string;
  app: { name: "FermentLab"; exportType: "single_batch" };
  batch: BatchExportInfo;
  cultureSnapshot: CultureSnapshot | null;
  container: ContainerInfo;
  phases: Phase[];
  ingredients: IngredientEntry[];
  measurements: Measurement[];
  observations: StructuredObservation[];
  processEvents: ProcessEvent[];
  finalEvaluation: FinalEvaluation | null;
  calculatedSummary: CalculatedSummary;
};

export type AllBatchesExport = {
  schemaVersion: "1.0";
  exportedAt: string;
  app: { name: "FermentLab"; exportType: "all_batches" };
  batches: BatchExportEntry[];
};
