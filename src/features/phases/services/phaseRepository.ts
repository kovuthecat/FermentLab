import { db } from "../../../db/database";
import type { Phase, PhaseType } from "../types";

export const phaseRepository = {
  async add(data: Omit<Phase, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.phases.add({ ...data, id, createdAt: now, updatedAt: now });
    return id;
  },

  async listByBatch(batchId: string): Promise<Phase[]> {
    return db.phases.where("batchId").equals(batchId).sortBy("startedAt");
  },

  async findActiveByType(batchId: string, type: PhaseType): Promise<Phase | undefined> {
    const all = await db.phases.where("batchId").equals(batchId).toArray();
    return all.find((p) => p.type === type && !p.endedAt);
  },

  async findActiveByBatch(batchId: string): Promise<Phase | undefined> {
    const all = await db.phases.where("batchId").equals(batchId).toArray();
    return all
      .filter((p) => !p.endedAt)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  },

  async close(id: string, endedAt: string): Promise<void> {
    const now = new Date().toISOString();
    await db.phases.update(id, { endedAt, updatedAt: now });
  },

  async remove(id: string): Promise<void> {
    await db.phases.delete(id);
  },
};
