import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../db/database";

export function useObservations(batchId: string) {
  return useLiveQuery(
    () => db.observations.where("batchId").equals(batchId).sortBy("timestamp"),
    [batchId],
    []
  );
}
