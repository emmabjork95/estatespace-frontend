import { type FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../../shared/lib/supabaseClient";
import { useRedirect } from "../hooks/useRedirect";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const redirect = useRedirect("/dashboard");

  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "";
  const isInviteRedirect = redirectParam.startsWith("/auth/invite/");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (data.session) navigate(redirect);
  };

  return (
    <div className="loginPage">
      <div className="login-card">
        <h1 className="login-title">Logga in</h1>

        {isInviteRedirect && (
          <div className="Alert Alert--info">
            Du behöver logga in för att acceptera inbjudan.
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">E-post</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Lösenord</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <div className="login-row">
            <Link className="login-link" to="/auth/forgot-password">
              Glömt ditt lösenord?
            </Link>
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button
            className="btn btn-primary loginPrimaryBtn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Loggar in..." : "Logga in"}
          </button>
        </form>

        <p className="login-footer">
          Inget konto?{" "}
          <Link to={`/auth/signup?redirect=${encodeURIComponent(redirect)}`}>
            Skapa ett!
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;