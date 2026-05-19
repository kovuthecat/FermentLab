import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "../../../db/database";
import { getProfile } from "../../profiles/data/profiles";
import type { BatchStatus, CultureSnapshot } from "../types";
import { CULTURE_TYPE_LABELS } from "../constants";
import { useMeasurements } from "../../measurements/hooks/useMeasurements";
import { useObservations } from "../../observations/hooks/useObservations";
import { useProcessEvents } from "../../events/hooks/useProcessEvents";
import MeasurementForm from "../../measurements/components/MeasurementForm";
import ObservationForm from "../../observations/components/ObservationForm";
import ProcessEventForm from "../../events/components/ProcessEventForm";
import BatchTimeline from "../../timeline/components/BatchTimeline";
import { usePhases } from "../../phases/hooks/usePhases";
import PhaseList from "../../phases/components/PhaseList";
import BatchMetricsSummary from "../components/BatchMetricsSummary";
import { batchRepository } from "../services/batchRepository";
import { useFinalEvaluation } from "../../evaluations/hooks/useFinalEvaluation";
import BatchCloseForm from "../../evaluations/components/BatchCloseForm";
import FinalEvaluationDisplay from "../../evaluations/components/FinalEvaluationDisplay";
import { exportService, downloadJson, makeBatchFilename } from "../../export/services/exportService";
import { useIngredients } from "../../ingredients/hooks/useIngredients";
import IngredientList from "../../ingredients/components/IngredientList";
import IngredientForm from "../../ingredients/components/IngredientForm";

type ActiveForm = "measurement" | "observation" | "event" | null;

const STATUS_LABELS: Record<BatchStatus, string> = {
  active: "En cours",
  completed: "Terminé",
  abandoned: "Abandonné",
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
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const [deleting, setDeleting] = useState(false);
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showIngredientForm, setShowIngredientForm] = useState(false);

  const batch = useLiveQuery(
    () => (batchId ? db.batches.get(batchId) : undefined),
    [batchId]
  );

  const finalEvaluation = useFinalEvaluation(batchId ?? "");
  const measurements = useMeasurements(batchId ?? "");
  const observations = useObservations(batchId ?? "");
  const events = useProcessEvents(batchId ?? "");
  const phases = usePhases(batchId ?? "");
  const ingredients = useIngredients(batchId ?? "");

  const activePhase = (phases ?? [])
    .filter((p) => !p.endedAt)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];

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

  async function handleExport() {
    if (!batch) return;
    setExporting(true);
    try {
      const data = await exportService.exportBatch(batch.id);
      downloadJson(makeBatchFilename(batch.name), data);
    } catch (err) {
      console.error("Export failed", err);
      alert("L'export a échoué. Veuillez réessayer.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (!batch) return;
    if (!window.confirm(`Supprimer « ${batch.name} » et toutes ses données ? Cette action est irréversible.`)) return;
    setDeleting(true);
    try {
      await batchRepository.remove(batch.id);
      navigate("/");
    } finally {
      setDeleting(false);
    }
  }

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
        <h2>Ingrédients initiaux</h2>
        {showIngredientForm ? (
          <IngredientForm
            batchId={batch.id}
            onSaved={() => setShowIngredientForm(false)}
            onCancel={() => setShowIngredientForm(false)}
          />
        ) : (
          <button
            type="button"
            className="btn btn-ghost ingredient-add-btn"
            onClick={() => setShowIngredientForm(true)}
          >
            + Ajouter un ingrédient
          </button>
        )}
        <IngredientList ingredients={ingredients ?? []} />
      </section>

      <section>
        <h2>Phases</h2>
        <PhaseList batchId={batch.id} profileId={batch.profileId} phases={phases ?? []} />
      </section>

      <section>
        <h2>Résumé calculé</h2>
        <BatchMetricsSummary
          batch={batch}
          phases={phases ?? []}
          measurements={measurements ?? []}
        />
      </section>

      <section>
        <h2>Suivi</h2>

        <QuickAddBar active={activeForm} onChange={setActiveForm} />

        {activeForm === "measurement" && (
          <MeasurementForm
            batchId={batch.id}
            activePhaseId={activePhase?.id}
            activePhaseName={activePhase?.label}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        )}
        {activeForm === "observation" && (
          <ObservationForm
            batchId={batch.id}
            activePhaseId={activePhase?.id}
            activePhaseName={activePhase?.label}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        )}
        {activeForm === "event" && (
          <ProcessEventForm
            batchId={batch.id}
            activePhaseId={activePhase?.id}
            activePhaseName={activePhase?.label}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        )}

        <BatchTimeline
          measurements={measurements ?? []}
          observations={observations ?? []}
          events={events ?? []}
          batchStartedAt={batch.startedAt}
          phases={phases ?? []}
        />
      </section>

      <section>
        <h2>Évaluation finale</h2>
        {batch.status === "active" ? (
          showCloseForm ? (
            <BatchCloseForm
              batchId={batch.id}
              batchCurrentStatus={batch.status}
              onDone={() => setShowCloseForm(false)}
              onCancel={() => setShowCloseForm(false)}
            />
          ) : (
            <div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowCloseForm(true)}
              >
                Clôturer le batch
              </button>
            </div>
          )
        ) : showCloseForm ? (
          <BatchCloseForm
            batchId={batch.id}
            batchCurrentStatus={batch.status}
            existingEvaluation={finalEvaluation}
            onDone={() => setShowCloseForm(false)}
            onCancel={() => setShowCloseForm(false)}
          />
        ) : finalEvaluation ? (
          <FinalEvaluationDisplay
            evaluation={finalEvaluation}
            onEdit={() => setShowCloseForm(true)}
          />
        ) : (
          <p className="empty">Aucune évaluation enregistrée.</p>
        )}
      </section>

      <section>
        <h2>Export</h2>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={exporting}
          onClick={handleExport}
        >
          {exporting ? "Export en cours…" : "Exporter ce batch (JSON)"}
        </button>
      </section>

      <section className="danger-zone">
        <h2>Zone dangereuse</h2>
        <button
          type="button"
          className="btn btn-danger"
          disabled={deleting}
          onClick={handleDelete}
        >
          {deleting ? "Suppression…" : "Supprimer ce batch"}
        </button>
      </section>
    </div>
  );
}
