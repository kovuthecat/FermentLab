import { useState } from "react";
import type { ObservationCategory } from "../types";
import { OBSERVATION_DESCRIPTORS } from "../types";
import { observationRepository } from "../services/observationRepository";

interface Props {
  batchId: string;
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

const DESCRIPTOR_LABELS: Record<string, string> = {
  clear: "Clair", cloudy: "Trouble", foamy: "Mousseux", bubbly: "Bulleux",
  separated: "Séparé", sediment: "Sédiment", mold_suspected: "Moisissure suspectée", scoby_growth: "Croissance SCOBY",
  neutral: "Neutre", yeasty: "Levuré", fruity: "Fruité", acidic: "Acide",
  vinegar: "Vinaigré", sulfur: "Soufré", alcoholic: "Alcoolisé", unpleasant: "Désagréable",
  sweet: "Sucré", balanced: "Équilibré", bitter: "Amer", bland: "Fade", overfermented: "Surfermenté",
  liquid: "Liquide", thick: "Épais", syrupy: "Sirupeux", creamy: "Crémeux", elastic: "Élastique", collapsed: "Retombé",
  none: "Aucune", low: "Faible", medium: "Moyenne", high: "Élevée", peak: "Pic", declining: "En baisse",
  contamination_suspected: "Contamination suspectée", too_acidic: "Trop acide",
  no_activity: "Pas d'activité", excessive_pressure: "Pression excessive", off_smell: "Odeur anormale",
  other: "Autre",
};

function descriptorLabel(d: string): string {
  return DESCRIPTOR_LABELS[d] ?? d.replace(/_/g, " ");
}

function nowDatetimeLocal(): string {
  const d = new Date();
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

export default function ObservationForm({ batchId, onSaved, onCancel }: Props) {
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
      <div className="quick-form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
