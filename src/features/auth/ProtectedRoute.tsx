import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <div className="auth-loading">Chargement…</div>;
  if (!session) return <Navigate to="/auth" replace />;

  return <>{children}</>;
}
