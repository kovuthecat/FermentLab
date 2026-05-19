export type PhaseType =
  | "primary"
  | "secondary"
  | "refrigeration"
  | "feeding"
  | "rise"
  | "rest"
  | "bulk_fermentation"
  | "proofing"
  | "other";

export type Phase = {
  id: string;
  batchId: string;
  type: PhaseType;
  label: string;
  startedAt: string;
  endedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
