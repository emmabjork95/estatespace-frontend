import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Props = {
  spacesID: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL;
console.log("API_BASE:", API_BASE);

export function InviteMember({ spacesID }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInvite = async () => {
    setErrorMessage(null);
    setSuccess(false);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setLoading(false);
      setErrorMessage("Skriv in en e-postadress.");
      return;
    }
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    if (sessionError || !accessToken) {
      setLoading(false);
      setErrorMessage("Du måste vara inloggad för att bjuda in.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/spaces/${spacesID}/invite-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!data.ok) {
        setErrorMessage(data.error ?? "Kunde inte skicka inbjudan.");
        return;
      }

      setEmail("");
      setSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ marginTop: 16, maxWidth: 400 }}>
      <label>
        E-postadress
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="namn@email.com"
        />
      </label>

      <button type="button" onClick={handleInvite} disabled={loading}>
        {loading ? "Skickar..." : "Skicka inbjudan"}
      </button>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {success && <p style={{ color: "green" }}>Inbjudan skickad ✅</p>}
    </section>
  );
}
