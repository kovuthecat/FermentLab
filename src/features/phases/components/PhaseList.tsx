import { useState } from "react";
import type { Phase, PhaseType } from "../types";
import { phaseRepository } from "../services/phaseRepository";
import { processEventRepository } from "../../events/services/processEventRepository";
import PhaseForm from "./PhaseForm";

interface Props {
  batchId: string;
  profileId: string;
  phases: Phase[];
}

const PHASE_LABELS: Record<PhaseType, string> = {
  primary: "F1 — Fermentation primaire",
  secondary: "F2 — Fermentation secondaire",
  refrigeration: "Mise au froid",
  feeding: "Nourrissage",
  rise: "Pousse",
  rest: "Repos",
  bulk_fermentation: "Fermentation en masse",
  proofing: "Apprêt",
  other: "Autre phase",
};

function formatDuration(startedAt: string, endedAt: string): string {
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  if (ms <= 0) return "—";
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 60) return `${totalMin} min`;
  const hours = Math.floor(totalMin / 60);
  if (hours < 48) return `${hours} h`;
  const days = Math.floor(hours / 24);
  const remH = hours % 24;
  return remH > 0 ? `${days} j ${remH} h` : `${days} j`;
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function nowISO(): string {
  return new Date().toISOString();
}

type QuickAction = {
  label: string;
  handler: (batchId: string) => Promise<void>;
};

function buildQuickActions(profileId: string): QuickAction[] {
  const isKombucha = profileId === "kombucha";
  const isWaterKefir = profileId === "water_kefir";
  const isMilkKefir = profileId === "milk_kefir";
  const isSourdough = profileId === "sourdough_starter";

  const now = () => nowISO();

  if (isKombucha || isWaterKefir) {
    return [
      {
        label: "Fin F1",
        handler: async (batchId) => {
          const ts = now();
          await processEventRepository.add({ batchId, timestamp: ts, eventType: "end_primary_fermentation", label: "Fin F1" });
          const active = await phaseRepository.findActiveByType(batchId, "primary");
          if (active) await phaseRepository.close(active.id, ts);
        },
      },
      {
        label: "Début F2",
        handler: async (batchId) => {
          const ts = now();
          await processEventRepository.add({ batchId, timestamp: ts, eventType: "start_secondary_fermentation", label: "Début F2" });
          const activePrimary = await phaseRepository.findActiveByType(batchId, "primary");
          if (activePrimary) await phaseRepository.close(activePrimary.id, ts);
          await phaseRepository.add({ batchId, type: "secondary", label: PHASE_LABELS.secondary, startedAt: ts });
        },
      },
      {
        label: "Fin F2",
        handler: async (batchId) => {
          const ts = now();
          await processEventRepository.add({ batchId, timestamp: ts, eventType: "end_secondary_fermentation", label: "Fin F2" });
          const active = await phaseRepository.findActiveByType(batchId, "secondary");
          if (active) await phaseRepository.close(active.id, ts);
        },
      },
      {
        label: "Mise au froid",
        handler: async (batchId) => {
          const ts = now();
          await processEventRepository.add({ batchId, timestamp: ts, eventType: "refrigeration", label: "Mise au froid" });
          const activeSecondary = await phaseRepository.findActiveByType(batchId, "secondary");
          if (activeSecondary) await phaseRepository.close(activeSecondary.id, ts);
          await phaseRepository.add({ batchId, type: "refrigeration", label: PHASE_LABELS.refrigeration, startedAt: ts });
        },
      },
    ];
  }

  if (isMilkKefir) {
    return [
      {
        label: "Fin F1",
        handler: async (batchId) => {
          const ts = now();
          await processEventRepository.add({ batchId, timestamp: ts, eventType: "end_primary_fermentation", label: "Fin F1" });
          const active = await phaseRepository.findActiveByType(batchId, "primary");
          if (active) await phaseRepository.close(active.id, ts);
        },
      },
      {
        label: "Mise au froid",
        handler: async (batchId) => {
          const ts = now();
          await processEventRepository.add({ batchId, timestamp: ts, eventType: "refrigeration", label: "Mise au froid" });
          const activePrimary = await phaseRepository.findActiveByType(batchId, "primary");
          if (activePrimary) await phaseRepository.close(activePrimary.id, ts);
          await phaseRepository.add({ batchId, type: "refrigeration", label: PHASE_LABELS.refrigeration, startedAt: ts });
        },
      },
    ];
  }

  if (isSourdough) {
    return [
      {
        label: "Nourrissage",
        handler: async (batchId) => {
          const ts = now();
          await processEventRepository.add({ batchId, timestamp: ts, eventType: "feeding", label: "Nourrissage" });
          await phaseRepository.add({ batchId, type: "feeding", label: PHASE_LABELS.feeding, startedAt: ts });
        },
      },
      {
        label: "Début pousse",
        handler: async (batchId) => {
          const ts = now();
          await phaseRepository.add({ batchId, type: "rise", label: PHASE_LABELS.rise, startedAt: ts });
        },
      },
      {
        label: "Pic d'activité",
        handler: async (batchId) => {
          const ts = now();
          await processEventRepository.add({ batchId, timestamp: ts, eventType: "other", label: "Pic d'activité" });
        },
      },
      {
        label: "Début repos",
        handler: async (batchId) => {
          const ts = now();
          const activeRise = await phaseRepository.findActiveByType(batchId, "rise");
          if (activeRise) await phaseRepository.close(activeRise.id, ts);
          await phaseRepository.add({ batchId, type: "rest", label: PHASE_LABELS.rest, startedAt: ts });
        },
      },
      {
        label: "Début apprêt",
        handler: async (batchId) => {
          const ts = now();
          const activeRest = await phaseRepository.findActiveByType(batchId, "rest");
          if (activeRest) await phaseRepository.close(activeRest.id, ts);
          await phaseRepository.add({ batchId, type: "proofing", label: PHASE_LABELS.proofing, startedAt: ts });
        },
      },
    ];
  }

  return [];
}

