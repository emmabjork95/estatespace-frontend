import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import "../styles/AcceptInvite.css";
import "../../../styles/Buttons.css";

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
        setErrorMessage(
          "Inbjudan hittades inte, eller så har du inte behörighet."
        );
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

  const emailMismatch =
    !!invite &&
    !!currentEmail &&
    currentEmail.toLowerCase() !== invite.invited_email.toLowerCase();

  if (loading) {
    return (
      <div className="invite-page">
        <div className="invite-card">
          <h1 className="invite-title">Acceptera inbjudan</h1>
          <p className="invite-sub">Laddar…</p>
          <div className="invite-skeleton" />
          <div className="invite-skeleton" />
          <div className="invite-skeleton invite-skeleton--wide" />
        </div>
      </div>
    );
  }

  return (
    <div className="invite-page">
      <div className="invite-card">
        <h1 className="invite-title">Acceptera inbjudan</h1>

        {errorMessage && (
          <div className="invite-alert invite-alert--error">
            <span>{errorMessage}</span>
          </div>
        )}

        {!errorMessage && invite && (
          <>
            <p className="invite-sub">
              Inbjudan är skickad till:{" "}
              <span className="invite-strong">{invite.invited_email}</span>
            </p>

            {emailMismatch && (
  <>
    <div className="invite-alert invite-alert--error">
      <span>
        Du är inloggad som{" "}
        <span className="invite-strong">{currentEmail}</span>, men
        inbjudan är för{" "}
        <span className="invite-strong">{invite.invited_email}</span>.
      </span>
    </div>

    <div className="invite-actions">
        <button
        type="button"
        className="btn"
        onClick={handleGoToLogin}
      >
        Logga in med annat konto
      </button>
      <button
        type="button"
        className="btn"
        onClick={handleSignOutAndContinue}
      >
        Logga ut
      </button>

    
    </div>
  </>
)}

            <button
              type="button"
              onClick={handleAccept}
              disabled={!currentEmail || emailMismatch}
              className="btn btn-accept "
            >
              Acceptera och gå med
            </button>
          </>
        )}
      </div>
    </div>
  );
}
