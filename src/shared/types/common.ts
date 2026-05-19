export type FinalEvaluation = {
  id: string;
  batchId: string;
  completedAt: string;
  acidityScore?: 1 | 2 | 3 | 4 | 5;
  sweetnessScore?: 1 | 2 | 3 | 4 | 5;
  carbonationScore?: 1 | 2 | 3 | 4 | 5;
  alcoholPerceptionScore?: 1 | 2 | 3 | 4 | 5;
  textureScore?: 1 | 2 | 3 | 4 | 5;
  overallScore: 1 | 2 | 3 | 4 | 5;
  success: boolean;
  wouldRepeat: boolean;
  problemSummary?: string;
  finalNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type DerivedMetricType =
  | "duration_hours"
  | "primary_duration_hours"
  | "secondary_duration_hours"
  | "refrigeration_duration_hours"
  | "surface_depth_ratio"
  | "estimated_abv";

export type DerivedMetric = {
  id: string;
  batchId: string;
  metric: DerivedMetricType;
  value: number;
  unit: string;
  method: string;
  calculatedAt: string;
};
