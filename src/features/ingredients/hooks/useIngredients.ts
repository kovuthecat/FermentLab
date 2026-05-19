import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../db/database";
import type { IngredientEntry } from "../../batches/types";

export function useIngredients(batchId: string): IngredientEntry[] | undefined {
  return useLiveQuery(
    () => db.ingredients.where("batchId").equals(batchId).toArray(),
    [batchId]
  );
}
