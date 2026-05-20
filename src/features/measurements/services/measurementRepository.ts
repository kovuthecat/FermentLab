import { supabase } from "../../../lib/supabaseClient";
import { getCurrentUserId } from "../../../lib/getCurrentUserId";
import { triggerRefresh } from "../../../lib/refresh";
import type { Measurement, MeasurementMetric, MeasurementUnit, MeasurementSource } from "../types";

function rowToMeasurement(row: Record<string, unknown>): Measurement {
  return {
    id: row.id as string,
    batchId: row.batch_id as string,
    phaseId: (row.phase_id as string | null) ?? undefined,
    timestamp: row.timestamp as string,
    metric: row.metric as MeasurementMetric,
    value: row.value as number,
    unit: row.unit as MeasurementUnit,
    source: row.source as MeasurementSource,
    note: (row.note as string | null) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export const measurementRepository = {
  async add(data: Omit<Measurement, "id" | "createdAt">): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const userId = await getCurrentUserId();
    const { error } = await supabase.from("measurements").insert({
      id,
      user_id: userId,
      batch_id: data.batchId,
      phase_id: data.phaseId ?? null,
      timestamp: data.timestamp,
      metric: data.metric,
      value: data.value,
      unit: data.unit,
      source: data.source,
      note: data.note ?? null,
      created_at: now,
    });
    if (error) throw new Error(error.message);
    triggerRefresh();
    return id;
  },

  async listByBatch(batchId: string): Promise<Measurement[]> {
    const { data, error } = await supabase
      .from("measurements")
      .select("*")
      .eq("batch_id", batchId)
      .order("timestamp", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => rowToMeasurement(r as Record<string, unknown>));
  },

  async update(id: string, data: Partial<Omit<Measurement, "id" | "createdAt">>): Promise<void> {
    const patch: Record<string, unknown> = {};
    if (data.timestamp !== undefined) patch.timestamp = data.timestamp;
    if (data.metric !== undefined) patch.metric = data.metric;
    if (data.value !== undefined) patch.value = data.value;
    if (data.unit !== undefined) patch.unit = data.unit;
    if (data.source !== undefined) patch.source = data.source;
    if (data.note !== undefined) patch.note = data.note ?? null;
    if (data.phaseId !== undefined) patch.phase_id = data.phaseId ?? null;
    const { error } = await supabase.from("measurements").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    triggerRefresh();
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("measurements").delete().eq("id", id);
    if (error) throw new Error(error.message);
    triggerRefresh();
  },
};
