import { useState } from "react";
import type { Measurement, MeasurementMetric, MeasurementUnit } from "../../measurements/types";
import type { StructuredObservation, ObservationCategory } from "../../observations/types";
import type { ProcessEvent, ProcessEventType } from "../../events/types";
import type { Phase, PhaseType } from "../../phases/types";
import { OBSERVATION_DESCRIPTORS } from "../../observations/types";
import { descriptorLabel } from "../../observations/constants";
import { measurementRepository } from "../../measurements/services/measurementRepository";
import { observationRepository } from "../../observations/services/observationRepository";
import { processEventRepository } from "../../events/services/processEventRepository";
import { isoToDatetimeLocal } from "../../../shared/utils/date";

interface Props {
  measurements: Measurement[];
  observations: StructuredObservation[];
  events: ProcessEvent[];
  batchStartedAt: string;
  phases?: Phase[];
}

type TimelineEntry =
  | { kind: "measurement"; data: Measurement }
  | { kind: "observation"; data: StructuredObservation }
  | { kind: "event"; data: ProcessEvent };

type DayGroup = { dateKey: string; label: string; entries: TimelineEntry[] };

// ── Constants ────────────────────────────────────────────────────────────────

const METRIC_LABELS: Record<MeasurementMetric, string> = {
  temperature: "Température",
  ph: "pH",
  density_sg: "Densité SG",
  brix: "Brix",
  volume: "Volume",
  weight: "Poids",
  rise_percent: "Montée levain",
  ambient_temperature: "T° ambiante",
  humidity: "Humidité",
};

const UNIT_LABELS: Record<MeasurementUnit, string> = {
  celsius: "°C",
  ph: "",
  sg: " SG",
  brix: " °Bx",
  ml: " ml",
  l: " L",
  g: " g",
  percent: "%",
  humidity_percent: "%",
};

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

const CATEGORY_LABELS: Record<ObservationCategory, string> = {
  visual: "Visuel",
  smell: "Odorat",
  taste: "Goût",
  texture: "Texture",
  activity: "Activité",
  problem: "Problème",
};

const CATEGORIES: { value: ObservationCategory; label: string }[] = [
  { value: "visual", label: "Visuel" },
  { value: "smell", label: "Odorat" },
  { value: "taste", label: "Goût" },
  { value: "texture", label: "Texture" },
  { value: "activity", label: "Activité" },
  { value: "problem", label: "Problème" },
];

const METRICS_LIST: { value: MeasurementMetric; label: string }[] = [
  { value: "temperature", label: "Température" },
  { value: "ph", label: "pH" },
  { value: "density_sg", label: "Densité SG" },
  { value: "brix", label: "Brix" },
  { value: "volume", label: "Volume" },
  { value: "weight", label: "Poids" },
  { value: "rise_percent", label: "Montée levain %" },
];

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

const DEFAULT_EVENT_LABELS: Record<ProcessEventType, string> = {
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

const PHASE_BADGES: Partial<Record<PhaseType, string>> = {
  primary: "F1",
  secondary: "F2",
  refrigeration: "FROID",
  feeding: "NOURR",
  rise: "POUSSE",
  rest: "REPOS",
  bulk_fermentation: "BULK",
  proofing: "APPRET",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupByDay(entries: TimelineEntry[]): DayGroup[] {
  const groups = new Map<string, TimelineEntry[]>();
  for (const entry of entries) {
    const d = new Date(entry.data.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, dayEntries]) => ({
      dateKey: key,
      label: new Date(dayEntries[0].data.timestamp).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      entries: dayEntries,
    }));
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function measureSummary(m: Measurement): string {
  const unitStr = UNIT_LABELS[m.unit] ?? "";
  return `${METRIC_LABELS[m.metric] ?? m.metric} : ${m.value}${unitStr}`;
}

function observationSummary(o: StructuredObservation): string {
  const cat = CATEGORY_LABELS[o.category] ?? o.category;
  const desc = descriptorLabel(o.descriptor);
  const intensity = o.intensity ? ` (${o.intensity}/5)` : "";
  return `${cat} — ${desc}${intensity}`;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function EntryBadge({ kind }: { kind: TimelineEntry["kind"] }) {
  const map = {
    measurement: { label: "Mesure", cls: "timeline-badge-measure" },
    observation: { label: "Observation", cls: "timeline-badge-obs" },
    event: { label: "Événement", cls: "timeline-badge-event" },
  };
  const { label, cls } = map[kind];
  return <span className={`timeline-badge ${cls}`}>{label}</span>;
}

function PhaseBadge({ phase }: { phase: Phase }) {
  const label = PHASE_BADGES[phase.type] ?? phase.label.slice(0, 6).toUpperCase();
  return <span className="timeline-phase-badge">{label}</span>;
}

// ── Inline Editors ─────────────────────────────────────────────────────────────

function MeasurementEditor({
  entry,
  onSave,
  onCancel,
}: {
  entry: Measurement;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [timestamp, setTimestamp] = useState(isoToDatetimeLocal(entry.timestamp));
  const [metric, setMetric] = useState<MeasurementMetric>(entry.metric);
  const [value, setValue] = useState(String(entry.value));
  const [note, setNote] = useState(entry.note ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setSaving(true);
    try {
      await measurementRepository.update(entry.id, {
        timestamp: new Date(timestamp).toISOString(),
        metric,
        value: num,
        unit: DEFAULT_UNIT[metric],
        note: note.trim() || undefined,
      });
      onSave();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="timeline-editor" onSubmit={handleSubmit}>
      <div className="timeline-editor-row">
        <div className="form-group">
          <label>Mesure</label>
          <select value={metric} onChange={(e) => setMetric(e.target.value as MeasurementMetric)}>
            {METRICS_LIST.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group form-group-value">
          <label>Valeur ({UNIT_LABELS[DEFAULT_UNIT[metric]]})</label>
          <input
            type="number"
            step="any"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
      </div>
      <div className="timeline-editor-row">
        <div className="form-group">
          <label>Date / heure</label>
          <input
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Note</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Remarque…"
          />
        </div>
      </div>
      <div className="timeline-editor-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

function ObservationEditor({
  entry,
  onSave,
  onCancel,
}: {
  entry: StructuredObservation;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [timestamp, setTimestamp] = useState(isoToDatetimeLocal(entry.timestamp));
  const [category, setCategory] = useState<ObservationCategory>(entry.category);
  const [descriptor, setDescriptor] = useState(entry.descriptor);
  const [intensity, setIntensity] = useState(entry.intensity ? String(entry.intensity) : "");
  const [note, setNote] = useState(entry.note ?? "");
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
      await observationRepository.update(entry.id, {
        timestamp: new Date(timestamp).toISOString(),
        category,
        descriptor,
        intensity: intensityNum,
        note: note.trim() || undefined,
      });
      onSave();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="timeline-editor" onSubmit={handleSubmit}>
      <div className="timeline-editor-row">
        <div className="form-group">
          <label>Catégorie</label>
          <select value={category} onChange={(e) => handleCategoryChange(e.target.value as ObservationCategory)}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Descripteur</label>
          <select required value={descriptor} onChange={(e) => setDescriptor(e.target.value)}>
            <option value="">— choisir —</option>
            {descriptors.map((d) => (
              <option key={d} value={d}>{descriptorLabel(d)}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="timeline-editor-row">
        <div className="form-group">
          <label>Date / heure</label>
          <input
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </div>
        <div className="form-group form-group-intensity">
          <label>Intensité (1–5)</label>
          <select value={intensity} onChange={(e) => setIntensity(e.target.value)}>
            <option value="">—</option>
            {[1, 2, 3, 4, 5].map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ flex: 2 }}>
          <label>Note</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Remarque…"
          />
        </div>
      </div>
      <div className="timeline-editor-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

function ProcessEventEditor({
  entry,
  onSave,
  onCancel,
}: {
  entry: ProcessEvent;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [timestamp, setTimestamp] = useState(isoToDatetimeLocal(entry.timestamp));
  const [eventType, setEventType] = useState<ProcessEventType>(entry.eventType);
  const [label, setLabel] = useState(entry.label);
  const [note, setNote] = useState(entry.note ?? "");
  const [saving, setSaving] = useState(false);

  function handleTypeChange(type: ProcessEventType) {
    setEventType(type);
    const defaultLabel = DEFAULT_EVENT_LABELS[type];
    if (defaultLabel) setLabel(defaultLabel);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setSaving(true);
    try {
      await processEventRepository.update(entry.id, {
        timestamp: new Date(timestamp).toISOString(),
        eventType,
        label: label.trim(),
        note: note.trim() || undefined,
      });
      onSave();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="timeline-editor" onSubmit={handleSubmit}>
      <div className="timeline-editor-row">
        <div className="form-group">
          <label>Type</label>
          <select value={eventType} onChange={(e) => handleTypeChange(e.target.value as ProcessEventType)}>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ flex: 2 }}>
          <label>Libellé</label>
          <input
            type="text"
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Libellé de l'événement"
          />
        </div>
      </div>
      <div className="timeline-editor-row">
        <div className="form-group">
          <label>Date / heure</label>
          <input
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ flex: 2 }}>
          <label>Note</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Remarque…"
          />
        </div>
      </div>
      <div className="timeline-editor-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function BatchTimeline({ measurements, observations, events, phases }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  }

  const phaseById = new Map((phases ?? []).map((p) => [p.id, p]));

  const entries: TimelineEntry[] = [
    ...measurements.map((m): TimelineEntry => ({ kind: "measurement", data: m })),
    ...observations.map((o): TimelineEntry => ({ kind: "observation", data: o })),
    ...events.map((ev): TimelineEntry => ({ kind: "event", data: ev })),
  ].sort((a, b) => a.data.timestamp.localeCompare(b.data.timestamp));

  if (entries.length === 0) {
    return (
      <p className="timeline-empty">
        Aucune entrée. Utilisez les boutons ci-dessus pour commencer le suivi.
      </p>
    );
  }

  const dayGroups = groupByDay(entries);

  async function handleDelete(entry: TimelineEntry) {
    if (!window.confirm("Supprimer cette entrée ?")) return;
    if (entry.kind === "measurement") await measurementRepository.remove(entry.data.id);
    else if (entry.kind === "observation") await observationRepository.remove(entry.data.id);
    else await processEventRepository.remove(entry.data.id);
    showFeedback("Entrée supprimée");
  }

  return (
    <div className="timeline-days">
      {feedback && <p className="timeline-feedback">{feedback}</p>}
      {dayGroups.map((group) => (
        <div key={group.dateKey} className="timeline-day-group">
          <div className="timeline-day-header">{group.label}</div>
          <ol className="timeline-list">
            {group.entries.map((entry) => {
              if (editingId === entry.data.id) {
                return (
                  <li key={entry.data.id} className="timeline-item timeline-item-editing">
                    {entry.kind === "measurement" && (
                      <MeasurementEditor
                        entry={entry.data}
                        onSave={() => { setEditingId(null); showFeedback("Mesure modifiée ✓"); }}
                        onCancel={() => setEditingId(null)}
                      />
                    )}
                    {entry.kind === "observation" && (
                      <ObservationEditor
                        entry={entry.data}
                        onSave={() => { setEditingId(null); showFeedback("Observation modifiée ✓"); }}
                        onCancel={() => setEditingId(null)}
                      />
                    )}
                    {entry.kind === "event" && (
                      <ProcessEventEditor
                        entry={entry.data}
                        onSave={() => { setEditingId(null); showFeedback("Événement modifié ✓"); }}
                        onCancel={() => setEditingId(null)}
                      />
                    )}
                  </li>
                );
              }

              const ts = formatTime(entry.data.timestamp);
              const summary =
                entry.kind === "measurement"
                  ? measureSummary(entry.data)
                  : entry.kind === "observation"
                  ? observationSummary(entry.data)
                  : entry.data.label;
              const note = entry.data.note;
              const phase = entry.data.phaseId ? phaseById.get(entry.data.phaseId) : undefined;

              return (
                <li key={entry.data.id} className="timeline-item">
                  <span className="timeline-ts">{ts}</span>
                  <EntryBadge kind={entry.kind} />
                  <span className="timeline-summary">{summary}</span>
                  {phase && <PhaseBadge phase={phase} />}
                  {note && <span className="timeline-note">{note}</span>}
                  <div className="timeline-actions">
                    <button
                      type="button"
                      className="timeline-edit-btn"
                      onClick={() => setEditingId(entry.data.id)}
                      aria-label="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="timeline-delete-btn"
                      onClick={() => handleDelete(entry)}
                      aria-label="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
