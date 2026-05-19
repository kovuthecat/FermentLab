import type { IngredientEntry } from "../../batches/types";
import { ingredientRepository } from "../services/ingredientRepository";
import {
  INGREDIENT_TYPE_LABELS,
  INGREDIENT_UNIT_LABELS,
  INGREDIENT_ROLE_LABELS,
} from "../constants";

type Props = {
  ingredients: IngredientEntry[];
  canDelete?: boolean;
};

export default function IngredientList({ ingredients, canDelete = true }: Props) {
  if (ingredients.length === 0) {
    return <p className="empty">Aucun ingrédient enregistré.</p>;
  }

  async function handleDelete(id: string) {
    await ingredientRepository.remove(id);
  }

  return (
    <ul className="ingredient-list">
      {ingredients.map((ing) => (
        <li key={ing.id} className="ingredient-item">
          <div className="ingredient-main">
            <span className="ingredient-name">{ing.name}</span>
            <span className="ingredient-qty">
              {ing.quantity} {INGREDIENT_UNIT_LABELS[ing.unit]}
            </span>
            <span className="ingredient-badge">{INGREDIENT_ROLE_LABELS[ing.role]}</span>
            <span className="ingredient-type">{INGREDIENT_TYPE_LABELS[ing.ingredientType]}</span>
          </div>
          {ing.notes && <div className="ingredient-notes">{ing.notes}</div>}
          {canDelete && (
            <button
              type="button"
              className="ingredient-draft-remove"
              onClick={() => handleDelete(ing.id)}
              aria-label={`Supprimer ${ing.name}`}
            >
              ✕
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
