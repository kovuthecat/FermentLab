import type { Batch } from "../types";
import type { Phase } from "../../phases/types";
import type { Measurement } from "../../measurements/types";
import {
  getBatchDurationHours,
  getPhaseDurationByType,
  getTemperatureStats,
  getPhStats,
  estimateAbvFromDensity,
  getSurfaceDepthRatio,
  getCultureRefrigerationHours,
} from "../../../lib/calculations";

function fmt1(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-field">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}

type Props = {
  batch: Batch;
  phases: Phase[];
  measurements: Measurement[];
};

export default function BatchMetricsSummary({ batch, phases, measurements }: Props) {
  const rows: { label: string; value: string }[] = [];

  const totalH = getBatchDurationHours(batch);
  if (totalH !== null) rows.push({ label: "Durée totale", value: `${fmt1(totalH)} h` });

  const f1H = getPhaseDurationByType(phases, "primary");
  if (f1H !== null) rows.push({ label: "F1", value: `${fmt1(f1H)} h` });

  const f2H = getPhaseDurationByType(phases, "secondary");
  if (f2H !== null) rows.push({ label: "F2", value: `${fmt1(f2H)} h` });

  const coldH = getPhaseDurationByType(phases, "refrigeration");
  if (coldH !== null) rows.push({ label: "Réfrigération", value: `${fmt1(coldH)} h` });

  const tempStats = getTemperatureStats(measurements);
  if (tempStats.averageC !== undefined) {
    rows.push({ label: "Température moyenne", value: `${fmt1(tempStats.averageC)} °C` });
  }

  const phStats = getPhStats(measurements);
  if (phStats.count >= 2 && phStats.initialPh !== undefined && phStats.finalPh !== undefined) {
    rows.push({ label: "pH initial → final", value: `${phStats.initialPh} → ${phStats.finalPh}` });
  } else if (phStats.count === 1 && phStats.initialPh !== undefined) {
    rows.push({ label: "pH", value: String(phStats.initialPh) });
  }

  const abv = estimateAbvFromDensity(measurements);
  if (abv !== null) rows.push({ label: "ABV estimé", value: `${fmt1(abv)} %` });

  const ratio = getSurfaceDepthRatio(batch);
  if (ratio !== null) rows.push({ label: "Ratio surface/profondeur", value: fmt1(ratio) });

  const cultRefrigH = getCultureRefrigerationHours(batch);
  if (cultRefrigH !== null) rows.push({ label: "Culture réfrigérée", value: `${fmt1(cultRefrigH)} h` });

  if (rows.length === 0) return null;

  return (
    <div className="detail-block">
      {rows.map((r) => (
        <MetricRow key={r.label} label={r.label} value={r.value} />
      ))}
    </div>
  );
}
