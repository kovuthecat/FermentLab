import Dexie, { type EntityTable } from "dexie";
import type { Batch, IngredientEntry } from "../features/batches/types";
import type { Phase } from "../features/phases/types";
import type { Measurement } from "../features/measurements/types";
import type { StructuredObservation } from "../features/observations/types";
import type { ProcessEvent } from "../features/events/types";
import type { FinalEvaluation } from "../shared/types/common";

export class FermentLabDB extends Dexie {
  batches!: EntityTable<Batch, "id">;
  phases!: EntityTable<Phase, "id">;
  ingredients!: EntityTable<IngredientEntry, "id">;
  measurements!: EntityTable<Measurement, "id">;
  observations!: EntityTable<StructuredObservation, "id">;
  processEvents!: EntityTable<ProcessEvent, "id">;
  finalEvaluations!: EntityTable<FinalEvaluation, "id">;

  constructor() {
    super("fermentlab");
    this.version(1).stores({
      batches: "id, profileId, status, startedAt, createdAt",
      phases: "id, batchId, type, startedAt",
      ingredients: "id, batchId, ingredientType",
      measurements: "id, batchId, phaseId, metric, timestamp",
      observations: "id, batchId, phaseId, category, timestamp",
      processEvents: "id, batchId, phaseId, eventType, timestamp",
      finalEvaluations: "id, batchId, completedAt",
      derivedMetrics: "id, batchId, metric",
    });
    this.version(2).stores({
      batches: "id, profileId, status, startedAt, createdAt",
      phases: "id, batchId, type, startedAt",
      ingredients: "id, batchId, ingredientType",
      measurements: "id, batchId, phaseId, metric, timestamp",
      observations: "id, batchId, phaseId, category, timestamp",
      processEvents: "id, batchId, phaseId, eventType, timestamp",
      finalEvaluations: "id, batchId, completedAt",
    });
  }
}

export const db = new FermentLabDB();