function PhaseItem({ phase, onClose }: { phase: Phase; onClose: (id: string) => void }) {
  const isActive = !phase.endedAt;
  const duration = phase.endedAt ? formatDuration(phase.startedAt, phase.endedAt) : null;

  return (
    <div className={`phase-item ${isActive ? "phase-item-active" : ""}`}>
      <div className="phase-item-header">
        <span className="phase-item-label">{phase.label}</span>
        <span className={`badge ${isActive ? "badge-active" : "badge-completed"}`}>
          {isActive ? "En cours" : "Terminée"}
        </span>
      </div>
      <div className="phase-item-meta">
        <span>Début : {formatDateShort(phase.startedAt)}</span>
        {phase.endedAt && <span>Fin : {formatDateShort(phase.endedAt)}</span>}
        {duration && <span>Durée : {duration}</span>}
      </div>
      {phase.notes && <p className="phase-item-notes">{phase.notes}</p>}
      {isActive && (
        <button
          type="button"
          className="btn btn-ghost phase-close-btn"
          onClick={() => onClose(phase.id)}
        >
          Clôturer
        </button>
      )}
    </div>
  );
}

export default function PhaseList({ batchId, profileId, phases }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const quickActions = buildQuickActions(profileId);

  async function handleQuickAction(action: QuickAction) {
    if (busy) return;
    setBusy(true);
    try {
      await action.handler(batchId);
    } finally {
      setBusy(false);
    }
  }

  async function handleClose(phaseId: string) {
    if (busy) return;
    setBusy(true);
    try {
      await phaseRepository.close(phaseId, nowISO());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="phase-list-container">
      {quickActions.length > 0 && (
        <div className="quick-add-bar">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="btn btn-ghost"
              disabled={busy}
              onClick={() => handleQuickAction(action)}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {phases.length === 0 && !showForm && (
        <p className="timeline-empty">Aucune phase enregistrée.</p>
      )}

      {phases.length > 0 && (
        <div className="phase-list">
          {phases.map((p) => (
            <PhaseItem key={p.id} phase={p} onClose={handleClose} />
          ))}
        </div>
      )}

      {showForm ? (
        <PhaseForm
          batchId={batchId}
          onSaved={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button
          type="button"
          className="btn btn-ghost phase-add-btn"
          onClick={() => setShowForm(true)}
        >
          + Phase manuelle
        </button>
      )}
    </div>
  );
}
