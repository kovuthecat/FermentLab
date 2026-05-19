import { useState } from "react";
import type { IngredientEntry, IngredientType, IngredientUnit, IngredientRole } from "../../batches/types";
import { ingredientRepository } from "../services/ingredientRepository";
import {
  INGREDIENT_TYPE_LABELS,
  INGREDIENT_UNIT_LABELS,
  INGREDIENT_ROLE_LABELS,
} from "../constants";

type Props = {
  batchId: string;
  onSaved: () => void;
  onCancel: () => void;
};

export default function IngredientForm({ batchId, onSaved, onCancel }: Props) {
  const [ingredientType, setIngredientType] = useState<IngredientType>("other");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<IngredientUnit>("g");
  const [role, setRole] = useState<IngredientRole>("other");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !quantity) return;
    setSaving(true);
    const ingredient: IngredientEntry = {
      id: crypto.randomUUID(),
      batchId,
      ingredientType,
      name: name.trim(),
      quantity: Number(quantity),
      unit,
      role,
      ...(notes.trim() && { notes: notes.trim() }),
    };
    await ingredientRepository.add(ingredient);
    onSaved();
  }

  return (
    <form className="quick-form" onSubmit={handleSubmit}>
      <div className="quick-form-row">
        <div className="form-group">
          <label>Type</label>
          <select
            value={ingredientType}
            onChange={(e) => setIngredientType(e.target.value as IngredientType)}
          >
            {(Object.entries(INGREDIENT_TYPE_LABELS) as [IngredientType, string][]).map(
              ([val, label]) => (
                <option key={val} value={val}>{label}</option>
              )
            )}
          </select>
        </div>
        <div className="form-group" style={{ flex: 2, minWidth: 140 }}>
          <label>Nom *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Eau filtrée"
            required
          />
        </div>
      </div>

      <div className="quick-form-row">
        <div className="form-group form-group-value">
          <label>Quantité *</label>
          <input
            type="number"
            min="0"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="500"
            required
          />
        </div>
        <div className="form-group">
          <label>Unité</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value as IngredientUnit)}>
            {(Object.entries(INGREDIENT_UNIT_LABELS) as [IngredientUnit, string][]).map(
              ([val, label]) => (
                <option key={val} value={val}>{label}</option>
              )
            )}
          </select>
        </div>
        <div className="form-group">
          <label>Rôle</label>
          <select value={role} onChange={(e) => setRole(e.target.value as IngredientRole)}>
            {(Object.entries(INGREDIENT_ROLE_LABELS) as [IngredientRole, string][]).map(
              ([val, label]) => (
                <option key={val} value={val}>{label}</option>
              )
            )}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Note</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optionnel"
        />
      </div>

      <div className="quick-form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Annuler
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving || !name.trim() || !quantity}
        >
          {saving ? "Ajout…" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}
