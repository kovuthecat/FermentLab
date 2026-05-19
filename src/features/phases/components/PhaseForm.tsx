import { useState } from "react";
import type { PhaseType } from "../types";
import { phaseRepository } from "../services/phaseRepository";
import { nowDatetimeLocal } from "../../../shared/utils/date";

interface Props {
  batchId: string;
  onSaved: () => void;
  onCancel: () => void;
}

const PHASE_TYPES: { value: PhaseType; label: string }[] = [
  { value: "primary", label: "F1 — Fermentation primaire" },
  { value: "secondary", label: "F2 — Fermentation secondaire" },
  { value: "refrigeration", label: "Mise au froid" },
  { value: "feeding", label: "Nourrissage" },
  { value: "rise", label: "Pousse" },
  { value: "rest", label: "Repos" },
  { value: "bulk_fermentation", label: "Fermentation en masse" },
  { value: "proofing", label: "Apprêt" },
  { value: "other", label: "Autre" },
];

const DEFAULT_LABELS: Record<PhaseType, string> = {
  primary: "F1 — Fermentation primaire",
  secondary: "F2 — Fermentation secondaire",
  refrigeration: "Mise au froid",
  feeding: "Nourrissage",
  rise: "Pousse",
  rest: "Repos",
  bulk_fermentation: "Fermentation en masse",
  proofing: "Apprêt",
  other: "",
};

export default function PhaseForm({ batchId, onSaved, onCancel }: Props) {
  const [type, setType] = useState<PhaseType>("primary");
  const [label, setLabel] = useState(DEFAULT_LABELS["primary"]);
  const [startedAt, setStartedAt] = useState(nowDatetimeLocal);
  const [endedAt, setEndedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  function handleTypeChange(t: PhaseType) {
    setType(t);
    setLabel(DEFAULT_LABELS[t]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setSaving(true);
    try {
      await phaseRepository.add({
        batchId,
        type,
        label: label.trim(),
        startedAt: new Date(startedAt).toISOString(),
        endedAt: endedAt ? new Date(endedAt).toISOString() : undefined,
        notes: notes.trim() || undefined,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="quick-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="ph-type">Type de phase</label>
        <select
          id="ph-type"
          value={type}
          onChange={(e) => handleTypeChange(e.target.value as PhaseType)}
        >
          {PHASE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div className="quick-form-row">
        <div className="form-group" style={{ flex: 2 }}>
          <label htmlFor="ph-label">Libellé</label>
          <input
            id="ph-label"
            type="text"
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Nom de la phase"
          />
        </div>
        <div className="form-group">
          <label htmlFor="ph-start">Début</label>
          <input
            id="ph-start"
            type="datetime-local"
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="ph-end">Fin (optionnel)</label>
        <input
          id="ph-end"
          type="datetime-local"
          value={endedAt}
          onChange={(e) => setEndedAt(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="ph-notes">Notes (optionnel)</label>
        <textarea
          id="ph-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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
