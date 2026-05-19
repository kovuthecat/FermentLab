export type BatchStatus = "active" | "completed" | "abandoned";

export type ContainerType = "jar" | "bottle" | "bowl" | "box" | "other";
export type ContainerMaterial = "glass" | "plastic" | "ceramic" | "metal" | "other";

export type ContainerInfo = {
  type?: ContainerType;
  material?: ContainerMaterial;
  volumeLiters?: number;
  surfaceAreaCm2?: number;
  depthCm?: number;
  openingDiameterCm?: number;
  notes?: string;
};

export type CultureSnapshotType =
  | "kombucha_scoby"
  | "water_kefir_grains"
  | "milk_kefir_grains"
  | "sourdough_starter"
  | "other";

export type CultureSnapshot = {
  type: CultureSnapshotType;
  name?: string;
  source?: string;
  approximateAgeDays?: number;
  refrigerated?: boolean;
  refrigerationDurationHours?: number;
  storageTemperatureC?: number;
  lastFeedingAt?: string;
  hoursSinceLastFeeding?: number;
  estimatedActivityScore?: 1 | 2 | 3 | 4 | 5;
  appearance?: string;
  smell?: string;
  notes?: string;
};

export type IngredientType =
  | "water"
  | "sugar"
  | "tea"
  | "milk"
  | "flour"
  | "starter"
  | "fruit"
  | "flavoring"
  | "salt"
  | "other";

export type IngredientUnit = "g" | "ml" | "l" | "tsp" | "tbsp" | "unit";
export type IngredientRole = "base" | "substrate" | "inoculum" | "flavoring" | "additive" | "other";

export type IngredientEntry = {
  id: string;
  batchId: string;
  ingredientType: IngredientType;
  name: string;
  quantity: number;
  unit: IngredientUnit;
  role: IngredientRole;
  notes?: string;
};

export type InitialParameters = {
  targetVolumeLiters?: number;
  targetTemperatureC?: number;
  freeNotes?: string;
};

export type Batch = {
  id: string;
  schemaVersion: string;
  profileId: string;
  name: string;
  status: BatchStatus;
  startedAt: string;
  endedAt?: string;
  initialParameters: InitialParameters;
  container: ContainerInfo;
  cultureSnapshot?: CultureSnapshot;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
