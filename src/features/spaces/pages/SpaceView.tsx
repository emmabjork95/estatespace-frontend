import { useEffect } from "react";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import { type ItemListItem  } from "../../items/ItemsTypes";
import {type Space } from "../SpacesTypes";
import "../styles/SpaceView.css";



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
  <div className="space-page">
    {loading && <p className="space-loading">Laddar...</p>}

    {!loading && errorMessage && (
      <p className="error-message">{errorMessage}</p>
    )}

    {!loading && !errorMessage && space && (
      <>
        <header className="space-hero">
          <div className="space-heroTop">
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => navigate("/dashboard")}
              aria-label="Back to dashboard"
            >
              ← Tillbaka
            </button>

            <div className="space-heroActions">
              <button className="btn btn-ghost" type="button">Filter</button>
              <button className="btn btn-ghost" type="button">Kategori</button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => navigate(`/spaces/${space.spaces_id}/items/new`)}
              >
                + Lägg till föremål
              </button>
              <button
  className="btn btn-ghost"
  type="button"
  onClick={() => navigate(`/spaces/${space.spaces_id}/edit`)}
>
  Edit space
</button>

            </div>
          </div>

          <h1 className="space-title">{space.name}</h1>

          {space.description && (
            <p className="space-description">{space.description}</p>
          )}
        </header>

        <section className="items-section">
          <div className="items-header">
            <h2 className="items-title">Items</h2>
            <span className="items-count">{items.length} st</span>
          </div>

          {items.length === 0 ? (
            <div className="empty-state">
              <h3>Inga föremål ännu</h3>
              <p>Lägg till ditt första föremål för att börja organisera.</p>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => navigate(`/spaces/${space.spaces_id}/items/new`)}
              >
                + 
              </button>
            </div>
          ) : (
            <div className="items-grid" aria-label="Items">
              {items.map((item) => (
                <button
                  key={item.items_id}
                  type="button"
                  className="item-card"
                  onClick={() => navigate(`/items/${item.items_id}`)}
                >
                  <div className="item-thumb">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} />
                    ) : (
                      <div className="item-thumbPlaceholder" />
                    )}
                  </div>
                  <div className="item-meta">
                    <div className="item-name">{item.name}</div>
                  </div>
                </button>
              ))}

              <button
                type="button"
                className="item-card item-card--add"
                onClick={() => navigate(`/spaces/${space.spaces_id}/items/new`)}
              >
                <div className="addPlus">+</div>
                <div className="addText">Lägg till föremål</div>
              </button>
            </div>
          )}
        </section>
      </>
    )}
  </div>
);


};

export default SpaceView;