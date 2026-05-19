import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../../../db/database";
import type { Batch } from "../types";

function BatchCard({ batch }: { batch: Batch }) {
  const durationMs = Date.now() - new Date(batch.startedAt).getTime();
  const durationHours = Math.floor(durationMs / 3_600_000);

  return (
    <div className="batch-card">
      <div className="batch-card-name">{batch.name}</div>
      <div className="batch-card-meta">
        <span className="batch-card-profile">{batch.profileId.replace("_", " ")}</span>
        <span className="batch-card-duration">{durationHours}h en cours</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const activeBatches = useLiveQuery(
    () => db.batches.where("status").equals("active").reverse().sortBy("startedAt"),
    []
  );

  const recentBatches = useLiveQuery(
    () => db.batches.where("status").equals("completed").reverse().sortBy("endedAt"),
    []
  );

  return (
    <div className="page dashboard">
      <div className="page-header">
        <h1>Fermentations</h1>
        <Link to="/batches/new" className="btn btn-primary">
          + Nouveau batch
        </Link>
      </div>

      <section>
        <h2>En cours</h2>
        {activeBatches === undefined && <p className="loading">Chargement…</p>}
        {activeBatches?.length === 0 && (
          <p className="empty">Aucune fermentation active. <Link to="/batches/new">Commencer un batch</Link>.</p>
        )}
        <div className="batch-list">
          {activeBatches?.map((batch) => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
        </div>
      </section>

      {recentBatches && recentBatches.length > 0 && (
        <section>
          <h2>Terminés récemment</h2>
          <div className="batch-list">
            {recentBatches.slice(0, 5).map((batch) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
