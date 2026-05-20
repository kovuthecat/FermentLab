import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (err) {
        setError(err.message);
      } else {
        navigate("/", { replace: true });
      }
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (err) {
        setError(err.message);
      } else {
        setInfo("Compte créé. Vérifiez votre email pour confirmer, puis connectez-vous.");
        setMode("signin");
        setPassword("");
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">FermentLab</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label" htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.fr"
            required
            autoFocus
          />
          <label className="auth-label" htmlFor="auth-password">
            Mot de passe
          </label>
          <input
            id="auth-password"
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
          />
          {error && <p className="auth-error">{error}</p>}
          {info && <p className="auth-info">{info}</p>}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading
              ? "…"
              : mode === "signin"
                ? "Se connecter"
                : "Créer un compte"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "signin" ? (
            <>
              Pas encore de compte ?{" "}
              <button className="auth-switch-btn" onClick={() => { setMode("signup"); setError(null); setInfo(null); }}>
                S'inscrire
              </button>
            </>
          ) : (
            <>
              Déjà un compte ?{" "}
              <button className="auth-switch-btn" onClick={() => { setMode("signin"); setError(null); setInfo(null); }}>
                Se connecter
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
