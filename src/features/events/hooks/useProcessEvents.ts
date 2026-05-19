import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../db/database";

export function useProcessEvents(batchId: string) {
  return useLiveQuery(
    () => db.processEvents.where("batchId").equals(batchId).sortBy("timestamp"),
    [batchId],
    []
  );
}
