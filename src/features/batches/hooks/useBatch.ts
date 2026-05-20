import { useState, useEffect } from "react";
import { batchRepository } from "../services/batchRepository";
import { useDataVersion } from "../../../lib/refresh";
import type { Batch } from "../types";

export function useBatch(batchId: string | undefined): Batch | null | undefined {
  const v = useDataVersion();
  const [batch, setBatch] = useState<Batch | null | undefined>(undefined);

  useEffect(() => {
    if (!batchId) return;
    batchRepository.get(batchId).then(setBatch);
  }, [batchId, v]);

  return batch;
}
