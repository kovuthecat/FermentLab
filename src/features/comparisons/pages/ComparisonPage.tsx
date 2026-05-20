import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDataVersion } from "../../../lib/refresh";
import { comparisonService } from "../services/comparisonService";
import type { BatchComparisonRow } from "../services/comparisonService";
import ComparisonFilters from "../components/ComparisonFilters";
import type { ComparisonFiltersState } from "../components/ComparisonFilters";
import BatchComparisonTable from "../components/BatchComparisonTable";
import { exportService, downloadJson, makeAllBatchesFilename } from "../../export/services/exportService";

const DEFAULT_FILTERS: ComparisonFiltersState = {
  profileId: "",
  status: "all",
  success: "all",
  wouldRepeat: "all",
  minScore: 0,
};

type SortKey = "endedAt" | "overallScore" | "totalDurationHours" | "averageTemperatureC";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "overallScore", label: "Score" },
  { key: "endedAt", label: "Date fin" },
  { key: "totalDurationHours", label: "Durée" },
  { key: "averageTemperatureC", label: "Temp." },
];

function applyFilters(
  rows: BatchComparisonRow[],
  filters: ComparisonFiltersState
): BatchComparisonRow[] {
  return rows.filter((r) => {
    if (filters.profileId && r.profileId !== filters.profileId) return false;
    if (filters.status !== "all" && r.status !== filters.status) return false;
    if (filters.success !== "all") {
      if (r.success === undefined) return false;
      if (filters.success === "true" && !r.success) return false;
      if (filters.success === "false" && r.success) return false;
    }
    if (filters.wouldRepeat !== "all") {
      if (r.wouldRepeat === undefined) return false;
      if (filters.wouldRepeat === "true" && !r.wouldRepeat) return false;
      if (filters.wouldRepeat === "false" && r.wouldRepeat) return false;
    }
    if (filters.minScore > 0) {
      if (r.overallScore === undefined || r.overallScore < filters.minScore) return false;
    }
    return true;
  });
}

function applySort(
  rows: BatchComparisonRow[],
  sortKey: SortKey,
  sortDir: SortDir
): BatchComparisonRow[] {
  return [...rows].sort((a, b) => {
    let va: number | undefined;
    let vb: number | undefined;

    if (sortKey === "endedAt") {
      va = a.endedAt ? new Date(a.endedAt).getTime() : undefined;
      vb = b.endedAt ? new Date(b.endedAt).getTime() : undefined;
    } else if (sortKey === "overallScore") {
      va = a.overallScore;
      vb = b.overallScore;
    } else if (sortKey === "totalDurationHours") {
      va = a.totalDurationHours;
      vb = b.totalDurationHours;
    } else {
      va = a.averageTemperatureC;
      vb = b.averageTemperatureC;
    }

    if (va === undefined && vb === undefined) return 0;
    if (va === undefined) return 1;
    if (vb === undefined) return -1;
    return sortDir === "asc" ? va - vb : vb - va;
  });
}

export default function ComparisonPage() {
  const [filters, setFilters] = useState<ComparisonFiltersState>(DEFAULT_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>("overallScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [exporting, setExporting] = useState(false);
  const [allRows, setAllRows] = useState<BatchComparisonRow[] | undefined>(undefined);
  const v = useDataVersion();

  useEffect(() => {
    comparisonService.getComparisonRows().then(setAllRows).catch(console.error);
  }, [v]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  async function handleExportAll() {
    setExporting(true);
    try {
      const data = await exportService.exportAllBatches();
      downloadJson(makeAllBatchesFilename(), data);
    } catch (err) {
      console.error("Export failed", err);
      alert("L'export a échoué. Veuillez réessayer.");
    } finally {
      setExporting(false);
    }
  }

  const filtered = allRows ? applyFilters(allRows, filters) : [];
  const sorted = applySort(filtered, sortKey, sortDir);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Comparaison</h1>
        <div className="page-header-actions">
          {allRows && allRows.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleExportAll}
              disabled={exporting}
            >
              {exporting ? "Export…" : "⬇ Exporter tout"}
            </button>
          )}
          <Link to="/" className="back-link">← Accueil</Link>
        </div>
      </div>

      {allRows === undefined && <p className="loading">Chargement…</p>}

      {allRows !== undefined && allRows.length === 0 && (
        <p className="empty">
          Aucun batch terminé ou abandonné.{" "}
          <Link to="/batches/new">Créer un batch</Link>.
        </p>
      )}

      {allRows !== undefined && allRows.length > 0 && (
        <section>
          <ComparisonFilters filters={filters} onChange={setFilters} />

          <div className="comparison-sort-bar">
            <span className="comparison-sort-label">Trier par :</span>
            {SORT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`comparison-sort-btn${sortKey === key ? " active" : ""}`}
                onClick={() => handleSort(key)}
              >
                {label}
                {sortKey === key ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
              </button>
            ))}
          </div>

          <p className="comparison-count">
            {sorted.length} batch{sorted.length > 1 ? "s" : ""}
            {sorted.length < allRows.length ? ` sur ${allRows.length}` : ""}
          </p>

          <BatchComparisonTable rows={sorted} />
        </section>
      )}
    </div>
  );
}
