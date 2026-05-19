export type ProcessEventType =
  | "bottling"
  | "filtering"
  | "ingredient_added"
  | "burping"
  | "mixing"
  | "discard"
  | "feeding"
  | "container_changed"
  | "other";

export type ProcessEvent = {
  id: string;
  batchId: string;
  phaseId?: string;
  timestamp: string;
  eventType: ProcessEventType;
  label: string;
  metadata?: Record<string, unknown>;
  note?: string;
  createdAt: string;
};
