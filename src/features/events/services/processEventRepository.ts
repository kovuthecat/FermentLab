import { db } from "../../../db/database";
import type { ProcessEvent } from "../types";

export const processEventRepository = {
  async add(data: Omit<ProcessEvent, "id" | "createdAt">): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.processEvents.add({ ...data, id, createdAt: now });
    return id;
  },

  async listByBatch(batchId: string): Promise<ProcessEvent[]> {
    return db.processEvents.where("batchId").equals(batchId).sortBy("timestamp");
  },

  async update(id: string, data: Partial<Omit<ProcessEvent, "id" | "createdAt">>): Promise<void> {
    await db.processEvents.update(id, data);
  },

  async remove(id: string): Promise<void> {
    await db.processEvents.delete(id);
  },
};
