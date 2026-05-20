import { supabase } from "../../../lib/supabaseClient";
import { getCurrentUserId } from "../../../lib/getCurrentUserId";
import { triggerRefresh } from "../../../lib/refresh";
import type { FinalEvaluation } from "../../../shared/types/common";

function rowToEvaluation(row: Record<string, unknown>): FinalEvaluation {
  return {
    id: row.id as string,
    batchId: row.batch_id as string,
    completedAt: row.completed_at as string,
    acidityScore: (row.acidity_score as 1 | 2 | 3 | 4 | 5 | null) ?? undefined,
    sweetnessScore: (row.sweetness_score as 1 | 2 | 3 | 4 | 5 | null) ?? undefined,
    carbonationScore: (row.carbonation_score as 1 | 2 | 3 | 4 | 5 | null) ?? undefined,
    alcoholPerceptionScore: (row.alcohol_perception_score as 1 | 2 | 3 | 4 | 5 | null) ?? undefined,
    textureScore: (row.texture_score as 1 | 2 | 3 | 4 | 5 | null) ?? undefined,
    overallScore: (row.overall_score as 1 | 2 | 3 | 4 | 5 | null) ?? undefined,
    success: row.success as boolean,
    wouldRepeat: row.would_repeat as boolean,
    problemSummary: (row.problem_summary as string | null) ?? undefined,
    finalNotes: (row.final_notes as string | null) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export const finalEvaluationRepository = {
  async save(
    data: Omit<FinalEvaluation, "id" | "createdAt" | "updatedAt">,
    existingId?: string
  ): Promise<string> {
    const now = new Date().toISOString();
    if (existingId) {
      const { error } = await supabase
        .from("final_evaluations")
        .update({
          completed_at: data.completedAt,
          acidity_score: data.acidityScore ?? null,
          sweetness_score: data.sweetnessScore ?? null,
          carbonation_score: data.carbonationScore ?? null,
          alcohol_perception_score: data.alcoholPerceptionScore ?? null,
          texture_score: data.textureScore ?? null,
          overall_score: data.overallScore ?? null,
          success: data.success,
          would_repeat: data.wouldRepeat,
          problem_summary: data.problemSummary ?? null,
          final_notes: data.finalNotes ?? null,
          updated_at: now,
        })
        .eq("id", existingId);
      if (error) throw new Error(error.message);
      triggerRefresh();
      return existingId;
    }
    const id = crypto.randomUUID();
    const userId = await getCurrentUserId();
    const { error } = await supabase.from("final_evaluations").insert({
      id,
      user_id: userId,
      batch_id: data.batchId,
      completed_at: data.completedAt,
      acidity_score: data.acidityScore ?? null,
      sweetness_score: data.sweetnessScore ?? null,
      carbonation_score: data.carbonationScore ?? null,
      alcohol_perception_score: data.alcoholPerceptionScore ?? null,
      texture_score: data.textureScore ?? null,
      overall_score: data.overallScore ?? null,
      success: data.success,
      would_repeat: data.wouldRepeat,
      problem_summary: data.problemSummary ?? null,
      final_notes: data.finalNotes ?? null,
      created_at: now,
      updated_at: now,
    });
    if (error) throw new Error(error.message);
    triggerRefresh();
    return id;
  },

  async getByBatch(batchId: string): Promise<FinalEvaluation | undefined> {
    const { data, error } = await supabase
      .from("final_evaluations")
      .select("*")
      .eq("batch_id", batchId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return undefined;
    return rowToEvaluation(data as Record<string, unknown>);
  },
};
