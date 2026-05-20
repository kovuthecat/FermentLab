import { supabase } from "../../../lib/supabaseClient";
import { getCurrentUserId } from "../../../lib/getCurrentUserId";
import { triggerRefresh } from "../../../lib/refresh";
import type { IngredientEntry, IngredientType, IngredientUnit, IngredientRole } from "../../batches/types";

function rowToIngredient(row: Record<string, unknown>): IngredientEntry {
  return {
    id: row.id as string,
    batchId: row.batch_id as string,
    ingredientType: row.ingredient_type as IngredientType,
    name: row.name as string,
    quantity: row.quantity as number,
    unit: row.unit as IngredientUnit,
    role: row.role as IngredientRole,
    notes: (row.notes as string | null) ?? undefined,
  };
}

export const ingredientRepository = {
  async add(ingredient: IngredientEntry): Promise<void> {
    const userId = await getCurrentUserId();
    const { error } = await supabase.from("ingredients").insert({
      id: ingredient.id,
      user_id: userId,
      batch_id: ingredient.batchId,
      ingredient_type: ingredient.ingredientType,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      role: ingredient.role,
      notes: ingredient.notes ?? null,
    });
    if (error) throw new Error(error.message);
    triggerRefresh();
  },

  async bulkAdd(ingredients: IngredientEntry[]): Promise<void> {
    if (ingredients.length === 0) return;
    const userId = await getCurrentUserId();
    const rows = ingredients.map((i) => ({
      id: i.id,
      user_id: userId,
      batch_id: i.batchId,
      ingredient_type: i.ingredientType,
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      role: i.role,
      notes: i.notes ?? null,
    }));
    const { error } = await supabase.from("ingredients").insert(rows);
    if (error) throw new Error(error.message);
    triggerRefresh();
  },

  async listByBatch(batchId: string): Promise<IngredientEntry[]> {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .eq("batch_id", batchId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => rowToIngredient(r as Record<string, unknown>));
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("ingredients").delete().eq("id", id);
    if (error) throw new Error(error.message);
    triggerRefresh();
  },
};
