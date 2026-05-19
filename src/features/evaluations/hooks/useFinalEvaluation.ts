import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../db/database";

export function useFinalEvaluation(batchId: string) {
  return useLiveQuery(
    () => db.finalEvaluations.where("batchId").equals(batchId).first(),
    [batchId]
  );
}
