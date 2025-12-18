import { useEffect } from "react";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/ItemDetail.css";
import { type Item, } from "../ItemsTypes";


const ItemDetail = () => {
  const navigate = useNavigate();
  const { itemsID } = useParams();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      setErrorMessage(null);
      setLoading(true);

      if (!itemsID) {
        setLoading(false);
        setErrorMessage("Saknar item-id i URL:en.");
        return;
      }

      // säkerställ att användaren är inloggad
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoading(false);
        setErrorMessage("Du måste vara inloggad för att se detta item.");
        return;
      }

      const { data, error } = await supabase
        .from("items")
        .select(
          "items_id, spaces_id, profiles_id, name, description, status, category, image_url, created_at"
        )
        .eq("items_id", itemsID)
        .single();

      setLoading(false);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setItem(data);
    };

    fetchItem();
  }, [itemsID]);

  return (
    <div
      className="item-page"
    >
      <div className="item-card">
        {loading && <p>Loading...</p>}

        {!loading && errorMessage && (
          <p className="error-message">{errorMessage}</p>
        )}

        {!loading && !errorMessage && item && (
          <>
            <h1 className="item-title">{item.name}</h1>

            {item.image_url && (
              <img
                className="item-detail-image"
                src={item.image_url}
                alt={item.name}
              />
            )}

            <div className="item-details">
              <p className="item-meta">
                <strong>Status:</strong> {item.status}
              </p>

              {item.category && (
                <p className="item-meta">
                  <strong>Category:</strong> {item.category}
                </p>
              )}

              {item.description && (
                <p className="item-description">{item.description}</p>
              )}
            </div>

            <div className="item-actions">
              <button
                className="secondary-btn"
                onClick={() => navigate(`/spaces/${item.spaces_id}`)}
              >
                Back to space
              </button>

              <button
                className="primary-btn"
                onClick={() => navigate(`/items/${item.items_id}/edit`)}
              >
                Edit item
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;