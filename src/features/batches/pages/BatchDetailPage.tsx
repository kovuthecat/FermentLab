import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useParams, Link } from "react-router-dom";
import { db } from "../../../db/database";
import { getProfile } from "../../profiles/data/profiles";
import type { BatchStatus, CultureSnapshot, CultureSnapshotType } from "../types";
import { useMeasurements } from "../../measurements/hooks/useMeasurements";
import { useObservations } from "../../observations/hooks/useObservations";
import { useProcessEvents } from "../../events/hooks/useProcessEvents";
import MeasurementForm from "../../measurements/components/MeasurementForm";
import ObservationForm from "../../observations/components/ObservationForm";
import ProcessEventForm from "../../events/components/ProcessEventForm";
import BatchTimeline from "../../timeline/components/BatchTimeline";
import { usePhases } from "../../phases/hooks/usePhases";
import PhaseList from "../../phases/components/PhaseList";

type ActiveForm = "measurement" | "observation" | "event" | null;

const STATUS_LABELS: Record<BatchStatus, string> = {
  active: "En cours",
  completed: "Terminé",
  abandoned: "Abandonné",
};

const CULTURE_TYPE_LABELS: Record<CultureSnapshotType, string> = {
  kombucha_scoby: "SCOBY",
  water_kefir_grains: "Grains de kéfir d'eau",
  milk_kefir_grains: "Grains de kéfir de lait",
  sourdough_starter: "Levain",
  other: "Autre",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="detail-field">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}

function CultureSection({ culture }: { culture: CultureSnapshot }) {
  return (
    <div className="detail-block">
      <Field label="Type" value={CULTURE_TYPE_LABELS[culture.type] ?? culture.type} />
      <Field label="Nom" value={culture.name} />
      <Field
        label="Réfrigérée"
        value={
          culture.refrigerated
            ? culture.refrigerationDurationHours
              ? `Oui — ${culture.refrigerationDurationHours}h au frigo`
              : "Oui"
            : "Non"
        }
      />
      <Field
        label="Dernier nourrissage"
        value={culture.lastFeedingAt ? formatDate(culture.lastFeedingAt) : undefined}
      />
      <Field
        label="Activité estimée"
        value={culture.estimatedActivityScore ? `${culture.estimatedActivityScore}/5` : undefined}
      />
      <Field label="Notes" value={culture.notes} />
    </div>
  );
}

function QuickAddBar({
  active,
  onChange,
}: {
  active: ActiveForm;
  onChange: (f: ActiveForm) => void;
}) {
  function toggle(f: Exclude<ActiveForm, null>) {
    onChange(active === f ? null : f);
  }
  return (
    <div className="quick-add-bar">
      <button
        type="button"
        className={`btn btn-ghost ${active === "measurement" ? "btn-ghost-active" : ""}`}
        onClick={() => toggle("measurement")}
      >
        + Mesure
      </button>
      <button
        type="button"
        className={`btn btn-ghost ${active === "observation" ? "btn-ghost-active" : ""}`}
        onClick={() => toggle("observation")}
      >
        + Observation
      </button>
      <button
        type="button"
        className={`btn btn-ghost ${active === "event" ? "btn-ghost-active" : ""}`}
        onClick={() => toggle("event")}
      >
        + Événement
      </button>
    </div>
  );
}

export default function BatchDetailPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);

  const batch = useLiveQuery(
    () => (batchId ? db.batches.get(batchId) : undefined),
    [batchId]
  );

  const measurements = useMeasurements(batchId ?? "");
  const observations = useObservations(batchId ?? "");
  const events = useProcessEvents(batchId ?? "");
  const phases = usePhases(batchId ?? "");

  if (batch === undefined) {
    return <div className="page"><p className="loading">Chargement…</p></div>;
  }

  if (batch === null) {
    return (
      <div className="page">
        <p className="empty">Batch introuvable. <Link to="/">Retour au dashboard</Link></p>
      </div>
    );
  }

  const profile = getProfile(batch.profileId);

  function handleSaved() {
    setActiveForm(null);
  }

  function handleCancel() {
    setActiveForm(null);
  }

  return (
    <div className="page batch-detail">
      <div className="page-header-back">
        <Link to="/" className="back-link">← Fermentations</Link>
      </div>

      <div className="detail-hero">
        <h1>{batch.name}</h1>
        <span className={`badge badge-${batch.status}`}>{STATUS_LABELS[batch.status]}</span>
      </div>

      <section>
        <h2>Informations générales</h2>
        <div className="detail-block">
          <Field label="Type" value={profile?.name ?? batch.profileId} />
          <Field label="Démarré le" value={formatDate(batch.startedAt)} />
          {batch.endedAt && <Field label="Terminé le" value={formatDate(batch.endedAt)} />}
          {batch.notes && <Field label="Notes initiales" value={batch.notes} />}
        </div>
      </section>

      {batch.cultureSnapshot && (
        <section>
          <h2>Culture au démarrage</h2>
          <CultureSection culture={batch.cultureSnapshot} />
        </section>
      )}

      <section>
        <h2>Phases</h2>
        <PhaseList batchId={batch.id} profileId={batch.profileId} phases={phases ?? []} />
      </section>

      <section>
        <h2>Suivi</h2>

        <QuickAddBar active={activeForm} onChange={setActiveForm} />

        {activeForm === "measurement" && (
          <MeasurementForm batchId={batch.id} onSaved={handleSaved} onCancel={handleCancel} />
        )}
        {activeForm === "observation" && (
          <ObservationForm batchId={batch.id} onSaved={handleSaved} onCancel={handleCancel} />
        )}
        {activeForm === "event" && (
          <ProcessEventForm batchId={batch.id} onSaved={handleSaved} onCancel={handleCancel} />
        )}

        <BatchTimeline
          measurements={measurements ?? []}
          observations={observations ?? []}
          events={events ?? []}
          batchStartedAt={batch.startedAt}
        />
      </section>

      <section>
        <h2>Évaluation finale</h2>
        <div className="placeholder-list">
          <div className="placeholder-section">
            <span className="placeholder-title">Évaluation</span>
            <span className="placeholder-badge">Bientôt</span>
          </div>
        </div>
      </section>
    </div>
  );
}
