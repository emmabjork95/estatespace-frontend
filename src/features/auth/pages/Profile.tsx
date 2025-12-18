import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../../lib/supabaseClient";

export function Profile() {
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setMessage(null);
      setErrorMessage(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setErrorMessage(userError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        setErrorMessage("Du måste vara inloggad för att se profilsidan.");
        setLoading(false);
        return;
      }

      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("profiles_id", user.id)
        .single();

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setName(data?.name ?? "");
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleUpdateName = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setErrorMessage(userError.message);
      return;
    }

    if (!user) {
      setErrorMessage("Du måste vara inloggad för att uppdatera profilen.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ name })
      .eq("profiles_id", user.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Namnet uppdaterades ✅");
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    if (newPassword.trim().length < 6) {
      setErrorMessage("Lösenordet måste vara minst 6 tecken.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setNewPassword("");
    setMessage("Lösenordet uppdaterades ✅");
  };

  if (loading) return <p>Laddar profil...</p>;

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Profilinställningar</h2>

      <p>
        <strong>E-post:</strong> {email || "—"}
      </p>

      <hr />

      <form onSubmit={handleUpdateName}>
        <h3>Ändra namn</h3>

        <label>
          Namn
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <button type="submit">Spara namn</button>
      </form>

      <hr />

      <form onSubmit={handleUpdatePassword}>
        <h3>Ändra lösenord</h3>

        <label>
          Nytt lösenord
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit">Spara lösenord</button>
      </form>

      {errorMessage && <p style={{ color: "crimson" }}>{errorMessage}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
    </div>
  );
}
