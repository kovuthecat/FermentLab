import { db } from "../../../db/database";
import type { IngredientEntry } from "../../batches/types";

export const ingredientRepository = {
  async add(ingredient: IngredientEntry): Promise<void> {
    await db.ingredients.add(ingredient);
  },

  async listByBatch(batchId: string): Promise<IngredientEntry[]> {
    return db.ingredients.where("batchId").equals(batchId).toArray();
  },

  async remove(id: string): Promise<void> {
    await db.ingredients.delete(id);
  },
};
