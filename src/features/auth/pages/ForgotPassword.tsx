import { type FormEvent, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Link } from "react-router-dom";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccess(false);
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
    <div className="forgot-page">
      <div className="forgot-card">
        <h1 className="forgot-title">Glömt lösenord</h1>

        <p className="forgot-sub">
          Ange din e-postadress så skickar vi en länk för att återställa lösenordet.
        </p>

        <form onSubmit={handleSubmit} className="forgot-form">
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
            />
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {success && (
            <div className="forgot-success">
              Om adressen finns i systemet har vi skickat ett mejl 📬
            </div>
          )}

          <button className="btn btn-primary loginPrimaryBtn" type="submit" disabled={loading}>
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
