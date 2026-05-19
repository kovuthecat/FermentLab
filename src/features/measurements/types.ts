export type MeasurementMetric =
  | "temperature"
  | "ph"
  | "density_sg"
  | "brix"
  | "volume"
  | "weight"
  | "rise_percent"
  | "ambient_temperature"
  | "humidity";

export type MeasurementUnit =
  | "celsius"
  | "ph"
  | "sg"
  | "brix"
  | "ml"
  | "l"
  | "g"
  | "percent"
  | "humidity_percent";

export type MeasurementSource = "manual" | "calculated" | "sensor";

export type Measurement = {
  id: string;
  batchId: string;
  phaseId?: string;
  timestamp: string;
  metric: MeasurementMetric;
  value: number;
  unit: MeasurementUnit;
  source: MeasurementSource;
  note?: string;
  createdAt: string;
};
