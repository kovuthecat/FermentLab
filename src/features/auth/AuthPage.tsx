import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

type Step = "email" | "otp";

export default function AuthPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setStep("otp");
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      navigate("/", { replace: true });
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">FermentLab</h1>

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="auth-form">
            <p className="auth-subtitle">Entrez votre adresse email pour recevoir un code de connexion.</p>
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
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Envoi…" : "Envoyer le code"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <p className="auth-subtitle">
              Code envoyé à <strong>{email}</strong>. Entrez-le ci-dessous.
            </p>
            <label className="auth-label" htmlFor="auth-otp">
              Code à 8 caractères
            </label>
            <input
              id="auth-otp"
              type="text"
              className="auth-input auth-input--otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="12345678"
              maxLength={8}
              inputMode="numeric"
              required
              autoFocus
            />
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Vérification…" : "Se connecter"}
            </button>
            <button
              type="button"
              className="auth-btn auth-btn--secondary"
              onClick={() => {
                setStep("email");
                setOtp("");
                setError(null);
              }}
            >
              Changer d'email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
