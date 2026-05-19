import { useState } from "react";
import type { MeasurementMetric, MeasurementUnit } from "../types";
import { measurementRepository } from "../services/measurementRepository";
import { nowDatetimeLocal } from "../../../shared/utils/date";

interface Props {
  batchId: string;
  activePhaseId?: string;
  activePhaseName?: string;
  initialMetric?: MeasurementMetric;
  defaultTimestamp?: string;
  onSaved: (timestamp: string) => void;
  onCancel: () => void;
}

const METRICS: { value: MeasurementMetric; label: string }[] = [
  { value: "temperature", label: "Température" },
  { value: "ph", label: "pH" },
  { value: "density_sg", label: "Densité SG" },
  { value: "brix", label: "Brix" },
  { value: "volume", label: "Volume" },
  { value: "weight", label: "Poids" },
  { value: "rise_percent", label: "Montée levain %" },
];

const DEFAULT_UNIT: Record<MeasurementMetric, MeasurementUnit> = {
  temperature: "celsius",
  ph: "ph",
  density_sg: "sg",
  brix: "brix",
  volume: "l",
  weight: "g",
  rise_percent: "percent",
  ambient_temperature: "celsius",
  humidity: "humidity_percent",
};

const UNIT_LABELS: Record<MeasurementUnit, string> = {
  celsius: "°C",
  ph: "pH",
  sg: "SG",
  brix: "°Bx",
  ml: "ml",
  l: "L",
  g: "g",
  percent: "%",
  humidity_percent: "%",
};

export default function MeasurementForm({ batchId, activePhaseId, activePhaseName, initialMetric, defaultTimestamp, onSaved, onCancel }: Props) {
  const [timestamp, setTimestamp] = useState(defaultTimestamp ?? nowDatetimeLocal);
  const [metric, setMetric] = useState<MeasurementMetric>(initialMetric ?? "temperature");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const unit = DEFAULT_UNIT[metric];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setSaving(true);
    try {
      const isoTs = new Date(timestamp).toISOString();
      await measurementRepository.add({
        batchId,
        phaseId: activePhaseId,
        timestamp: isoTs,
        metric,
        value: num,
        unit,
        source: "manual",
        note: note.trim() || undefined,
      });
      onSaved(isoTs);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="quick-form" onSubmit={handleSubmit}>
      <div className="quick-form-row">
        <div className="form-group">
          <label htmlFor="m-metric">Mesure</label>
          <select
            id="m-metric"
            value={metric}
            onChange={(e) => setMetric(e.target.value as MeasurementMetric)}
          >
            {METRICS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group form-group-value">
          <label htmlFor="m-value">Valeur ({UNIT_LABELS[unit]})</label>
          <input
            id="m-value"
            type="number"
            step="any"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="m-ts">Date / heure</label>
        <input
          id="m-ts"
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="m-note">Note (optionnel)</label>
        <textarea
          id="m-note"
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
