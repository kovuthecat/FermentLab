import { useState, useEffect } from "react";
import { useDataVersion } from "../../../lib/refresh";
import { measurementRepository } from "../services/measurementRepository";
import type { Measurement } from "../types";

export function useMeasurements(batchId: string): Measurement[] {
  const v = useDataVersion();
  const [data, setData] = useState<Measurement[]>([]);

  useEffect(() => {
    if (!batchId) return;
    console.log("[Supabase] loading measurements", batchId);
    measurementRepository.listByBatch(batchId).then(setData).catch(console.error);
  }, [batchId, v]);

  return data;
}
