import type { IngredientType, IngredientUnit, IngredientRole } from "../batches/types";

export const DEFAULT_INGREDIENT_UNITS: Record<IngredientType, IngredientUnit> = {
  water: "ml",
  sugar: "g",
  tea: "g",
  milk: "ml",
  flour: "g",
  starter: "g",
  fruit: "g",
  flavoring: "g",
  salt: "g",
  other: "g",
};

export const INGREDIENT_TYPE_LABELS: Record<IngredientType, string> = {
  water: "Eau",
  sugar: "Sucre",
  tea: "Thé",
  milk: "Lait",
  flour: "Farine",
  starter: "Culture",
  fruit: "Fruit",
  flavoring: "Arôme",
  salt: "Sel",
  other: "Autre",
};

export const INGREDIENT_UNIT_LABELS: Record<IngredientUnit, string> = {
  g: "g",
  ml: "ml",
  l: "l",
  tsp: "c. à café",
  tbsp: "c. à soupe",
  unit: "unité",
};

export const INGREDIENT_ROLE_LABELS: Record<IngredientRole, string> = {
  base: "Base",
  substrate: "Substrat",
  inoculum: "Inoculum",
  flavoring: "Arôme",
  additive: "Additif",
  other: "Autre",
};
