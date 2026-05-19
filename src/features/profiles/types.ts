import type { PhaseType } from "../phases/types";
import type { ProcessEventType } from "../events/types";
import type { MeasurementMetric } from "../measurements/types";
import type { ObservationCategory } from "../observations/types";

export type PhaseTemplate = {
  type: PhaseType;
  label: string;
  order: number;
};

export type FermentationProfileId =
  | "water_kefir"
  | "milk_kefir"
  | "kombucha"
  | "sourdough_starter";

export type FermentationProfile = {
  id: FermentationProfileId;
  name: string;
  description?: string;
  suggestedPhases: PhaseTemplate[];
  suggestedEvents: ProcessEventType[];
  suggestedMeasurements: MeasurementMetric[];
  suggestedObservationCategories: ObservationCategory[];
};
