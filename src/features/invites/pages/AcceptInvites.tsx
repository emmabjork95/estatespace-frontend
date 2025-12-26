import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";

type InviteRow = {
  invited_email: string;
  used: boolean;
  status: string | null;
  spaces_id: string;
};

export function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [invite, setInvite] = useState<InviteRow | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadInvite = async () => {
      setLoading(true);
      setErrorMessage(null);

      if (!token) {
        setLoading(false);
        setErrorMessage("Saknar token i URL:en.");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoading(false);
        setErrorMessage("Du måste vara inloggad för att acceptera en inbjudan.");
        return;
      }

      setCurrentEmail(user.email ?? null);

      const { data, error } = await supabase
        .from("invitations")
        .select("invited_email, used, status, spaces_id")
        .eq("token", token)
        .single();

      setLoading(false);

      if (error || !data) {
        setErrorMessage("Inbjudan hittades inte, eller så har du inte behörighet.");
        return;
      }

      if (data.used || data.status === "accepted") {
        setErrorMessage("Den här inbjudan är redan använd.");
        return;
      }

      setInvite(data as InviteRow);
    };

    loadInvite();
  }, [token]);

  const handleAccept = async () => {
    setErrorMessage(null);
    setLoading(true);

    if (!token) {
      setLoading(false);
      setErrorMessage("Saknar token.");
      return;
    }

    const { data, error } = await supabase.rpc("accept_invitation", {
      p_token: token,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate(`/spaces/${data}`);
  };

  if (loading) return <p>Laddar inbjudan...</p>;

  return (
    <div style={{ maxWidth: 520 }}>
      <h1>Acceptera inbjudan</h1>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {!errorMessage && invite && (
        <>
          <p>
            Inbjudan är skickad till: <strong>{invite.invited_email}</strong>
          </p>

          {currentEmail && currentEmail.toLowerCase() !== invite.invited_email.toLowerCase() && (
            <p className="error-message">
              Du är inloggad som <strong>{currentEmail}</strong>, men inbjudan är för{" "}
              <strong>{invite.invited_email}</strong>. Logga in med rätt konto.
            </p>
          )}

          <button
            type="button"
            onClick={handleAccept}
            disabled={
              !currentEmail ||
              currentEmail.toLowerCase() !== invite.invited_email.toLowerCase()
            }
          >
            Acceptera och gå med
          </button>
        </>
      )}
    </div>
  );
}
