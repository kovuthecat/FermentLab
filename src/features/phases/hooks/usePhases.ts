import { useState, useEffect } from "react";
import { useDataVersion } from "../../../lib/refresh";
import { phaseRepository } from "../services/phaseRepository";
import type { Phase } from "../types";

export function usePhases(batchId: string): Phase[] {
  const v = useDataVersion();
  const [data, setData] = useState<Phase[]>([]);

  useEffect(() => {
    if (!batchId) return;
    console.log("[Supabase] loading phases", batchId);
    phaseRepository.listByBatch(batchId).then(setData).catch(console.error);
  }, [batchId, v]);

  return data;
}
