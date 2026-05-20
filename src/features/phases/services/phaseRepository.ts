import { supabase } from "../../../lib/supabaseClient";
import { getCurrentUserId } from "../../../lib/getCurrentUserId";
import { triggerRefresh } from "../../../lib/refresh";
import type { Phase, PhaseType } from "../types";

function rowToPhase(row: Record<string, unknown>): Phase {
  return {
    id: row.id as string,
    batchId: row.batch_id as string,
    type: row.type as PhaseType,
    label: row.label as string,
    startedAt: row.started_at as string,
    endedAt: (row.ended_at as string | null) ?? undefined,
    notes: (row.notes as string | null) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const phaseRepository = {
  async add(data: Omit<Phase, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const userId = await getCurrentUserId();
    const { error } = await supabase.from("phases").insert({
      id,
      user_id: userId,
      batch_id: data.batchId,
      type: data.type,
      label: data.label,
      started_at: data.startedAt,
      ended_at: data.endedAt ?? null,
      notes: data.notes ?? null,
      created_at: now,
      updated_at: now,
    });
    if (error) throw new Error(error.message);
    triggerRefresh();
    return id;
  },

  async listByBatch(batchId: string): Promise<Phase[]> {
    const { data, error } = await supabase
      .from("phases")
      .select("*")
      .eq("batch_id", batchId)
      .order("started_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => rowToPhase(r as Record<string, unknown>));
  },

  async findActiveByType(batchId: string, type: PhaseType): Promise<Phase | undefined> {
    const all = await phaseRepository.listByBatch(batchId);
    return all.find((p) => p.type === type && !p.endedAt);
  },

  async findActiveByBatch(batchId: string): Promise<Phase | undefined> {
    const all = await phaseRepository.listByBatch(batchId);
    return all
      .filter((p) => !p.endedAt)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  },

  async close(id: string, endedAt: string): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("phases")
      .update({ ended_at: endedAt, updated_at: now })
      .eq("id", id);
    if (error) throw new Error(error.message);
    triggerRefresh();
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("phases").delete().eq("id", id);
    if (error) throw new Error(error.message);
    triggerRefresh();
  },
};
