import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../shared/lib/supabaseClient";
import { useRedirect } from "../hooks/useRedirect";
import "../styles/Signup.css";

export function Signup() {
  const navigate = useNavigate();
  const redirect = useRedirect("/dashboard");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      setLoading(false);
      setErrorMessage(error.message);
      return;
    }

    const user = data.user;
    if (!user) {
      setLoading(false);
      setErrorMessage("Kunde inte skapa användare.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      profiles_id: user.id,
      name,
      email,
    });

    setLoading(false);

    if (profileError) {
      setErrorMessage(profileError.message);
      return;
    }

    navigate(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
  };

  return (
    <div className="page">
      <div className="signup-card">
        <h1 className="signup-title">Skapa konto</h1>

        <form className="signup-form" onSubmit={handleSignup}>
          <div className="field">
            <label htmlFor="name">Namn</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="email">E-post</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Lösenord</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button
            className="btn btn-primary loginPrimaryBtn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Skapar..." : "Skapa konto"}
          </button>
        </form>

        <p className="signup-footer">
          Har du redan konto?{" "}
          <Link to={`/auth/login?redirect=${encodeURIComponent(redirect)}`}>
            Logga in
          </Link>
        </p>
      </div>
    </div>
  );
}