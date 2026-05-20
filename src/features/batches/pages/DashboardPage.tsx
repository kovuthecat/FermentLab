import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { batchRepository } from "../services/batchRepository";
import { useDataVersion } from "../../../lib/refresh";
import { getProfile } from "../../profiles/data/profiles";
import type { Batch, BatchStatus } from "../types";

const STATUS_LABELS: Record<BatchStatus, string> = {
  active: "En cours",
  completed: "Terminé",
  abandoned: "Abandonné",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function BatchCard({ batch }: { batch: Batch }) {
  const profile = getProfile(batch.profileId);
  const refrigerated = batch.cultureSnapshot?.refrigerated;
  const refrigerationHours = batch.cultureSnapshot?.refrigerationDurationHours;

  return (
    <Link to={`/batches/${batch.id}`} className="batch-card-link">
      <div className="batch-card">
        <div className="batch-card-top">
          <span className="batch-card-name">{batch.name}</span>
          <span className={`badge badge-${batch.status}`}>{STATUS_LABELS[batch.status]}</span>
        </div>
        <div className="batch-card-meta">
          <span>{profile?.name ?? batch.profileId}</span>
          <span>Démarré le {formatDate(batch.startedAt)}</span>
          {refrigerated && (
            <span className="badge-culture-cold">
              {refrigerationHours ? `❄ ${refrigerationHours}h au frigo` : "❄ Réfrigérée"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const v = useDataVersion();
  const [batches, setBatches] = useState<Batch[] | undefined>(undefined);

  useEffect(() => {
    console.log("[Supabase] loading batches");
    batchRepository.list().then(setBatches).catch(console.error);
  }, [v]);

  const activeBatches = batches?.filter((b) => b.status === "active") ?? [];
  const closedBatches = batches?.filter((b) => b.status !== "active") ?? [];

  return (
    <div className="page dashboard">
      <div className="page-header">
        <h1>Fermentations</h1>
        <Link to="/batches/new" className="btn btn-primary">
          + Nouveau
        </Link>
      </div>

      <section>
        <h2>En cours</h2>
        {batches === undefined && <p className="loading">Chargement…</p>}
        {batches !== undefined && activeBatches.length === 0 && (
          <p className="empty">
            Aucune fermentation active.{" "}
            <Link to="/batches/new">Commencer un batch</Link>.
          </p>
        )}
        <div className="batch-list">
          {activeBatches.map((batch) => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
        </div>
      </section>

      {closedBatches.length > 0 && (
        <section>
          <h2>Terminés / Abandonnés</h2>
          <div className="batch-list">
            {closedBatches.map((batch) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
