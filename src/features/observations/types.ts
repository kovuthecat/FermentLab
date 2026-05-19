export type ObservationCategory =
  | "visual"
  | "smell"
  | "taste"
  | "texture"
  | "activity"
  | "problem";

export type StructuredObservation = {
  id: string;
  batchId: string;
  phaseId?: string;
  timestamp: string;
  category: ObservationCategory;
  descriptor: string;
  intensity?: 1 | 2 | 3 | 4 | 5;
  note?: string;
  createdAt: string;
};

export const OBSERVATION_DESCRIPTORS: Record<ObservationCategory, string[]> = {
  visual: ["clear", "cloudy", "foamy", "bubbly", "separated", "sediment", "mold_suspected", "scoby_growth"],
  smell: ["neutral", "yeasty", "fruity", "acidic", "vinegar", "sulfur", "alcoholic", "unpleasant"],
  taste: ["sweet", "balanced", "acidic", "bitter", "alcoholic", "bland", "overfermented"],
  texture: ["liquid", "thick", "syrupy", "creamy", "elastic", "collapsed"],
  activity: ["none", "low", "medium", "high", "peak", "declining"],
  problem: [],
};
