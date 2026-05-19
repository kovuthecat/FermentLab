import { useState } from "react";
import type { ProcessEventType } from "../types";
import { processEventRepository } from "../services/processEventRepository";

interface Props {
  batchId: string;
  onSaved: () => void;
  onCancel: () => void;
}

const EVENT_TYPES: { value: ProcessEventType; label: string }[] = [
  { value: "end_primary_fermentation", label: "Fin F1" },
  { value: "start_secondary_fermentation", label: "Début F2" },
  { value: "end_secondary_fermentation", label: "Fin F2" },
  { value: "refrigeration", label: "Mise au froid" },
  { value: "bottling", label: "Embouteillage" },
  { value: "feeding", label: "Nourrissage" },
  { value: "discard", label: "Discard" },
  { value: "ingredient_added", label: "Ingrédient ajouté" },
  { value: "burping", label: "Dégazage" },
  { value: "mixing", label: "Mélange" },
  { value: "filtering", label: "Filtrage" },
  { value: "start_phase", label: "Début de phase" },
  { value: "end_phase", label: "Fin de phase" },
  { value: "other", label: "Autre" },
];

const DEFAULT_LABELS: Record<ProcessEventType, string> = {
  end_primary_fermentation: "Fin F1",
  start_secondary_fermentation: "Début F2",
  end_secondary_fermentation: "Fin F2",
  refrigeration: "Mise au froid",
  bottling: "Embouteillage",
  feeding: "Nourrissage",
  discard: "Discard",
  ingredient_added: "Ingrédient ajouté",
  burping: "Dégazage",
  mixing: "Mélange",
  filtering: "Filtrage",
  start_phase: "Début de phase",
  end_phase: "Fin de phase",
  other: "",
};

function nowDatetimeLocal(): string {
  const d = new Date();
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

export default function ProcessEventForm({ batchId, onSaved, onCancel }: Props) {
  const [timestamp, setTimestamp] = useState(nowDatetimeLocal);
  const [eventType, setEventType] = useState<ProcessEventType>("end_primary_fermentation");
  const [label, setLabel] = useState(DEFAULT_LABELS["end_primary_fermentation"]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  function handleTypeChange(type: ProcessEventType) {
    setEventType(type);
    setLabel(DEFAULT_LABELS[type]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setSaving(true);
    try {
      await processEventRepository.add({
        batchId,
        timestamp: new Date(timestamp).toISOString(),
        eventType,
        label: label.trim(),
        note: note.trim() || undefined,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="quick-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="ev-type">Type d'événement</label>
        <select
          id="ev-type"
          value={eventType}
          onChange={(e) => handleTypeChange(e.target.value as ProcessEventType)}
        >
          {EVENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div className="quick-form-row">
        <div className="form-group" style={{ flex: 2 }}>
          <label htmlFor="ev-label">Libellé</label>
          <input
            id="ev-label"
            type="text"
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Libellé de l'événement"
          />
        </div>
        <div className="form-group">
          <label htmlFor="ev-ts">Date / heure</label>
          <input
            id="ev-ts"
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="ev-note">Note (optionnel)</label>
        <textarea
          id="ev-note"
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
