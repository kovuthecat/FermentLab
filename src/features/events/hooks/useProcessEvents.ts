import { useState, useEffect } from "react";
import { useDataVersion } from "../../../lib/refresh";
import { processEventRepository } from "../services/processEventRepository";
import type { ProcessEvent } from "../types";

export function useProcessEvents(batchId: string): ProcessEvent[] {
  const v = useDataVersion();
  const [data, setData] = useState<ProcessEvent[]>([]);

  useEffect(() => {
    if (!batchId) return;
    console.log("[Supabase] loading process events", batchId);
    processEventRepository.listByBatch(batchId).then(setData).catch(console.error);
  }, [batchId, v]);

  return data;
}
