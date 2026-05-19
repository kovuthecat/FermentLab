import { db } from "../../../db/database";
import type { Measurement } from "../types";

export const measurementRepository = {
  async add(data: Omit<Measurement, "id" | "createdAt">): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.measurements.add({ ...data, id, createdAt: now });
    return id;
  },

  async listByBatch(batchId: string): Promise<Measurement[]> {
    return db.measurements.where("batchId").equals(batchId).sortBy("timestamp");
  },

  async remove(id: string): Promise<void> {
    await db.measurements.delete(id);
  },
};
