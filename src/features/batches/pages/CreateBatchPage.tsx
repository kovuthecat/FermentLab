import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../db/database";
import { FERMENTATION_PROFILES } from "../../profiles/data/profiles";
import type { Batch } from "../types";

function randomId(): string {
  return crypto.randomUUID();
}

export default function CreateBatchPage() {
  const navigate = useNavigate();
  const [profileId, setProfileId] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profileId || !name.trim()) return;

    setSubmitting(true);
    setError(null);

    const now = new Date().toISOString();
    const batch: Batch = {
      id: randomId(),
      schemaVersion: "1.0",
      profileId,
      name: name.trim(),
      status: "active",
      startedAt: now,
      initialParameters: { ingredients: [] },
      container: {},
      createdAt: now,
      updatedAt: now,
    };

    try {
      await db.batches.add(batch);
      navigate("/");
    } catch (err) {
      setError("Erreur lors de la création du batch.");
      setSubmitting(false);
    }
  }

  return (
    <div className="page create-batch">
      <div className="page-header">
        <h1>Nouveau batch</h1>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="profile">Type de fermentation</label>
          <select
            id="profile"
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
            required
          >
            <option value="">— Choisir —</option>
            {FERMENTATION_PROFILES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="name">Nom du batch</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Kéfir citron-gingembre #3"
            required
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/")}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting || !profileId || !name.trim()}>
            {submitting ? "Création…" : "Démarrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
