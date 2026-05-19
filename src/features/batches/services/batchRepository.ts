import { db } from "../../../db/database";
import type { BatchStatus } from "../types";

export const batchRepository = {
  async close(
    batchId: string,
    status: Exclude<BatchStatus, "active">,
    endedAt: string
  ): Promise<void> {
    const now = new Date().toISOString();
    await db.batches.update(batchId, { status, endedAt, updatedAt: now });
  },

  async remove(batchId: string): Promise<void> {
    await db.transaction("rw", [
      db.batches,
      db.phases,
      db.measurements,
      db.observations,
      db.processEvents,
      db.ingredients,
      db.finalEvaluations,
      db.derivedMetrics,
    ], async () => {
      await db.batches.delete(batchId);
      await db.phases.where("batchId").equals(batchId).delete();
      await db.measurements.where("batchId").equals(batchId).delete();
      await db.observations.where("batchId").equals(batchId).delete();
      await db.processEvents.where("batchId").equals(batchId).delete();
      await db.ingredients.where("batchId").equals(batchId).delete();
      await db.finalEvaluations.where("batchId").equals(batchId).delete();
      await db.derivedMetrics.where("batchId").equals(batchId).delete();
    });
  },
};
