import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../../../db/database";
import { FERMENTATION_PROFILES } from "../../profiles/data/profiles";
import type { Batch, CultureSnapshot, CultureSnapshotType } from "../types";

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const CULTURE_TYPE_LABELS: Record<CultureSnapshotType, string> = {
  kombucha_scoby: "SCOBY",
  water_kefir_grains: "Grains de kéfir d'eau",
  milk_kefir_grains: "Grains de kéfir de lait",
  sourdough_starter: "Levain",
  other: "Autre",
};

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

export default function CreateBatchPage() {
  const navigate = useNavigate();

  const [profileId, setProfileId] = useState("");
  const [name, setName] = useState("");
  const [startedAt, setStartedAt] = useState(() => toDatetimeLocal(new Date()));

  const [cultureType, setCultureType] = useState<CultureSnapshotType | "">("");
  const [cultureName, setCultureName] = useState("");
  const [refrigerated, setRefrigerated] = useState(false);
  const [refrigerationHours, setRefrigerationHours] = useState("");
  const [lastFeedingAt, setLastFeedingAt] = useState("");
  const [activityScore, setActivityScore] = useState("");
  const [cultureNotes, setCultureNotes] = useState("");

  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleProfileChange(id: string) {
    setProfileId(id);
    const defaultCulture = PROFILE_CULTURE_DEFAULTS[id];
    setCultureType(defaultCulture ?? "");
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
      initialParameters: { ingredients: [] },
      container: {},
      ...(cultureSnapshot && { cultureSnapshot }),
      ...(notes.trim() && { notes: notes.trim() }),
      createdAt: now,
      updatedAt: now,
    };

    try {
      await db.batches.add(batch);
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
