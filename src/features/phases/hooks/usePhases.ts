import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../db/database";

export function usePhases(batchId: string) {
  return useLiveQuery(
    () => db.phases.where("batchId").equals(batchId).sortBy("startedAt"),
    [batchId],
    []
  );
}
