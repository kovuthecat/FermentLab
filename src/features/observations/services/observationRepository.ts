import { supabase } from "../../../lib/supabaseClient";
import { getCurrentUserId } from "../../../lib/getCurrentUserId";
import { triggerRefresh } from "../../../lib/refresh";
import type { StructuredObservation, ObservationCategory } from "../types";

function rowToObservation(row: Record<string, unknown>): StructuredObservation {
  return {
    id: row.id as string,
    batchId: row.batch_id as string,
    phaseId: (row.phase_id as string | null) ?? undefined,
    timestamp: row.timestamp as string,
    category: row.category as ObservationCategory,
    descriptor: row.descriptor as string,
    intensity: (row.intensity as 1 | 2 | 3 | 4 | 5 | null) ?? undefined,
    note: (row.note as string | null) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export const observationRepository = {
  async add(data: Omit<StructuredObservation, "id" | "createdAt">): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const userId = await getCurrentUserId();
    const { error } = await supabase.from("observations").insert({
      id,
      user_id: userId,
      batch_id: data.batchId,
      phase_id: data.phaseId ?? null,
      timestamp: data.timestamp,
      category: data.category,
      descriptor: data.descriptor,
      intensity: data.intensity ?? null,
      note: data.note ?? null,
      created_at: now,
    });
    if (error) throw new Error(error.message);
    triggerRefresh();
    return id;
  },

  async listByBatch(batchId: string): Promise<StructuredObservation[]> {
    const { data, error } = await supabase
      .from("observations")
      .select("*")
      .eq("batch_id", batchId)
      .order("timestamp", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => rowToObservation(r as Record<string, unknown>));
  },

  async update(id: string, data: Partial<Omit<StructuredObservation, "id" | "createdAt">>): Promise<void> {
    const patch: Record<string, unknown> = {};
    if (data.timestamp !== undefined) patch.timestamp = data.timestamp;
    if (data.category !== undefined) patch.category = data.category;
    if (data.descriptor !== undefined) patch.descriptor = data.descriptor;
    if (data.intensity !== undefined) patch.intensity = data.intensity ?? null;
    if (data.note !== undefined) patch.note = data.note ?? null;
    if (data.phaseId !== undefined) patch.phase_id = data.phaseId ?? null;
    const { error } = await supabase.from("observations").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    triggerRefresh();
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("observations").delete().eq("id", id);
    if (error) throw new Error(error.message);
    triggerRefresh();
  },
};
