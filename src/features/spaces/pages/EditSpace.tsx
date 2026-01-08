import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../shared/lib/supabaseClient";
import "../styles/EditSpace.css";
import "../../../shared/components/ui/Buttons.css";

const EditSpace = () => {
  const navigate = useNavigate();
  const { spacesID } = useParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const disabled = saving || deleting;

  const clearAlerts = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  useEffect(() => {
    const fetchSpace = async () => {
      clearAlerts();
      setLoading(true);

      if (!spacesID) {
        setLoading(false);
        setErrorMessage("Saknar space-id i URL:en.");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoading(false);
        setErrorMessage("Du måste vara inloggad för att redigera ett space.");
        return;
      }

      const { data, error } = await supabase
        .from("spaces")
        .select("profiles_id, name, description")
        .eq("spaces_id", spacesID)
        .single();

      setLoading(false);

      if (error || !data) {
        setErrorMessage(error?.message ?? "Kunde inte hämta space.");
        return;
      }

      if (data.profiles_id !== user.id) {
        setErrorMessage("Du har inte behörighet att redigera detta space.");
        return;
      }

      setName(data.name ?? "");
      setDescription(data.description ?? "");
    };

    fetchSpace();
  }, [spacesID]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearAlerts();

    if (!spacesID) {
      setErrorMessage("Saknar space-id i URL:en.");
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Namn får inte vara tomt.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("Du måste vara inloggad för att spara ändringar.");
        return;
      }

      const { error } = await supabase
        .from("spaces")
        .update({
          name: trimmedName,
          description: description.trim() ? description.trim() : null,
        })
        .eq("spaces_id", spacesID)
        .eq("profiles_id", user.id);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage("Ändringar sparades");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSpace = async () => {
    if (!spacesID) return;

    const ok = window.confirm(
      `Är du säker att du vill radera "${name || "detta space"}"?\n\nDetta går inte att ångra.`
    );
    if (!ok) return;

    clearAlerts();
    setDeleting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("Du måste vara inloggad för att radera ett space.");
        return;
      }

      const { error } = await supabase
        .from("spaces")
        .delete()
        .eq("spaces_id", spacesID)
        .eq("profiles_id", user.id);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      navigate("/dashboard", { replace: true });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="editSpacePage">
        <div className="createCard">
          <div className="editSpaceHeader">
            <h2>Redigera space</h2>
            <p className="editSpaceSub">Laddar…</p>
          </div>
          <div className="editSpaceSkeleton" />
          <div className="editSpaceSkeleton" />
          <div className="editSpaceSkeleton editSpaceSkeleton--wide" />
        </div>
      </div>
    );
  }

  return (
    <div className="editSpacePage">
      <div className="createCard">
        <div className="editSpaceTopRow">
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => navigate(`/spaces/${spacesID}`)}
            disabled={disabled}
          >
            Tillbaka
          </button>

          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDeleteSpace}
            disabled={disabled}
          >
            {deleting ? "Raderar…" : "Ta bort Space"}
          </button>
        </div>

        <div className="editSpaceHeader">
          <h2>Redigera space</h2>
        </div>

        {(errorMessage || successMessage) && (
          <div
            className={`Alert ${
              errorMessage ? "Alert--error" : "Alert--success"
            }`}
          >
            <span className="AlertText">{errorMessage ?? successMessage}</span>
            <button
              className="AlertClose"
              type="button"
              onClick={clearAlerts}
              aria-label="Stäng meddelande"
            >
              ✕
            </button>
          </div>
        )}

        {!errorMessage && (
          <form onSubmit={handleSubmit} className="editSpaceForm">
            <label className="editSpaceField">
              <span>Namn</span>
              <input
                className="editSpaceInput"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={clearAlerts}
                required
                disabled={disabled}
                placeholder="t.ex. Sommarstugan"
              />
            </label>

            <label className="editSpaceField">
              <span>Beskrivning</span>
              <textarea
                className="editSpaceInput editSpaceTextarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={clearAlerts}
                rows={4}
                placeholder="Valfritt"
                disabled={disabled}
              />
            </label>

            <div className="editSpaceActions">
              <button className="btn btn-primary" type="submit" disabled={disabled}>
                {saving ? "Sparar…" : "Spara ändringar"}
              </button>

              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => navigate(`/spaces/${spacesID}`)}
                disabled={disabled}
              >
                Avbryt
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditSpace;