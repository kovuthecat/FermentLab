import type { Measurement, MeasurementMetric, MeasurementUnit } from "../../measurements/types";
import type { StructuredObservation, ObservationCategory } from "../../observations/types";
import type { ProcessEvent } from "../../events/types";
import type { Phase } from "../../phases/types";
import { descriptorLabel } from "../../observations/constants";
import { measurementRepository } from "../../measurements/services/measurementRepository";
import { observationRepository } from "../../observations/services/observationRepository";
import { processEventRepository } from "../../events/services/processEventRepository";

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

const CATEGORY_LABELS: Record<ObservationCategory, string> = {
  visual: "Visuel",
  smell: "Odorat",
  taste: "Goût",
  texture: "Texture",
  activity: "Activité",
  problem: "Problème",
};

function formatTimestamp(iso: string, batchStartedAt: string): string {
  const date = new Date(iso);
  const start = new Date(batchStartedAt);
  const diffMs = date.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 0) return `J+0 ${time}`;
  if (diffDays > 0) return `J+${diffDays} ${time}`;
  return date.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function EntryBadge({ kind }: { kind: TimelineEntry["kind"] }) {
  const map = {
    measurement: { label: "Mesure", cls: "timeline-badge-measure" },
    observation: { label: "Observation", cls: "timeline-badge-obs" },
    event: { label: "Événement", cls: "timeline-badge-event" },
  };
  const { label, cls } = map[kind];
  return <span className={`timeline-badge ${cls}`}>{label}</span>;
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

async function deleteEntry(entry: TimelineEntry): Promise<void> {
  if (entry.kind === "measurement") await measurementRepository.remove(entry.data.id);
  else if (entry.kind === "observation") await observationRepository.remove(entry.data.id);
  else await processEventRepository.remove(entry.data.id);
}

export default function BatchTimeline({ measurements, observations, events, batchStartedAt, phases }: Props) {
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

  async function handleDelete(entry: TimelineEntry) {
    if (!window.confirm("Supprimer cette entrée ?")) return;
    await deleteEntry(entry);
  }

  return (
    <ol className="timeline-list">
      {entries.map((entry) => {
        const ts = formatTimestamp(entry.data.timestamp, batchStartedAt);
        const summary =
          entry.kind === "measurement"
            ? measureSummary(entry.data)
            : entry.kind === "observation"
            ? observationSummary(entry.data)
            : entry.data.label;
        const note = entry.data.note;

        return (
          <li key={entry.data.id} className="timeline-item">
            <span className="timeline-ts">{ts}</span>
            <EntryBadge kind={entry.kind} />
            <span className="timeline-summary">{summary}</span>
            {note && <span className="timeline-note">{note}</span>}
            {entry.data.phaseId && phaseById.has(entry.data.phaseId) && (
              <span className="timeline-phase-hint">Phase : {phaseById.get(entry.data.phaseId)!.label}</span>
            )}
            <button
              type="button"
              className="timeline-delete-btn"
              onClick={() => handleDelete(entry)}
              aria-label="Supprimer cette entrée"
            >
              ✕
            </button>
          </li>
        );
      })}
    </ol>
  );
}
