import { supabase } from "../../../lib/supabaseClient";
import { getCurrentUserId } from "../../../lib/getCurrentUserId";
import { triggerRefresh } from "../../../lib/refresh";
import type { Batch, BatchStatus, ContainerInfo, CultureSnapshot, InitialParameters } from "../types";

function rowToBatch(row: Record<string, unknown>): Batch {
  return {
    id: row.id as string,
    schemaVersion: row.schema_version as string,
    profileId: row.profile_id as string,
    name: row.name as string,
    status: row.status as BatchStatus,
    startedAt: row.started_at as string,
    endedAt: (row.ended_at as string | null) ?? undefined,
    initialParameters: (row.initial_parameters as InitialParameters) ?? {},
    container: (row.container as ContainerInfo) ?? {},
    cultureSnapshot: (row.culture_snapshot as CultureSnapshot | null) ?? undefined,
    notes: (row.notes as string | null) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const batchRepository = {
  async create(batch: Batch): Promise<void> {
    console.log("[Supabase] creating batch", batch.id);
    const userId = await getCurrentUserId();
    const { error } = await supabase.from("batches").insert({
      id: batch.id,
      user_id: userId,
      schema_version: batch.schemaVersion,
      profile_id: batch.profileId,
      name: batch.name,
      status: batch.status,
      started_at: batch.startedAt,
      ended_at: batch.endedAt ?? null,
      initial_parameters: batch.initialParameters,
      container: batch.container,
      culture_snapshot: batch.cultureSnapshot ?? null,
      notes: batch.notes ?? null,
      created_at: batch.createdAt,
      updated_at: batch.updatedAt,
    });
    if (error) throw new Error(error.message);
    triggerRefresh();
  },

  async get(batchId: string): Promise<Batch | null> {
    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .eq("id", batchId)
      .single();
    if (error) return null;
    return rowToBatch(data as Record<string, unknown>);
  },

  async list(): Promise<Batch[]> {
    console.log("[Supabase] loading batches");
    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .order("started_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => rowToBatch(r as Record<string, unknown>));
  },

  async close(
    batchId: string,
    status: Exclude<BatchStatus, "active">,
    endedAt: string
  ): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("batches")
      .update({ status, ended_at: endedAt, updated_at: now })
      .eq("id", batchId);
    if (error) throw new Error(error.message);
    triggerRefresh();
  },

  async remove(batchId: string): Promise<void> {
    const { error } = await supabase.from("batches").delete().eq("id", batchId);
    if (error) throw new Error(error.message);
    triggerRefresh();
  },
};
