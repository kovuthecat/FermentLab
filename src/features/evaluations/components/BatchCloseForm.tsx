import { useState } from "react";
import type { FinalEvaluation } from "../../../shared/types/common";
import type { BatchStatus } from "../../batches/types";
import { batchRepository } from "../../batches/services/batchRepository";
import { finalEvaluationRepository } from "../services/finalEvaluationRepository";
import { nowDatetimeLocal } from "../../../shared/utils/date";

interface Props {
  batchId: string;
  batchCurrentStatus: BatchStatus;
  existingEvaluation?: FinalEvaluation;
  onDone: () => void;
  onCancel: () => void;
}

type ScoreVal = "" | "1" | "2" | "3" | "4" | "5";

function parseScore(v: ScoreVal): 1 | 2 | 3 | 4 | 5 | undefined {
  return v === "" ? undefined : (parseInt(v) as 1 | 2 | 3 | 4 | 5);
}

function toScoreVal(v: number | undefined): ScoreVal {
  return v !== undefined ? (String(v) as ScoreVal) : "";
}

const SCORE_OPTIONS = ["1", "2", "3", "4", "5"] as const;

function ScoreSelect({
  id,
  value,
  onChange,
  required,
}: {
  id: string;
  value: ScoreVal;
  onChange: (v: ScoreVal) => void;
  required?: boolean;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as ScoreVal)}
      required={required}
    >
      <option value="">—</option>
      {SCORE_OPTIONS.map((n) => (
        <option key={n} value={n}>{n} / 5</option>
      ))}
    </select>
  );
}

export default function BatchCloseForm({
  batchId,
  batchCurrentStatus,
  existingEvaluation,
  onDone,
  onCancel,
}: Props) {
  const [endedAt, setEndedAt] = useState(() =>
    existingEvaluation
      ? new Date(existingEvaluation.completedAt).toISOString().slice(0, 16)
      : nowDatetimeLocal()
  );
  const [closeStatus, setCloseStatus] = useState<"completed" | "abandoned">(() =>
    batchCurrentStatus === "abandoned" ? "abandoned" : "completed"
  );
  const [overallScore, setOverallScore] = useState<ScoreVal>(toScoreVal(existingEvaluation?.overallScore));
  const [acidityScore, setAcidityScore] = useState<ScoreVal>(toScoreVal(existingEvaluation?.acidityScore));
  const [sweetnessScore, setSweetnessScore] = useState<ScoreVal>(toScoreVal(existingEvaluation?.sweetnessScore));
  const [carbonationScore, setCarbonationScore] = useState<ScoreVal>(toScoreVal(existingEvaluation?.carbonationScore));
  const [alcoholScore, setAlcoholScore] = useState<ScoreVal>(toScoreVal(existingEvaluation?.alcoholPerceptionScore));
  const [textureScore, setTextureScore] = useState<ScoreVal>(toScoreVal(existingEvaluation?.textureScore));
  const [success, setSuccess] = useState(existingEvaluation?.success ?? (closeStatus !== "abandoned"));
  const [wouldRepeat, setWouldRepeat] = useState(existingEvaluation?.wouldRepeat ?? false);
  const [problemSummary, setProblemSummary] = useState(existingEvaluation?.problemSummary ?? "");
  const [finalNotes, setFinalNotes] = useState(existingEvaluation?.finalNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (closeStatus === "completed" && !overallScore) {
      setError("Le score global est obligatoire pour un batch terminé.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const completedAt = new Date(endedAt).toISOString();
      await batchRepository.close(batchId, closeStatus, completedAt);
      await finalEvaluationRepository.save(
        {
          batchId,
          completedAt,
          overallScore: parseScore(overallScore),
          acidityScore: parseScore(acidityScore),
          sweetnessScore: parseScore(sweetnessScore),
          carbonationScore: parseScore(carbonationScore),
          alcoholPerceptionScore: parseScore(alcoholScore),
          textureScore: parseScore(textureScore),
          success,
          wouldRepeat,
          problemSummary: problemSummary.trim() || undefined,
          finalNotes: finalNotes.trim() || undefined,
        },
        existingEvaluation?.id
      );
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="quick-form" onSubmit={handleSubmit}>
      <div className="quick-form-row">
        <div className="form-group">
          <label htmlFor="close-endedat">Date / heure de fin</label>
          <input
            id="close-endedat"
            type="datetime-local"
            value={endedAt}
            onChange={(e) => setEndedAt(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="close-status">Statut final</label>
          <select
            id="close-status"
            value={closeStatus}
            onChange={(e) => setCloseStatus(e.target.value as "completed" | "abandoned")}
          >
            <option value="completed">Terminé</option>
            <option value="abandoned">Abandonné</option>
          </select>
        </div>
      </div>

      <div className="quick-form-row">
        <div className="form-group">
          <label htmlFor="close-overall">
            Score global {closeStatus === "completed" ? "(obligatoire)" : "(optionnel)"}
          </label>
          <ScoreSelect
            id="close-overall"
            value={overallScore}
            onChange={setOverallScore}
            required={closeStatus === "completed"}
          />
        </div>
        <div className="form-group">
          <label htmlFor="close-acidity">Acidité (optionnel)</label>
          <ScoreSelect id="close-acidity" value={acidityScore} onChange={setAcidityScore} />
        </div>
      </div>

      <div className="quick-form-row">
        <div className="form-group">
          <label htmlFor="close-sweetness">Sucrosité (optionnel)</label>
          <ScoreSelect id="close-sweetness" value={sweetnessScore} onChange={setSweetnessScore} />
        </div>
        <div className="form-group">
          <label htmlFor="close-carbonation">Pétillance (optionnel)</label>
          <ScoreSelect id="close-carbonation" value={carbonationScore} onChange={setCarbonationScore} />
        </div>
      </div>

      <div className="quick-form-row">
        <div className="form-group">
          <label htmlFor="close-alcohol">Perception alcool (optionnel)</label>
          <ScoreSelect id="close-alcohol" value={alcoholScore} onChange={setAlcoholScore} />
        </div>
        <div className="form-group">
          <label htmlFor="close-texture">Texture (optionnel)</label>
          <ScoreSelect id="close-texture" value={textureScore} onChange={setTextureScore} />
        </div>
      </div>

      <div className="quick-form-row">
        <div className="form-group form-group-inline">
          <label htmlFor="close-success">Succès</label>
          <input
            id="close-success"
            type="checkbox"
            checked={success}
            onChange={(e) => setSuccess(e.target.checked)}
          />
        </div>
        <div className="form-group form-group-inline">
          <label htmlFor="close-repeat">À refaire</label>
          <input
            id="close-repeat"
            type="checkbox"
            checked={wouldRepeat}
            onChange={(e) => setWouldRepeat(e.target.checked)}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="close-problem">Résumé problème (optionnel)</label>
        <textarea
          id="close-problem"
          rows={2}
          value={problemSummary}
          onChange={(e) => setProblemSummary(e.target.value)}
          placeholder="Problème rencontré…"
        />
      </div>

      <div className="form-group">
        <label htmlFor="close-notes">Notes finales (optionnel)</label>
        <textarea
          id="close-notes"
          rows={2}
          value={finalNotes}
          onChange={(e) => setFinalNotes(e.target.value)}
          placeholder="Observations finales…"
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="quick-form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Clôture en cours…" : "Clôturer"}
        </button>
      </div>
    </form>
  );
}
