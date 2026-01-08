import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../shared/lib/supabaseClient";

import "../styles/CreateSpace.css";
import "../../../shared/components/ui/Buttons.css";

const CreateSpaces = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = () => setErrorMessage(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Namn får inte vara tomt.");
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setErrorMessage("Du måste vara inloggad för att skapa ett space.");
      return;
    }

    const { data, error } = await supabase
      .from("spaces")
      .insert({
        name: trimmedName,
        description: description.trim() ? description.trim() : null,
        profiles_id: user.id,
      })
      .select("spaces_id")
      .single();

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (data?.spaces_id) {
      navigate(`/spaces/${data.spaces_id}`);
    }
  };

  return (
    <div className="createSpacePage">
      <div className="createSpaceCard">
        <div className="createSpaceHeader">
          <h2>Skapa nytt space</h2>
        </div>

        {errorMessage && (
          <div className="Alert Alert--error">
            <span className="AlertText">{errorMessage}</span>
            <button
              className="AlertClose"
              type="button"
              onClick={clearError}
              aria-label="Stäng meddelande"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="createSpaceForm">
          <label className="createSpaceField">
            <span>Space namn</span>
            <input
              className="createSpaceInput"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="t.ex. Mammas vind"
            />
          </label>

          <label className="createSpaceField">
            <span>Beskrivning</span>
            <textarea
              className="createSpaceInput createSpaceTextarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Valfritt"
              rows={4}
              disabled={loading}
            />
          </label>

          <div className="createSpaceActions">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Skapar..." : "Skapa space"}
            </button>

            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Avbryt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSpaces;