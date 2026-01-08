import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../shared/lib/supabaseClient";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const clearAlerts = () => {
    setErrorMessage(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearAlerts();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="page">
      <div className="forgot-card">
        <h1 className="forgot-title">Glömt lösenord</h1>

        <p className="forgot-sub">
          Ange din e-postadress så skickar vi en länk för att återställa lösenordet.
        </p>

        <form className="forgot-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">E-post</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="namn@email.com"
              disabled={loading}
              onFocus={clearAlerts}
            />
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {success && (
            <div className="forgot-success">
              Om adressen finns i systemet har vi skickat ett återställningsmail.
            </div>
          )}

          <button
            className="btn btn-primary loginPrimaryBtn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Skickar..." : "Skicka"}
          </button>
        </form>

        <p className="forgot-footer">
          <Link to="/auth/login">Tillbaka till inloggning</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;