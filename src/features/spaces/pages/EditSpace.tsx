import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { type Space } from "../SpacesTypes";
import "../styles/EditSpace.css"
import "../../../styles/Buttons.css";

const EditSpace = () => {
  const navigate = useNavigate();
  const { spacesID } = useParams();

  const [space, setSpace] = useState<Space | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpace = async () => {
      setErrorMessage(null);
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
        .select("spaces_id, profiles_id, name, description")
        .eq("spaces_id", spacesID)
        .single();

      setLoading(false);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.profiles_id !== user.id) {
        setErrorMessage("Du har inte behörighet att redigera detta space.");
        return;
      }

      setSpace(data as Space);
      setName(data.name ?? "");
      setDescription(data.description ?? "");
    };

    fetchSpace();
  }, [spacesID]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
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
      setErrorMessage("Du måste vara inloggad för att spara ändringar.");
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      setLoading(false);
      setErrorMessage("Name får inte vara tomt.");
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

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate(`/spaces/${spacesID}`);
  };

  const handleDeleteSpace = async () => {
    if (!spacesID || !space) return;

    const ok = window.confirm(
      `Är du säker att du vill radera "${space.name}"?\n\nDetta går inte att ångra.`
    );
    if (!ok) return;

    setErrorMessage(null);
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setErrorMessage("Du måste vara inloggad för att radera ett space.");
      return;
    }

    const { error } = await supabase
      .from("spaces")
      .delete()
      .eq("spaces_id", spacesID)
      .eq("profiles_id", user.id);

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="edit-page">
      <div className="edit-card">
        <h1 className="edit-title">Edit space</h1>

        {loading && <p className="edit-loading">Loading...</p>}

        {!loading && errorMessage && (
          <p className="error-message">{errorMessage}</p>
        )}

        {!loading && !errorMessage && space && (
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="field">
              <label htmlFor="name">Space name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Optional"
              />
            </div>

            <div className="edit-actions">
              <button
                type="button"
                className="btn-danger"
                onClick={handleDeleteSpace}
                disabled={loading}
              >
                Delete space
              </button>

              <div className="edit-actions-right">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate(`/spaces/${spacesID}`)}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  className="btn-primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditSpace;
