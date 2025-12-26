import { useState, type FormEvent } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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
      setErrorMessage(error.message);
      return;
    }

    const user = data.user;
    if (!user) {
      setErrorMessage("Kunde inte skapa användare.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      profiles_id: user.id,
      name: name,
      email: email,
    });

    if (profileError) {
      setErrorMessage(profileError.message);
      return;
    }

    navigate("/auth/login");
  };

  return (
    <form onSubmit={handleSignup}>
      <h2>Skapa konto</h2>

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
        />
      </label>

      <label>
        Lösenord
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      {errorMessage && <p style={{ color: "crimson" }}>{errorMessage}</p>}

      <button type="submit">Skapa konto</button>
    </form>
  );
}
