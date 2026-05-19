import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../../../db/database";
import { FERMENTATION_PROFILES } from "../../profiles/data/profiles";
import type {
  Batch,
  CultureSnapshot,
  CultureSnapshotType,
  IngredientEntry,
  IngredientType,
  IngredientUnit,
  IngredientRole,
} from "../types";
import { CULTURE_TYPE_LABELS } from "../constants";
import {
  INGREDIENT_TYPE_LABELS,
  INGREDIENT_UNIT_LABELS,
  INGREDIENT_ROLE_LABELS,
  DEFAULT_INGREDIENT_UNITS,
} from "../../ingredients/constants";
import { nowDatetimeLocal } from "../../../shared/utils/date";

const PROFILE_CULTURE_DEFAULTS: Partial<Record<string, CultureSnapshotType>> = {
  water_kefir: "water_kefir_grains",
  milk_kefir: "milk_kefir_grains",
  kombucha: "kombucha_scoby",
  sourdough_starter: "sourdough_starter",
};

const ACTIVITY_LABELS: Record<string, string> = {
  "1": "1 — Très faible",
  "2": "2 — Faible",
  "3": "3 — Moyen",
  "4": "4 — Bonne",
  "5": "5 — Excellente",
};

type IngredientDraft = {
  key: string;
  ingredientType: IngredientType;
  name: string;
  quantity: string;
  unit: IngredientUnit;
  role: IngredientRole;
};

type IngredientDefaults = Omit<IngredientDraft, "key">;

const PROFILE_INGREDIENT_DEFAULTS: Record<string, IngredientDefaults[]> = {
  water_kefir: [
    { ingredientType: "water", name: "Eau", quantity: "1000", unit: "ml", role: "base" },
    { ingredientType: "sugar", name: "Sucre", quantity: "60", unit: "g", role: "substrate" },
    { ingredientType: "starter", name: "Grains de kéfir d'eau", quantity: "50", unit: "g", role: "inoculum" },
    { ingredientType: "fruit", name: "Citron", quantity: "1", unit: "unit", role: "flavoring" },
  ],
  milk_kefir: [
    { ingredientType: "milk", name: "Lait", quantity: "500", unit: "ml", role: "base" },
    { ingredientType: "starter", name: "Grains de kéfir de lait", quantity: "20", unit: "g", role: "inoculum" },
  ],
  kombucha: [
    { ingredientType: "water", name: "Eau filtrée", quantity: "700", unit: "ml", role: "base" },
    { ingredientType: "tea", name: "Thé", quantity: "8", unit: "g", role: "substrate" },
    { ingredientType: "sugar", name: "Sucre", quantity: "80", unit: "g", role: "substrate" },
    { ingredientType: "starter", name: "SCOBY", quantity: "1", unit: "unit", role: "inoculum" },
    { ingredientType: "starter", name: "Liquide starter (thé fermenté)", quantity: "200", unit: "ml", role: "inoculum" },
  ],
  sourdough_starter: [
    { ingredientType: "flour", name: "Farine", quantity: "50", unit: "g", role: "substrate" },
    { ingredientType: "water", name: "Eau", quantity: "50", unit: "ml", role: "base" },
    { ingredientType: "starter", name: "Levain chef", quantity: "20", unit: "g", role: "inoculum" },
  ],
};

