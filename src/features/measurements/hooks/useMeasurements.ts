import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../db/database";

export function useMeasurements(batchId: string) {
  return useLiveQuery(
    () => db.measurements.where("batchId").equals(batchId).sortBy("timestamp"),
    [batchId],
    []
  );
}
