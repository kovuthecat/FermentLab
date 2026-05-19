import { db } from "../../../db/database";

export const batchRepository = {
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
