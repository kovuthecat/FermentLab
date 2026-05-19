import type { FermentationProfile } from "../types";

export const FERMENTATION_PROFILES: FermentationProfile[] = [
  {
    id: "water_kefir",
    name: "Kéfir de fruits",
    description: "Fermentation courte à base de grains de kéfir d'eau, sucre et fruits.",
    suggestedPhases: [
      { type: "primary", label: "F1 — Fermentation primaire", order: 1 },
      { type: "secondary", label: "F2 — Refermentation en bouteille", order: 2 },
      { type: "refrigeration", label: "Réfrigération", order: 3 },
    ],
    suggestedEvents: [
      "end_primary_fermentation",
      "filtering",
      "start_secondary_fermentation",
      "end_secondary_fermentation",
      "burping",
      "bottling",
      "refrigeration",
    ],
    suggestedMeasurements: ["temperature", "ph", "brix", "density_sg"],
    suggestedObservationCategories: ["visual", "smell", "taste", "activity"],
  },
  {
    id: "milk_kefir",
    name: "Kéfir de lait",
    description: "Fermentation lactique à base de grains de kéfir de lait.",
    suggestedPhases: [
      { type: "primary", label: "Fermentation", order: 1 },
      { type: "refrigeration", label: "Réfrigération", order: 2 },
    ],
    suggestedEvents: [
      "filtering",
      "refrigeration",
    ],
    suggestedMeasurements: ["temperature", "ph"],
    suggestedObservationCategories: ["visual", "smell", "taste", "texture", "activity"],
  },
  {
    id: "kombucha",
    name: "Kombucha",
    description: "Fermentation à base de thé sucré et SCOBY.",
    suggestedPhases: [
      { type: "primary", label: "F1 — Fermentation primaire", order: 1 },
      { type: "secondary", label: "F2 — Refermentation aromatisée", order: 2 },
      { type: "refrigeration", label: "Réfrigération", order: 3 },
    ],
    suggestedEvents: [
      "end_primary_fermentation",
      "start_secondary_fermentation",
      "ingredient_added",
      "end_secondary_fermentation",
      "burping",
      "bottling",
      "refrigeration",
    ],
    suggestedMeasurements: ["temperature", "ph", "brix", "density_sg"],
    suggestedObservationCategories: ["visual", "smell", "taste", "activity"],
  },
  {
    id: "sourdough_starter",
    name: "Levain",
    description: "Culture fermentée à base de farine et d'eau, suivi du cycle nourrissage/pousse.",
    suggestedPhases: [
      { type: "feeding", label: "Nourrissage", order: 1 },
      { type: "rise", label: "Pousse", order: 2 },
      { type: "rest", label: "Retombée / Repos", order: 3 },
    ],
    suggestedEvents: [
      "feeding",
      "discard",
      "mixing",
    ],
    suggestedMeasurements: ["temperature", "rise_percent", "ambient_temperature"],
    suggestedObservationCategories: ["visual", "smell", "activity", "texture"],
  },
];

export function getProfile(id: string): FermentationProfile | undefined {
  return FERMENTATION_PROFILES.find((p) => p.id === id);
}
