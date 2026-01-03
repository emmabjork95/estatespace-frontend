import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import "../styles/InviteMember.css";
import "../../../styles/Buttons.css";

type Props = {
  spacesID: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "");

export function InviteMember({ spacesID }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const clearAlerts = () => {
    setErrorMessage(null);
    setSuccess(false);
  };

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

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
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

      const text = await res.text();

      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Ej JSON från API. Status ${res.status}. Body börjar: ${text.slice(
            0,
            80
          )}`
        );
      }

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
    <section className="inviteMember">
 

      {(errorMessage || success) && (
        <div
          className={`inviteMemberAlert ${
            errorMessage ? "inviteMemberAlert--error" : "inviteMemberAlert--success"
          }`}
        >
          <span>{errorMessage ?? "Inbjudan skickad "}</span>
          <button
            type="button"
            className="inviteMemberAlertClose"
            onClick={clearAlerts}
            aria-label="Stäng meddelande"
          >
            ✕
          </button>
        </div>
      )}

      <div className="inviteMemberRow">
        <label className="inviteMemberField">
          <span>E-postadress</span>
          <input
            className="inviteMemberInput"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={clearAlerts}
            placeholder="namn@email.com"
            disabled={loading}
            inputMode="email"
            autoComplete="email"
          />
        </label>

        <button
          type="button"
          className="btn btn-primary inviteMemberBtn"
          onClick={handleInvite}
          disabled={loading}
        >
          {loading ? "Skickar…" : "Skicka"}
        </button>
      </div>

   
    </section>
  );
}
