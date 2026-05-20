import { useState, useEffect } from "react";
import { useDataVersion } from "../../../lib/refresh";
import { finalEvaluationRepository } from "../services/finalEvaluationRepository";
import type { FinalEvaluation } from "../../../shared/types/common";

export function useFinalEvaluation(batchId: string): FinalEvaluation | null | undefined {
  const v = useDataVersion();
  const [data, setData] = useState<FinalEvaluation | null | undefined>(undefined);

  useEffect(() => {
    if (!batchId) return;
    finalEvaluationRepository
      .getByBatch(batchId)
      .then((result) => setData(result ?? null))
      .catch(console.error);
  }, [batchId, v]);

  return data;
}
