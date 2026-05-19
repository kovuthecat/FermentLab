import { Link } from "react-router-dom";
import type { BatchComparisonRow } from "../services/comparisonService";
import { getProfile } from "../../profiles/data/profiles";

const STATUS_LABELS: Record<"completed" | "abandoned", string> = {
  completed: "Terminé",
  abandoned: "Abandonné",
};

function fmtDate(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function fmtH(h: number | undefined): string {
  if (h === undefined) return "—";
  const totalH = Math.round(h);
  const d = Math.floor(totalH / 24);
  const rem = totalH % 24;
  if (d === 0) return `${totalH}h`;
  return rem > 0 ? `${d}j ${rem}h` : `${d}j`;
}

function fmtNum(n: number | undefined, decimals = 1): string {
  if (n === undefined) return "—";
  return n.toFixed(decimals);
}

function fmtDeltaPh(n: number | undefined): string {
  if (n === undefined) return "—";
  return (n > 0 ? "+" : "") + n.toFixed(2);
}

function scoreClass(score: number): string {
  if (score <= 2) return "score-low";
  if (score === 3) return "score-mid";
  if (score === 4) return "score-high";
  return "score-top";
}

type Props = {
  rows: BatchComparisonRow[];
};

export default function BatchComparisonTable({ rows }: Props) {
  if (rows.length === 0) {
    return <p className="empty">Aucun batch ne correspond aux filtres.</p>;
  }

  return (
    <>
      {/* Table — desktop */}
      <div className="comparison-table-wrap">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Type</th>
              <th>Statut</th>
              <th>Fin</th>
              <th>Durée</th>
              <th>F1</th>
              <th>F2</th>
              <th>Réfrig.</th>
              <th>Temp. moy.</th>
              <th>pH init.</th>
              <th>pH final</th>
              <th>ΔpH</th>
              <th>OG</th>
              <th>FG</th>
              <th>ABV</th>
              <th>Frigo cult.</th>
              <th>Score</th>
              <th>Succès</th>
              <th>À refaire</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.batchId}>
                <td className="name-cell">
                  <Link to={`/batches/${r.batchId}`}>{r.name}</Link>
                </td>
                <td>{getProfile(r.profileId)?.name ?? r.profileId}</td>
                <td>
                  <span className={`badge badge-${r.status}`}>{STATUS_LABELS[r.status]}</span>
                </td>
                <td>{fmtDate(r.endedAt)}</td>
                <td className="num-cell">{fmtH(r.totalDurationHours)}</td>
                <td className="num-cell">{fmtH(r.primaryDurationHours)}</td>
                <td className="num-cell">{fmtH(r.secondaryDurationHours)}</td>
                <td className="num-cell">{fmtH(r.refrigerationDurationHours)}</td>
                <td className="num-cell">
                  {r.averageTemperatureC !== undefined
                    ? `${fmtNum(r.averageTemperatureC)} °C`
                    : "—"}
                </td>
                <td className="num-cell">{fmtNum(r.initialPh, 2)}</td>
                <td className="num-cell">{fmtNum(r.finalPh, 2)}</td>
                <td className="num-cell">{fmtDeltaPh(r.deltaPh)}</td>
                <td className="num-cell">{fmtNum(r.originalGravity, 3)}</td>
                <td className="num-cell">{fmtNum(r.finalGravity, 3)}</td>
                <td className="num-cell">
                  {r.estimatedAbv !== undefined ? `${fmtNum(r.estimatedAbv)} %` : "—"}
                </td>
                <td className="num-cell">
                  {r.cultureRefrigerationHours !== undefined
                    ? `${r.cultureRefrigerationHours}h`
                    : "—"}
                </td>
                <td className="score-cell">
                  {r.overallScore !== undefined ? (
                    <span className={`comparison-score-badge ${scoreClass(r.overallScore)}`}>
                      {r.overallScore}
                    </span>
                  ) : (
                    <span className="dash">—</span>
                  )}
                </td>
                <td>
                  {r.success !== undefined ? (
                    r.success ? "✓" : "✗"
                  ) : (
                    <span className="dash">—</span>
                  )}
                </td>
                <td>
                  {r.wouldRepeat !== undefined ? (
                    r.wouldRepeat ? "✓" : "✗"
                  ) : (
                    <span className="dash">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="comparison-cards">
        {rows.map((r) => (
          <BatchCard key={r.batchId} row={r} />
        ))}
      </div>
    </>
  );
}

function BatchCard({ row }: { row: BatchComparisonRow }) {
  const profile = getProfile(row.profileId);
  const metrics: { label: string; value: string }[] = [];

  if (row.totalDurationHours !== undefined)
    metrics.push({ label: "Durée", value: fmtH(row.totalDurationHours) });
  if (row.primaryDurationHours !== undefined)
    metrics.push({ label: "F1", value: fmtH(row.primaryDurationHours) });
  if (row.secondaryDurationHours !== undefined)
    metrics.push({ label: "F2", value: fmtH(row.secondaryDurationHours) });
  if (row.averageTemperatureC !== undefined)
    metrics.push({ label: "Temp.", value: `${fmtNum(row.averageTemperatureC)} °C` });
  if (row.initialPh !== undefined)
    metrics.push({ label: "pH initial", value: fmtNum(row.initialPh, 2) });
  if (row.finalPh !== undefined)
    metrics.push({ label: "pH final", value: fmtNum(row.finalPh, 2) });
  if (row.estimatedAbv !== undefined)
    metrics.push({ label: "ABV", value: `${fmtNum(row.estimatedAbv)} %` });
  if (row.endedAt)
    metrics.push({ label: "Fin", value: fmtDate(row.endedAt) });

  return (
    <div className="comparison-card">
      <div className="comparison-card-header">
        <Link to={`/batches/${row.batchId}`} className="comparison-card-name">
          {row.name}
        </Link>
        {row.overallScore !== undefined && (
          <span className={`comparison-score-badge ${scoreClass(row.overallScore)}`}>
            {row.overallScore}
          </span>
        )}
      </div>
      <div className="comparison-card-badges">
        <span className={`badge badge-${row.status}`}>{STATUS_LABELS[row.status]}</span>
        <span className="badge badge-profile">{profile?.name ?? row.profileId}</span>
        {row.success !== undefined && (
          <span className={`badge ${row.success ? "badge-success" : "badge-failure"}`}>
            {row.success ? "Succès" : "Échec"}
          </span>
        )}
        {row.wouldRepeat && (
          <span className="badge badge-repeat">À refaire</span>
        )}
      </div>
      {metrics.length > 0 && (
        <div className="comparison-card-metrics">
          {metrics.map((m) => (
            <div key={m.label} className="comparison-metric">
              <span className="comparison-metric-label">{m.label}</span>
              <span className="comparison-metric-value">{m.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
