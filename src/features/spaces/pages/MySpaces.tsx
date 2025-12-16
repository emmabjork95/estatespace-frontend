import { useEffect } from "react";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import {type Space } from "../SpacesTypes";

const MySpaces = () => {
  const navigate = useNavigate();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMySpaces = async () => {
      setErrorMessage(null);
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoading(false);
        setErrorMessage("Du måste vara inloggad för att se dina spaces.");
        return;
      }

      const { data, error } = await supabase
        .from("spaces")
        .select("spaces_id, name, description, created_at")
        .eq("profiles_id", user.id)
        .order("created_at", { ascending: false });

      setLoading(false);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSpaces(data ?? []);
    };

    fetchMySpaces();
  }, []);

  return (
    <div
      className="spaces-page"
    >
      <div className="spaces-card">
        <div className="spaces-header">
          <h1 className="spaces-title">My spaces</h1>

          <button className="primary-btn" onClick={() => navigate("/spaces/new")}>
            + Create new space
          </button>
        </div>

        {loading && <p>Loading...</p>}

        {!loading && errorMessage && (
          <p className="error-message">{errorMessage}</p>
        )}

        {!loading && !errorMessage && spaces.length === 0 && (
          <p>You haven’t created any spaces yet.</p>
        )}

        {!loading && !errorMessage && spaces.length > 0 && (
          <ul className="spaces-list">
            {spaces.map((space) => (
              <li
                key={space.spaces_id}
                className="spaces-list-item"
                onClick={() => navigate(`/spaces/${space.spaces_id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigate(`/spaces/${space.spaces_id}`);
                }}
              >
                <div className="spaces-list-item-title">{space.name}</div>
                {space.description && (
                  <div className="spaces-list-item-desc">{space.description}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MySpaces;
