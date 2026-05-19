import type { FinalEvaluation } from "../../../shared/types/common";

interface Props {
  evaluation: FinalEvaluation;
  onEdit: () => void;
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

function score(v: number | undefined): string | undefined {
  return v !== undefined ? `${v} / 5` : undefined;
}

export default function FinalEvaluationDisplay({ evaluation, onEdit }: Props) {
  return (
    <div>
      <div className="detail-block">
        <Field label="Score global" value={score(evaluation.overallScore)} />
        <Field label="Acidité" value={score(evaluation.acidityScore)} />
        <Field label="Sucrosité" value={score(evaluation.sweetnessScore)} />
        <Field label="Pétillance" value={score(evaluation.carbonationScore)} />
        <Field label="Perception alcool" value={score(evaluation.alcoholPerceptionScore)} />
        <Field label="Texture" value={score(evaluation.textureScore)} />
        <Field label="Succès" value={evaluation.success ? "Oui" : "Non"} />
        <Field label="À refaire" value={evaluation.wouldRepeat ? "Oui" : "Non"} />
        <Field label="Problème" value={evaluation.problemSummary} />
        <Field label="Notes" value={evaluation.finalNotes} />
      </div>
      <div style={{ marginTop: 10 }}>
        <button type="button" className="btn btn-ghost" onClick={onEdit}>
          Modifier l'évaluation
        </button>
      </div>
    </div>
  );
}
