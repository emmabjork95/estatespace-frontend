
import { type FormEvent } from "react";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {  useNavigate, Link } from "react-router-dom";
import "../styles/Login.css";
import { useRedirect } from "../hooks/useRedirect";


const Login = () => {
  const navigate = useNavigate();

const redirect = useRedirect("/dashboard");


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

    if (data.session) {
      navigate(redirect);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Log in</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="login-row">
            <Link className="login-link" to="/auth/forgot-password">
              Forgot your password?
            </Link>
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Loggar in..." : "Log in"}
          </button>
        </form>

        <p className="login-footer">
          Don’t have an account?{" "}
          <Link to={`/auth/signup?redirect=${encodeURIComponent(redirect)}`}>
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;