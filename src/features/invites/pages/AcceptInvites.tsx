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
  console.log("ACCEPT INVITE – NY VERSION KÖRS");

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

      const { data: inviteData, error: inviteError } = await supabase
        .from("invitations")
        .select("invited_email, used, status, spaces_id")
        .eq("token", token)
        .single();

      if (inviteError || !inviteData) {
        setLoading(false);
        setErrorMessage("Inbjudan hittades inte, eller så har du inte behörighet.");
        return;
      }

      if (inviteData.used || inviteData.status === "accepted") {
        setLoading(false);
        setErrorMessage("Den här inbjudan är redan använd.");
        return;
      }

      setInvite(inviteData as InviteRow);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoading(false);
        navigate(`/auth/login?redirect=/auth/invite/${token}`);
        return;
      }

      setCurrentEmail(user.email ?? null);
      setLoading(false);
    };

    loadInvite();
  }, [token, navigate]);

  const handleSignOutAndContinue = async () => {
    if (!token) return;
    await supabase.auth.signOut();
    navigate(`/auth/login?redirect=/auth/invite/${token}`);
  };

  const handleGoToLogin = () => {
    if (!token) return;
    navigate(`/auth/login?redirect=/auth/invite/${token}`);
  };

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

  const emailMismatch =
    !!invite &&
    !!currentEmail &&
    currentEmail.toLowerCase() !== invite.invited_email.toLowerCase();

  return (
    <div style={{ maxWidth: 520 }}>
      <h1>Acceptera inbjudan</h1>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {!errorMessage && invite && (
        <>
          <p>
            Inbjudan är skickad till: <strong>{invite.invited_email}</strong>
          </p>

          {emailMismatch && (
            <>
              <p className="error-message">
                Du är inloggad som <strong>{currentEmail}</strong>, men inbjudan är för{" "}
                <strong>{invite.invited_email}</strong>.
              </p>

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button type="button" onClick={handleSignOutAndContinue}>
                  Logga ut och fortsätt
                </button>

                <button type="button" onClick={handleGoToLogin}>
                  Logga in med rätt konto
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={handleAccept}
            disabled={!currentEmail || emailMismatch}
            style={{ marginTop: 12 }}
          >
            Acceptera och gå med
          </button>
        </>
      )}
    </div>
  );
}
