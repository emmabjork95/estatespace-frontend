import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../shared/lib/supabaseClient";
import "../styles/Profile.css";
import "../../../shared/components/ui/Buttons.css";

export function Profile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [initialName, setInitialName] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSaveName = useMemo(() => {
    const trimmed = name.trim();
    return trimmed.length > 0 && trimmed !== initialName.trim() && !savingName;
  }, [name, initialName, savingName]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setMessage(null);
      setErrorMessage(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
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

      const fetchedName = data?.name ?? "";
      setName(fetchedName);
      setInitialName(fetchedName);

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const clearAlerts = () => {
    setMessage(null);
    setErrorMessage(null);
  };

  const handleUpdateName = async (e: FormEvent) => {
    e.preventDefault();
    clearAlerts();

    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage("Namn kan inte vara tomt.");
      return;
    }

    setSavingName(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("Du måste vara inloggad.");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ name: trimmed })
        .eq("profiles_id", user.id);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setInitialName(trimmed);
      setMessage("Namnet uppdaterades");
    } finally {
      setSavingName(false);
    }
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    clearAlerts();

    if (newPassword.trim().length < 6) {
      setErrorMessage("Lösenordet måste vara minst 6 tecken.");
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setNewPassword("");
      setMessage("Lösenordet uppdaterades");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="profilePage">
        <div className="profileCard">
          <div className="profileHeader">
            <h2>Profil</h2>
            <p className="profileSub">Laddar…</p>
          </div>
          <div className="profileSkeleton" />
          <div className="profileSkeleton" />
          <div className="profileSkeleton profileSkeleton--wide" />
        </div>
      </div>
    );
  }

  return (
    <div className="profilePage">
      <div className="profileCard">
        <div className="profileTopRow">
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => navigate(-1)}
          >
            Tillbaka
          </button>
        </div>

        <div className="profileHeader">
          <h2>Profilinställningar</h2>
          <p className="profileSub">
            Uppdatera namn och lösenord för ditt konto.
          </p>
        </div>

        {(errorMessage || message) && (
          <div
            className={`profileAlert ${
              errorMessage ? "profileAlert--error" : "profileAlert--success"
            }`}
          >
            <span>{errorMessage ?? message}</span>
            <button
              className="profileAlertClose"
              onClick={clearAlerts}
              type="button"
            >
              ✕
            </button>
          </div>
        )}

        <div className="profileInfoRow">
          <span className="profileInfoLabel">E-post</span>
          <span className="profileInfoValue">{email}</span>
        </div>

        <div className="profileDivider" />

        {/* Ändra namn */}
        <form onSubmit={handleUpdateName} className="profileSection">
          <div className="profileSectionHeader">
            <h3>Ändra namn</h3>
            <p>Ditt namn visas i appen.</p>
          </div>

          <label className="profileField">
            <span>Namn</span>
            <input
              className="profileInput"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={clearAlerts}
              required
            />
          </label>

          <div className="profileActions">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={!canSaveName}
            >
              {savingName ? "Sparar…" : "Spara namn"}
            </button>
          </div>
        </form>

        <div className="profileDivider" />

        {/* Ändra lösenord */}
        <form onSubmit={handleUpdatePassword} className="profileSection">
          <div className="profileSectionHeader">
            <h3>Ändra lösenord</h3>
            <p>Minst 6 tecken.</p>
          </div>

          <label className="profileField">
            <span>Nytt lösenord</span>
            <input
              className="profileInput"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onFocus={clearAlerts}
              required
            />
          </label>

          <div className="profileActions">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={savingPassword}
            >
              {savingPassword ? "Sparar…" : "Spara lösenord"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
