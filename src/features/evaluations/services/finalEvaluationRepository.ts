import { db } from "../../../db/database";
import type { FinalEvaluation } from "../../../shared/types/common";

export const finalEvaluationRepository = {
  async save(
    data: Omit<FinalEvaluation, "id" | "createdAt" | "updatedAt">,
    existingId?: string
  ): Promise<string> {
    const now = new Date().toISOString();
    if (existingId) {
      await db.finalEvaluations.update(existingId, { ...data, updatedAt: now });
      return existingId;
    }
    const id = crypto.randomUUID();
    await db.finalEvaluations.add({ ...data, id, createdAt: now, updatedAt: now });
    return id;
  },

  async getByBatch(batchId: string): Promise<FinalEvaluation | undefined> {
    return db.finalEvaluations.where("batchId").equals(batchId).first();
  },
};
