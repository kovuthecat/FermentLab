import { db } from "../../../db/database";
import type { StructuredObservation } from "../types";

export const observationRepository = {
  async add(data: Omit<StructuredObservation, "id" | "createdAt">): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.observations.add({ ...data, id, createdAt: now });
    return id;
  },

  async listByBatch(batchId: string): Promise<StructuredObservation[]> {
    return db.observations.where("batchId").equals(batchId).sortBy("timestamp");
  },

  async remove(id: string): Promise<void> {
    await db.observations.delete(id);
  },
};
