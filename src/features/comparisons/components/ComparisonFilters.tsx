import { FERMENTATION_PROFILES } from "../../profiles/data/profiles";

export type ComparisonFiltersState = {
  profileId: string;
  status: "all" | "completed" | "abandoned";
  success: "all" | "true" | "false";
  wouldRepeat: "all" | "true" | "false";
  minScore: number;
};

type Props = {
  filters: ComparisonFiltersState;
  onChange: (f: ComparisonFiltersState) => void;
};

export default function ComparisonFilters({ filters, onChange }: Props) {
  return (
    <div className="comparison-filters">
      <div className="comparison-filter-row">
        <div className="form-group">
          <label htmlFor="filter-profile">Type</label>
          <select
            id="filter-profile"
            value={filters.profileId}
            onChange={(e) => onChange({ ...filters, profileId: e.target.value })}
          >
            <option value="">Tous les types</option>
            {FERMENTATION_PROFILES.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="filter-status">Statut</label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(e) =>
              onChange({ ...filters, status: e.target.value as ComparisonFiltersState["status"] })
            }
          >
            <option value="all">Tous</option>
            <option value="completed">Terminé</option>
            <option value="abandoned">Abandonné</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="filter-success">Succès</label>
          <select
            id="filter-success"
            value={filters.success}
            onChange={(e) =>
              onChange({ ...filters, success: e.target.value as ComparisonFiltersState["success"] })
            }
          >
            <option value="all">Tous</option>
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="filter-repeat">À refaire</label>
          <select
            id="filter-repeat"
            value={filters.wouldRepeat}
            onChange={(e) =>
              onChange({ ...filters, wouldRepeat: e.target.value as ComparisonFiltersState["wouldRepeat"] })
            }
          >
            <option value="all">Tous</option>
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="filter-score">Score min</label>
          <select
            id="filter-score"
            value={filters.minScore}
            onChange={(e) => onChange({ ...filters, minScore: Number(e.target.value) })}
          >
            <option value={0}>Tous</option>
            <option value={2}>≥ 2</option>
            <option value={3}>≥ 3</option>
            <option value={4}>≥ 4</option>
            <option value={5}>5 seul.</option>
          </select>
        </div>
      </div>
    </div>
  );
}