export default function CreateBatchPage() {
  const navigate = useNavigate();

  const [profileId, setProfileId] = useState("");
  const [name, setName] = useState("");
  const [startedAt, setStartedAt] = useState(nowDatetimeLocal);

  const [cultureType, setCultureType] = useState<CultureSnapshotType | "">("");
  const [cultureName, setCultureName] = useState("");
  const [refrigerated, setRefrigerated] = useState(false);
  const [refrigerationHours, setRefrigerationHours] = useState("");
  const [lastFeedingAt, setLastFeedingAt] = useState("");
  const [activityScore, setActivityScore] = useState("");
  const [cultureNotes, setCultureNotes] = useState("");

  const [ingredients, setIngredients] = useState<IngredientDraft[]>([]);

  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleProfileChange(id: string) {
    setProfileId(id);
    const defaultCulture = PROFILE_CULTURE_DEFAULTS[id];
    setCultureType(defaultCulture ?? "");
    const defaults = PROFILE_INGREDIENT_DEFAULTS[id] ?? [];
    setIngredients(defaults.map((d) => ({ ...d, key: crypto.randomUUID() })));
  }

  function updateIngredient(key: string, field: keyof IngredientDefaults, value: string) {
    setIngredients((prev) =>
      prev.map((d) => {
        if (d.key !== key) return d;
        const updated = { ...d, [field]: value };
        if (field === "ingredientType") {
          updated.unit = DEFAULT_INGREDIENT_UNITS[value as IngredientType];
        }
        return updated;
      })
    );
  }

  function removeIngredient(key: string) {
    setIngredients((prev) => prev.filter((d) => d.key !== key));
  }

  function addIngredient() {
    setIngredients((prev) => [
      ...prev,
      { key: crypto.randomUUID(), ingredientType: "other", name: "", quantity: "", unit: "g", role: "other" },
    ]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profileId || !name.trim()) return;

    setSubmitting(true);
    setError(null);

    let cultureSnapshot: CultureSnapshot | undefined;
    if (cultureType) {
      cultureSnapshot = {
        type: cultureType,
        ...(cultureName.trim() && { name: cultureName.trim() }),
        refrigerated,
        ...(refrigerated && refrigerationHours && {
          refrigerationDurationHours: Number(refrigerationHours),
        }),
        ...(lastFeedingAt && { lastFeedingAt: new Date(lastFeedingAt).toISOString() }),
        ...(activityScore && {
          estimatedActivityScore: Number(activityScore) as 1 | 2 | 3 | 4 | 5,
        }),
        ...(cultureNotes.trim() && { notes: cultureNotes.trim() }),
      };
    }

    const now = new Date().toISOString();
    const batch: Batch = {
      id: crypto.randomUUID(),
      schemaVersion: "1.0",
      profileId,
      name: name.trim(),
      status: "active",
      startedAt: new Date(startedAt).toISOString(),
      initialParameters: {},
      container: {},
      ...(cultureSnapshot && { cultureSnapshot }),
      ...(notes.trim() && { notes: notes.trim() }),
      createdAt: now,
      updatedAt: now,
    };

    try {
      await db.batches.add(batch);

      const ingredientEntries: IngredientEntry[] = ingredients
        .filter((d) => d.name.trim() && d.quantity)
        .map((d) => ({
          id: crypto.randomUUID(),
          batchId: batch.id,
          ingredientType: d.ingredientType,
          name: d.name.trim(),
          quantity: Number(d.quantity),
          unit: d.unit,
          role: d.role,
        }));

      if (ingredientEntries.length > 0) {
        await db.ingredients.bulkAdd(ingredientEntries);
      }

      navigate(`/batches/${batch.id}`);
    } catch {
      setError("Erreur lors de la création du batch.");
      setSubmitting(false);
    }
  }

  return (
    <div className="page create-batch">
      <div className="page-header">
        <Link to="/" className="back-link">← Retour</Link>
        <h1>Nouveau batch</h1>
      </div>

      <form className="form" onSubmit={handleSubmit}>

        <fieldset className="form-section">
          <legend>Fermentation</legend>

          <div className="form-group">
            <label htmlFor="profile">Type de fermentation *</label>
            <select
              id="profile"
              value={profileId}
              onChange={(e) => handleProfileChange(e.target.value)}
              required
            >
              <option value="">— Choisir —</option>
              {FERMENTATION_PROFILES.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="name">Nom du batch *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Kéfir citron-gingembre #3"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startedAt">Date et heure de début</label>
            <input
              id="startedAt"
              type="datetime-local"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes initiales</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contexte, recette, particularités…"
              rows={3}
            />
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>État de la culture</legend>

          <div className="form-group">
            <label htmlFor="cultureType">Type de culture</label>
            <select
              id="cultureType"
              value={cultureType}
              onChange={(e) => setCultureType(e.target.value as CultureSnapshotType | "")}
            >
              <option value="">— Non renseigné —</option>
              {(Object.entries(CULTURE_TYPE_LABELS) as [CultureSnapshotType, string][]).map(
                ([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                )
              )}
            </select>
          </div>

          {cultureType && (
            <>
              <div className="form-group">
                <label htmlFor="cultureName">Nom de la culture</label>
                <input
                  id="cultureName"
                  type="text"
                  value={cultureName}
                  onChange={(e) => setCultureName(e.target.value)}
                  placeholder="Ex. Greta, Scoby #2…"
                />
              </div>

              <div className="form-group form-group-inline">
                <label htmlFor="refrigerated">Culture réfrigérée avant usage</label>
                <input
                  id="refrigerated"
                  type="checkbox"
                  checked={refrigerated}
                  onChange={(e) => {
                    setRefrigerated(e.target.checked);
                    if (!e.target.checked) setRefrigerationHours("");
                  }}
                />
              </div>

              {refrigerated && (
                <div className="form-group">
                  <label htmlFor="refrigerationHours">Durée de réfrigération (heures)</label>
                  <input
                    id="refrigerationHours"
                    type="number"
                    min="0"
                    step="1"
                    value={refrigerationHours}
                    onChange={(e) => setRefrigerationHours(e.target.value)}
                    placeholder="Ex. 48"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="lastFeedingAt">Dernier nourrissage</label>
                <input
                  id="lastFeedingAt"
                  type="datetime-local"
                  value={lastFeedingAt}
                  onChange={(e) => setLastFeedingAt(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="activityScore">Activité estimée</label>
                <select
                  id="activityScore"
                  value={activityScore}
                  onChange={(e) => setActivityScore(e.target.value)}
                >
                  <option value="">— Non évaluée —</option>
                  {Object.entries(ACTIVITY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="cultureNotes">Notes sur la culture</label>
                <textarea
                  id="cultureNotes"
                  value={cultureNotes}
                  onChange={(e) => setCultureNotes(e.target.value)}
                  placeholder="Aspect, odeur, observations particulières…"
                  rows={2}
                />
              </div>
            </>
          )}
        </fieldset>

        <fieldset className="form-section">
          <legend>Ingrédients initiaux</legend>

          {ingredients.length > 0 ? (
            <div className="ingredient-drafts">
              {ingredients.map((draft) => (
                <div key={draft.key} className="ingredient-draft">
                  <button
                    type="button"
                    className="ingredient-draft-remove"
                    onClick={() => removeIngredient(draft.key)}
                    aria-label="Supprimer cet ingrédient"
                  >
                    ✕
                  </button>

                  <div className="ingredient-draft-row">
                    <div className="form-group">
                      <label>Type</label>
                      <select
                        value={draft.ingredientType}
                        onChange={(e) => updateIngredient(draft.key, "ingredientType", e.target.value)}
                      >
                        {(Object.entries(INGREDIENT_TYPE_LABELS) as [IngredientType, string][]).map(
                          ([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          )
                        )}
                      </select>
                    </div>
                    <div className="form-group form-group-draft-name">
                      <label>Nom</label>
                      <input
                        type="text"
                        value={draft.name}
                        onChange={(e) => updateIngredient(draft.key, "name", e.target.value)}
                        placeholder="Ex. Eau filtrée"
                      />
                    </div>
                  </div>

                  <div className="ingredient-draft-row">
                    <div className="form-group form-group-value">
                      <label>Qté</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={draft.quantity}
                        onChange={(e) => updateIngredient(draft.key, "quantity", e.target.value)}
                        placeholder="500"
                      />
                    </div>
                    <div className="form-group">
                      <label>Unité</label>
                      <select
                        value={draft.unit}
                        onChange={(e) => updateIngredient(draft.key, "unit", e.target.value)}
                      >
                        {(Object.entries(INGREDIENT_UNIT_LABELS) as [IngredientUnit, string][]).map(
                          ([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          )
                        )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Rôle</label>
                      <select
                        value={draft.role}
                        onChange={(e) => updateIngredient(draft.key, "role", e.target.value)}
                      >
                        {(Object.entries(INGREDIENT_ROLE_LABELS) as [IngredientRole, string][]).map(
                          ([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty">
              {profileId
                ? "Aucun ingrédient — cliquez sur Ajouter ou changez le profil."
                : "Choisissez un profil pour pré-remplir les ingrédients suggérés."}
            </p>
          )}

          <button
            type="button"
            className="btn btn-ghost ingredient-add-btn"
            onClick={addIngredient}
          >
            + Ajouter un ingrédient
          </button>
        </fieldset>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/")}>
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || !profileId || !name.trim()}
          >
            {submitting ? "Création…" : "Démarrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
