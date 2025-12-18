import { type FormEvent } from "react";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import "../styles/CreateSpace.css";

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

    // hämta inloggad användare
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setErrorMessage("Du måste vara inloggad för att skapa ett space.");
      return;
    }

    // skapa space
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

    // Space skapades → gå till space-vyn
    if (data) {
      navigate(`/spaces/${data.spaces_id}`);
    }
  };

  return (
    <div
      className="create-space-page"
    >
      <div className="create-space-card">
        <h1 className="create-space-title">Create new space</h1>

        <form onSubmit={handleSubmit} className="create-space-form">
          <div className="field">
            <label htmlFor="name">Space name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Grandma’s apartment"
            />
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={4}
            />
          </div>

          {errorMessage && (
            <p className="error-message">{errorMessage}</p>
          )}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create space"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateSpaces;
