import { useState, useEffect } from "react";
import { useDataVersion } from "../../../lib/refresh";
import { observationRepository } from "../services/observationRepository";
import type { StructuredObservation } from "../types";

export function useObservations(batchId: string): StructuredObservation[] {
  const v = useDataVersion();
  const [data, setData] = useState<StructuredObservation[]>([]);

  useEffect(() => {
    if (!batchId) return;
    console.log("[Supabase] loading observations", batchId);
    observationRepository.listByBatch(batchId).then(setData).catch(console.error);
  }, [batchId, v]);

  return data;
}
