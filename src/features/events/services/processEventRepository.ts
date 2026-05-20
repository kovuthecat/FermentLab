import { supabase } from "../../../lib/supabaseClient";
import { getCurrentUserId } from "../../../lib/getCurrentUserId";
import { triggerRefresh } from "../../../lib/refresh";
import type { ProcessEvent, ProcessEventType } from "../types";

function rowToProcessEvent(row: Record<string, unknown>): ProcessEvent {
  return {
    id: row.id as string,
    batchId: row.batch_id as string,
    phaseId: (row.phase_id as string | null) ?? undefined,
    timestamp: row.timestamp as string,
    eventType: row.event_type as ProcessEventType,
    label: row.label as string,
    metadata: (row.metadata as Record<string, unknown> | null) ?? undefined,
    note: (row.note as string | null) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export const processEventRepository = {
  async add(data: Omit<ProcessEvent, "id" | "createdAt">): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const userId = await getCurrentUserId();
    const { error } = await supabase.from("process_events").insert({
      id,
      user_id: userId,
      batch_id: data.batchId,
      phase_id: data.phaseId ?? null,
      timestamp: data.timestamp,
      event_type: data.eventType,
      label: data.label,
      metadata: data.metadata ?? null,
      note: data.note ?? null,
      created_at: now,
    });
    if (error) throw new Error(error.message);
    triggerRefresh();
    return id;
  },

  async listByBatch(batchId: string): Promise<ProcessEvent[]> {
    const { data, error } = await supabase
      .from("process_events")
      .select("*")
      .eq("batch_id", batchId)
      .order("timestamp", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => rowToProcessEvent(r as Record<string, unknown>));
  },

  async update(id: string, data: Partial<Omit<ProcessEvent, "id" | "createdAt">>): Promise<void> {
    const patch: Record<string, unknown> = {};
    if (data.timestamp !== undefined) patch.timestamp = data.timestamp;
    if (data.eventType !== undefined) patch.event_type = data.eventType;
    if (data.label !== undefined) patch.label = data.label;
    if (data.note !== undefined) patch.note = data.note ?? null;
    if (data.metadata !== undefined) patch.metadata = data.metadata ?? null;
    if (data.phaseId !== undefined) patch.phase_id = data.phaseId ?? null;
    const { error } = await supabase.from("process_events").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    triggerRefresh();
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("process_events").delete().eq("id", id);
    if (error) throw new Error(error.message);
    triggerRefresh();
  },
};
