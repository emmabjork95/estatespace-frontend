import { type FormEvent, useEffect, useState } from "react";
import { supabase } from "../../../shared/lib/supabaseClient";
import { Link } from "react-router";
import "../styles/ResetPassword.css";

const ResetPassword = () => {
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const clearAlerts = () => {
    setErrorMessage(null);
    setSuccess(false);
  };

  useEffect(() => {
    const check = async () => {
      setChecking(true);
      setErrorMessage(null);

      const { data } = await supabase.auth.getSession();
      const session = data.session;

      setHasSession(!!session);
      setChecking(false);
    };

    check();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearAlerts();

    const p1 = password.trim();
    const p2 = password2.trim();

    if (p1.length < 6) {
      setErrorMessage("Lösenordet måste vara minst 6 tecken.");
      return;
    }

    if (p1 !== p2) {
      setErrorMessage("Lösenorden matchar inte.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: p1 });
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccess(true);
    setPassword("");
    setPassword2("");
  };

  if (checking) {
    return (
      <div className="page">
        <div className="reset-card">
          <h1 className="reset-title">Återställ lösenord</h1>
          <p className="reset-sub">Laddar…</p>
          <div className="reset-skeleton" />
          <div className="reset-skeleton" />
          <div className="reset-skeleton reset-skeleton--wide" />
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="page">
        <div className="reset-card">
          <h1 className="reset-title">Återställ lösenord</h1>
          <p className="reset-sub">
            Länken verkar vara ogiltig eller har redan använts. Be om en ny
            återställningslänk.
          </p>

          <div className="reset-actions">
            <Link className="reset-link" to="/auth/forgot-password">
              Be om ny länk
            </Link>
            <Link className="reset-link" to="/auth/login">
              Tillbaka till inloggning
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="reset-card">
        <h1 className="reset-title">Återställ lösenord</h1>
        <p className="reset-sub">Välj ett nytt lösenord för ditt konto.</p>

        {(errorMessage || success) && (
          <div
            className={`Alert ${
              errorMessage ? "Alert--error" : "Alert--success"
            }`}
          >
            <span>{errorMessage ?? "Lösenordet uppdaterades "}</span>
            <button
              type="button"
              className="AlertClose"
              onClick={clearAlerts}
              aria-label="Stäng meddelande"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="field">
            <label htmlFor="password">Nytt lösenord</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={clearAlerts}
              required
              autoComplete="new-password"
              placeholder="Minst 6 tecken"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="password2">Upprepa lösenord</label>
            <input
              id="password2"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              onFocus={clearAlerts}
              required
              autoComplete="new-password"
              placeholder="Samma lösenord igen"
              disabled={loading}
            />
          </div>

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Sparar..." : "Spara nytt lösenord"}
          </button>
        </form>

        <p className="reset-footer">
          <Link to="/auth/login">← Tillbaka till inloggning</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;