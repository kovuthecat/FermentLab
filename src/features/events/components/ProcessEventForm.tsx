import { useState } from "react";
import type { ProcessEventType } from "../types";
import { processEventRepository } from "../services/processEventRepository";
import { nowDatetimeLocal } from "../../../shared/utils/date";

interface Props {
  batchId: string;
  activePhaseId?: string;
  activePhaseName?: string;
  onSaved: () => void;
  onCancel: () => void;
}

const EVENT_TYPES: { value: ProcessEventType; label: string }[] = [
  { value: "bottling", label: "Embouteillage" },
  { value: "filtering", label: "Filtrage" },
  { value: "ingredient_added", label: "Ingrédient ajouté" },
  { value: "burping", label: "Dégazage" },
  { value: "mixing", label: "Mélange" },
  { value: "discard", label: "Discard" },
  { value: "feeding", label: "Nourrissage" },
  { value: "container_changed", label: "Changement de contenant" },
  { value: "other", label: "Autre" },
];

const DEFAULT_LABELS: Record<ProcessEventType, string> = {
  bottling: "Embouteillage",
  filtering: "Filtrage",
  ingredient_added: "Ingrédient ajouté",
  burping: "Dégazage",
  mixing: "Mélange",
  discard: "Discard",
  feeding: "Nourrissage",
  container_changed: "Changement de contenant",
  other: "",
};

export default function ProcessEventForm({ batchId, activePhaseId, activePhaseName, onSaved, onCancel }: Props) {
  const [timestamp, setTimestamp] = useState(nowDatetimeLocal);
  const [eventType, setEventType] = useState<ProcessEventType>("bottling");
  const [label, setLabel] = useState(DEFAULT_LABELS["bottling"]);
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
        phaseId: activePhaseId,
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
