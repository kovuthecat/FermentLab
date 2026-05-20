import { useState, useEffect } from "react";
import { useDataVersion } from "../../../lib/refresh";
import { ingredientRepository } from "../services/ingredientRepository";
import type { IngredientEntry } from "../../batches/types";

export function useIngredients(batchId: string): IngredientEntry[] {
  const v = useDataVersion();
  const [data, setData] = useState<IngredientEntry[]>([]);

  useEffect(() => {
    if (!batchId) return;
    console.log("[Supabase] loading ingredients", batchId);
    ingredientRepository.listByBatch(batchId).then(setData).catch(console.error);
  }, [batchId, v]);

  return data;
}
