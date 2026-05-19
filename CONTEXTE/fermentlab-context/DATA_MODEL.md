# DATA_MODEL.md

## Principe général

Les données doivent être exploitables par filtrage, comparaison, statistiques simples et IA future.

Chaque donnée importante doit être :

- structurée ;
- typée ;
- horodatée ;
- reliée à un batch ;
- reliée si possible à une phase ;
- exprimée avec une unité explicite si c'est une mesure ;
- versionnée au niveau du schéma ;
- exportable en JSON sans dépendre de l'UI.

## Entités principales

```text
FermentationProfile
CultureSnapshot
Batch
Phase
IngredientEntry
Measurement
StructuredObservation
ProcessEvent
FinalEvaluation
DerivedMetric
Attachment
```

## FermentationProfile

Décrit un type de fermentation et ses champs recommandés.

```ts
type FermentationProfile = {
  id: string;
  name: string;
  description?: string;
  suggestedPhases: PhaseTemplate[];
  suggestedEvents: ProcessEventType[];
  suggestedMeasurements: MeasurementMetric[];
  suggestedObservationCategories: ObservationCategory[];
};
```

Profils MVP :

- `water_kefir`
- `milk_kefir`
- `kombucha`
- `sourdough_starter`

## Batch

Une fermentation suivie comme expérience.

```ts
type Batch = {
  id: string;
  schemaVersion: string;

  profileId: string;
  name: string;
  status: "active" | "completed" | "abandoned";

  startedAt: string;
  endedAt?: string;

  initialParameters: InitialParameters;
  container: ContainerInfo;
  cultureSnapshot?: CultureSnapshot;

  notes?: string;

  createdAt: string;
  updatedAt: string;
};
```

## InitialParameters

```ts
type InitialParameters = {
  targetVolumeLiters?: number;
  targetTemperatureC?: number;
  freeNotes?: string;
};
```

> Les ingrédients sont stockés dans la table Dexie `ingredients` (source unique). `initialParameters.ingredients` a été supprimé.

## IngredientEntry

```ts
type IngredientEntry = {
  id: string;
  batchId: string;

  ingredientType:
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

  name: string;
  quantity: number;
  unit: "g" | "ml" | "l" | "tsp" | "tbsp" | "unit";

  role: "base" | "substrate" | "inoculum" | "flavoring" | "additive" | "other";
  notes?: string;
};
```

## CultureSnapshot

État de la culture au démarrage du batch.

En MVP, il s'agit d'un snapshot rattaché au batch, pas encore d'une entité vivante indépendante.

```ts
type CultureSnapshot = {
  type:
    | "kombucha_scoby"
    | "water_kefir_grains"
    | "milk_kefir_grains"
    | "sourdough_starter"
    | "other";

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
```

Le champ `refrigerationDurationHours` est important pour corréler vigueur de la culture, temps de latence, acidité, production de CO₂ et qualité finale.

## ContainerInfo

```ts
type ContainerInfo = {
  type?: "jar" | "bottle" | "bowl" | "box" | "other";
  material?: "glass" | "plastic" | "ceramic" | "metal" | "other";
  volumeLiters?: number;
  surfaceAreaCm2?: number;
  depthCm?: number;
  openingDiameterCm?: number;
  notes?: string;
};
```

## Phase

```ts
type Phase = {
  id: string;
  batchId: string;

  type:
    | "primary"
    | "secondary"
    | "refrigeration"
    | "feeding"
    | "rise"
    | "rest"
    | "bulk_fermentation"
    | "proofing"
    | "other";

  label: string;
  startedAt: string;
  endedAt?: string;
  notes?: string;

  createdAt: string;
  updatedAt: string;
};
```

Exemples :

- Kombucha : F1, F2, réfrigération.
- Kéfir de fruits : F1, filtration/embouteillage, F2, réfrigération.
- Levain : nourrissage, pousse, pic d'activité, retombée.

## Measurement

Mesure chiffrée horodatée.

```ts
type Measurement = {
  id: string;
  batchId: string;
  phaseId?: string;
  timestamp: string;

  metric:
    | "temperature"
    | "ph"
    | "density_sg"
    | "brix"
    | "volume"
    | "weight"
    | "rise_percent"
    | "ambient_temperature"
    | "humidity";

  value: number;
  unit:
    | "celsius"
    | "ph"
    | "sg"
    | "brix"
    | "ml"
    | "l"
    | "g"
    | "percent"
    | "humidity_percent";

  source: "manual" | "calculated" | "sensor";
  note?: string;

  createdAt: string;
};
```

## StructuredObservation

Observation qualitative structurée.

```ts
type StructuredObservation = {
  id: string;
  batchId: string;
  phaseId?: string;
  timestamp: string;

  category:
    | "visual"
    | "smell"
    | "taste"
    | "texture"
    | "activity"
    | "problem";

  descriptor: string;
  intensity?: 1 | 2 | 3 | 4 | 5;
  note?: string;

  createdAt: string;
};
```

