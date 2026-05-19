import { useState } from "react";
import type { ObservationCategory } from "../types";
import { OBSERVATION_DESCRIPTORS } from "../types";
import { observationRepository } from "../services/observationRepository";
import { descriptorLabel } from "../constants";
import { nowDatetimeLocal } from "../../../shared/utils/date";

interface Props {
  batchId: string;
  activePhaseId?: string;
  activePhaseName?: string;
  onSaved: () => void;
  onCancel: () => void;
}

const CATEGORIES: { value: ObservationCategory; label: string }[] = [
  { value: "visual", label: "Visuel" },
  { value: "smell", label: "Odorat" },
  { value: "taste", label: "Goût" },
  { value: "texture", label: "Texture" },
  { value: "activity", label: "Activité" },
  { value: "problem", label: "Problème" },
];

export default function ObservationForm({ batchId, activePhaseId, activePhaseName, onSaved, onCancel }: Props) {
  const [timestamp, setTimestamp] = useState(nowDatetimeLocal);
  const [category, setCategory] = useState<ObservationCategory>("activity");
  const [descriptor, setDescriptor] = useState<string>("");
  const [intensity, setIntensity] = useState<string>("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const descriptors = [...(OBSERVATION_DESCRIPTORS[category] ?? []), "other"];

  function handleCategoryChange(cat: ObservationCategory) {
    setCategory(cat);
    setDescriptor("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!descriptor) return;
    setSaving(true);
    try {
      const intensityNum = intensity ? (parseInt(intensity) as 1 | 2 | 3 | 4 | 5) : undefined;
      await observationRepository.add({
        batchId,
        phaseId: activePhaseId,
        timestamp: new Date(timestamp).toISOString(),
        category,
        descriptor,
        intensity: intensityNum,
        note: note.trim() || undefined,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="quick-form" onSubmit={handleSubmit}>
      <div className="quick-form-row">
        <div className="form-group">
          <label htmlFor="o-category">Catégorie</label>
          <select
            id="o-category"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as ObservationCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="o-descriptor">Descripteur</label>
          <select
            id="o-descriptor"
            required
            value={descriptor}
            onChange={(e) => setDescriptor(e.target.value)}
          >
            <option value="">— choisir —</option>
            {descriptors.map((d) => (
              <option key={d} value={d}>{descriptorLabel(d)}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="quick-form-row">
        <div className="form-group">
          <label htmlFor="o-ts">Date / heure</label>
          <input
            id="o-ts"
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </div>
        <div className="form-group form-group-intensity">
          <label htmlFor="o-intensity">Intensité (1–5)</label>
          <select
            id="o-intensity"
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
          >
            <option value="">—</option>
            {[1, 2, 3, 4, 5].map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="o-note">Note (optionnel)</label>
        <textarea
          id="o-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Remarques…"
        />
      </div>
      <p className="phase-hint">
        {activePhaseName
          ? `Phase associée : ${activePhaseName}`
          : "Aucune phase active — entrée non associée à une phase"}
      </p>
      <div className="quick-form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
