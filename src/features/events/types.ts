export type ProcessEventType =
  | "start_phase"
  | "end_phase"
  | "end_primary_fermentation"
  | "start_secondary_fermentation"
  | "end_secondary_fermentation"
  | "bottling"
  | "filtering"
  | "refrigeration"
  | "feeding"
  | "discard"
  | "ingredient_added"
  | "burping"
  | "mixing"
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
