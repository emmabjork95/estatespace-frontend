import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Props = {
  spacesID: string;
};

export function InviteMember({ spacesID }: Props) {
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInvite = async () => {
    setErrorMessage(null);
    setInviteLink(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setLoading(false);
      setErrorMessage("Skriv in en e-postadress.");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setErrorMessage("Du måste vara inloggad.");
      return;
    }

    const token = crypto.randomUUID();

    const { error } = await supabase.from("invitations").insert({
      spaces_id: spacesID,
      profiles_id: user.id,
      invited_email: cleanEmail,
      token,
      status: "pending",
      used: false,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const link = `${window.location.origin}/auth/invite/${token}`;
    setInviteLink(link);
    setEmail("");
  };

  const copyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    alert("Länken är kopierad ✅");
  };

  return (
    <section style={{ marginTop: 16 }}>

      <label>
        E-post
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="namn@email.com"
        />
      </label>

      <button type="button" onClick={handleInvite} disabled={loading}>
        {loading ? "Skapar..." : "Skapa inbjudan"}
      </button>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {inviteLink && (
        <div style={{ marginTop: 10 }}>
          <p>Kopiera och skicka denna länk:</p>
          <input value={inviteLink} readOnly style={{ width: "100%" }} />
          <button type="button" onClick={copyLink}>
            Kopiera länk
          </button>
        </div>
      )}
    </section>
  );
}