Descripteurs suggérés :

- visual : `clear`, `cloudy`, `foamy`, `bubbly`, `separated`, `sediment`, `mold_suspected`, `scoby_growth`
- smell : `neutral`, `yeasty`, `fruity`, `acidic`, `vinegar`, `sulfur`, `alcoholic`, `unpleasant`
- taste : `sweet`, `balanced`, `acidic`, `bitter`, `alcoholic`, `bland`, `overfermented`
- texture : `liquid`, `thick`, `syrupy`, `creamy`, `elastic`, `collapsed`
- activity : `none`, `low`, `medium`, `high`, `peak`, `declining`

## ProcessEvent

Action ou jalon du process.

```ts
type ProcessEvent = {
  id: string;
  batchId: string;
  phaseId?: string;
  timestamp: string;

  eventType:
    | "bottling"
    | "filtering"
    | "ingredient_added"
    | "burping"
    | "mixing"
    | "discard"
    | "feeding"
    | "container_changed"
    | "other";

  label: string;
  metadata?: Record<string, unknown>;
  note?: string;

  createdAt: string;
};
```

## FinalEvaluation

```ts
type FinalEvaluation = {
  id: string;
  batchId: string;

  completedAt: string;

  acidityScore?: 1 | 2 | 3 | 4 | 5;
  sweetnessScore?: 1 | 2 | 3 | 4 | 5;
  carbonationScore?: 1 | 2 | 3 | 4 | 5;
  alcoholPerceptionScore?: 1 | 2 | 3 | 4 | 5;
  textureScore?: 1 | 2 | 3 | 4 | 5;
  overallScore?: 1 | 2 | 3 | 4 | 5; // optionnel pour les batchs abandonnés

  success: boolean;
  wouldRepeat: boolean;
  problemSummary?: string;
  finalNotes?: string;

  createdAt: string;
  updatedAt: string;
};
```

## DerivedMetric

> **Supprimé en schéma v2.** La table `derivedMetrics` n'a jamais été utilisée. Tous les calculs dérivés sont effectués à la volée depuis `lib/calculations.ts`. Voir DECISIONS.md.

## Export IA

Implémenté dans `src/features/export/services/exportService.ts`.

### Export batch unique (`exportType: "single_batch"`)

```json
{
  "schemaVersion": "1.0",
  "exportedAt": "2026-05-19T00:00:00.000Z",
  "app": { "name": "FermentLab", "exportType": "single_batch" },
  "batch": {
    "id": "...",
    "schemaVersion": "1",
    "profileId": "water_kefir",
    "name": "...",
    "status": "completed",
    "startedAt": "...",
    "endedAt": "...",
    "notes": "...",
    "targetVolumeLiters": 1.5,
    "targetTemperatureC": 22,
    "initialNotes": "...",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "cultureSnapshot": { "type": "water_kefir_grains", "refrigerated": true, "..." : "..." },
  "container": { "type": "jar", "volumeLiters": 2, "..." : "..." },
  "phases": [],
  "ingredients": [],
  "measurements": [],
  "observations": [],
  "processEvents": [],
  "finalEvaluation": null,
  "calculatedSummary": {
    "totalDurationHours": 72.5,
    "primaryDurationHours": 48,
    "secondaryDurationHours": 24,
    "refrigerationDurationHours": 12,
    "averageTemperatureC": 21.5,
    "minTemperatureC": 20,
    "maxTemperatureC": 23,
    "initialPh": 6.8,
    "finalPh": 3.2,
    "deltaPh": -3.6,
    "originalGravity": 1.04,
    "finalGravity": 1.005,
    "estimatedAbv": 4.59,
    "surfaceDepthRatio": 12.5,
    "cultureRefrigerationHours": 48
  }
}
```

### Export tous batchs (`exportType: "all_batches"`)

```json
{
  "schemaVersion": "1.0",
  "exportedAt": "2026-05-19T00:00:00.000Z",
  "app": { "name": "FermentLab", "exportType": "all_batches" },
  "batches": [
    {
      "batch": {},
      "cultureSnapshot": {},
      "container": {},
      "phases": [],
      "ingredients": [],
      "measurements": [],
      "observations": [],
      "processEvents": [],
      "finalEvaluation": null,
      "calculatedSummary": {}
    }
  ]
}
```

### Règles export

- `calculatedSummary` : valeurs calculées à la volée depuis `lib/calculations.ts`, jamais persistées.
- Les champs absents (undefined) sont omis du JSON.
- `finalEvaluation: null` si aucune évaluation (explicite).
- `cultureSnapshot: null` si pas de culture (explicite).
- Ingrédients : lecture directe de la table `ingredients` (source unique).
- Indentation : 2 espaces, lisible humainement.
- Nom fichier : `fermentlab-batch-[nom-sanitisé]-[date].json` ou `fermentlab-export-[date].json`.
- Pas de compression, pas de CSV, pas d'import.
