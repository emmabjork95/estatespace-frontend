import { type FormEvent } from "react";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import "../styles/CreateSpace.css";
import "../../../styles/Buttons.css";

const CreateSpaces = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
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
        name,
        description,
        profiles_id: user.id,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (data) {
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
        <div className="createSpaceAlert createSpaceAlert--error">
          <span className="createSpaceAlertText">{errorMessage}</span>
          <button
            className="createSpaceAlertClose"
            type="button"
            onClick={() => setErrorMessage(null)}
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
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="t.ex. Mammas vind"
          />
        </label>

        <label className="createSpaceField">
          <span>Beskrivning</span>
          <textarea
            className="createSpaceInput createSpaceTextarea"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Valfritt"
            rows={4}
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
