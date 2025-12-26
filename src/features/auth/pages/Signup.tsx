import {  useState, type FormEvent } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { useRedirect } from "../hooks/useRedirect";


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
      options: {
        data: {
          name,
        },
      },
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
      name: name,
      email: email,
    });

    setLoading(false);

    if (profileError) {
      setErrorMessage(profileError.message);
      return;
    }

    navigate(`/auth/login?redirect=${encodeURIComponent(redirect)}`);

  };

  return (
    <div style={{ maxWidth: 520 }}>
      <h2>Skapa konto</h2>

      <form onSubmit={handleSignup}>
        <label>
          Namn
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label>
          E-post
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label>
          Lösenord
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        {errorMessage && <p style={{ color: "crimson" }}>{errorMessage}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Skapar..." : "Skapa konto"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Har du redan konto?{" "}
        <Link to={`/auth/login?redirect=${encodeURIComponent(redirect)}`}>
          Logga in
        </Link>
      </p>
    </div>
  );
}
