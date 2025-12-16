import { useEffect } from "react";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import { type ItemListItem  } from "../../items/ItemsTypes";
import {type Space } from "../SpacesTypes";


const SpaceView = () => {
  const navigate = useNavigate();
  const { spacesID } = useParams();

  const [space, setSpace] = useState<Space | null>(null);
  const [items, setItems] = useState<ItemListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpaceAndItems = async () => {
      setErrorMessage(null);
      setLoading(true);

      if (!spacesID) {
        setLoading(false);
        setErrorMessage("Saknar space-id i URL:en.");
        return;
      }

      // säkerställ att användaren är inloggad
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoading(false);
        setErrorMessage("Du måste vara inloggad för att se detta space.");
        return;
      }

      // hämta space
      const { data: spaceData, error: spaceError } = await supabase
        .from("spaces")
        .select("spaces_id, name, description, profiles_id")
        .eq("spaces_id", spacesID)
        .single();

      if (spaceError) {
        setLoading(false);
        setErrorMessage(spaceError.message);
        return;
      }

      // hämta items i detta space
      const { data: itemsData, error: itemsError } = await supabase
        .from("items")
        .select("items_id, name, status, image_url, created_at")
        .eq("spaces_id", spacesID)
        .order("created_at", { ascending: false });

      setLoading(false);

      if (itemsError) {
        setErrorMessage(itemsError.message);
        return;
      }

      setSpace(spaceData);
      setItems(itemsData ?? []);
    };

    fetchSpaceAndItems();
  }, [spacesID]);

  return (
    <div
      className="space-page"
    >
      <div className="space-card">
        {loading && <p>Loading...</p>}

        {!loading && errorMessage && (
          <p className="error-message">{errorMessage}</p>
        )}

        {!loading && !errorMessage && space && (
          <>
            <h1 className="space-title">{space.name}</h1>
            {space.description && (
              <p className="space-description">{space.description}</p>
            )}

            <div className="space-actions">
              <button
                className="primary-btn"
                onClick={() => navigate("/dashboard")}
              >
                Back to dashboard
              </button>

              <button
                className="secondary-btn"
                onClick={() => navigate(`/spaces/${space.spaces_id}/items/new`)}
              >
                Add item
              </button>
            </div>

            <h2 className="space-subtitle">Items</h2>

            {items.length === 0 && <p>No items added yet.</p>}

            {items.length > 0 && (
              <ul className="items-list">
                {items.map((item) => (
                  <li
                    key={item.items_id}
                    className="item-card"
                    onClick={() => navigate(`/items/${item.items_id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigate(`/items/${item.items_id}`);
                    }}
                  >
                    {item.image_url && (
                      <img
                        className="item-detail-image"
                        src={item.image_url}
                        alt={item.name}
                      />
                    )}

                    <div className="item-info">
                      <h3 className="item-title">{item.name}</h3>
                      <p className="item-meta">Status: {item.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SpaceView;

