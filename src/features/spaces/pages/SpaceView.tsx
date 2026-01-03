import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import { type ItemListItem } from "../../items/ItemsTypes";
import { type Space } from "../SpacesTypes";
import "../styles/SpaceView.css";
import "../../../styles/Buttons.css";

type ItemWithCategory = ItemListItem & {
  category?: string | null;
};

const SpaceView = () => {
  const navigate = useNavigate();
  const { spacesID } = useParams();

  const [space, setSpace] = useState<Space | null>(null);
  const [items, setItems] = useState<ItemWithCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);


  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const statusOk = statusFilter === "all" || item.status === statusFilter;
      const categoryOk =
        categoryFilter === "all" || item.category === categoryFilter;

      return statusOk && categoryOk;
    });
  }, [items, statusFilter, categoryFilter]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      if (it.category) set.add(it.category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  useEffect(() => {
    const fetchSpaceAndItems = async () => {
      setErrorMessage(null);
      setLoading(true);

      setOwnerName(null);
      setOwnerEmail(null);

      setStatusFilter("all");
      setCategoryFilter("all");

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
        setErrorMessage("Du måste vara inloggad för att se detta space.");
        return;
      }

      setCurrentUserId(user.id);

      const { data: spaceData, error: spaceError } = await supabase
        .from("spaces")
        .select("spaces_id, name, description, profiles_id")
        .eq("spaces_id", spacesID)
        .single();

      if (spaceError || !spaceData) {
        setLoading(false);
        setErrorMessage(spaceError?.message ?? "Kunde inte hämta space.");
        return;
      }

      const { data: ownerProfile, error: ownerError } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("profiles_id", spaceData.profiles_id)
        .single();

      if (!ownerError && ownerProfile) {
        setOwnerName(ownerProfile.name ?? null);
        setOwnerEmail(ownerProfile.email ?? null);
      } else {
        setOwnerName(null);
        setOwnerEmail(null);
      }

      const { data: itemsData, error: itemsError } = await supabase
        .from("items")
        .select("items_id, name, status, category, image_url, created_at")
        .eq("spaces_id", spacesID)
        .order("created_at", { ascending: false });

      setLoading(false);

      if (itemsError) {
        setErrorMessage(itemsError.message);
        return;
      }

      setSpace(spaceData);
      setItems((itemsData ?? []) as ItemWithCategory[]);
    };

    fetchSpaceAndItems();
  }, [spacesID]);

  const handleLeaveSpace = async () => {
    if (!spacesID || !space) return;

    const ok = window.confirm("Vill du lämna detta space?");
    if (!ok) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage("Du måste vara inloggad.");
      return;
    }


    if (user.id === space.profiles_id) {
      setErrorMessage("Ägaren kan inte lämna sitt eget space.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase
      .from("space_members")
      .delete()
      .eq("spaces_id", spacesID)
      .eq("profiles_id", user.id);

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate("/dashboard");
  };

  const isOwner = currentUserId === space?.profiles_id;

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
                Tillbaka
              </button>

              <div className="space-heroActions">
  
                {!isOwner && (
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={handleLeaveSpace}
                    disabled={loading}
                  >
                    Lämna space
                  </button>
                )}

                {isOwner && (
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => navigate(`/spaces/${space.spaces_id}/members`)}
                  >
                    Medlemmar
                  </button>
                )}

                {isOwner && (
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => navigate(`/spaces/${space.spaces_id}/edit`)}
                  >
                    Redigera Space
                  </button>
                )}

      
                {isOwner && (
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => navigate(`/spaces/${space.spaces_id}/items/new`)}
                  >
                    + Lägg till föremål
                  </button>
                )}
              </div>
            </div>

            <h1 className="space-title">{space.name}</h1>

            {space.description && (
              <p className="space-description">{space.description}</p>
            )}

            {!isOwner && (
              <div className="space-owner">
                <span className="space-ownerLabel">Ägare:</span>{" "}
                <strong>{ownerName ?? ownerEmail ?? "Okänd"}</strong>
              </div>
            )}
          </header>


          <div className="spaceFilterBar">
            <div className="spaceFilterLeft">
              <label className="space-filter">
                <span>Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Alla</option>
                  <option value="Unsorted">Osorterad</option>
                  <option value="Keep">Spara</option>
                  <option value="Donate">Donera</option>
                  <option value="Sell">Sälja</option>
                  <option value="Discard">Slänga</option>
                </select>
              </label>

              <label className="space-filter">
                <span>Kategori</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  disabled={availableCategories.length === 0}
                >
                  <option value="all">Alla</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-filter space-filter--button">
                <span>&nbsp;</span>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setCategoryFilter("all");
                  }}
                >
                  Rensa
                </button>
              </label>
            </div>
          </div>


          <section className="items-section">
            <div className="items-header">
              <span className="items-count">{filteredItems.length} st</span>
            </div>

            {items.length === 0 ? (
              <div className="empty-state">
                <h3>Inga föremål ännu</h3>

                {isOwner ? (
                  <>
                    <p>Lägg till ditt första föremål för att börja organisera.</p>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() =>
                        navigate(`/spaces/${space.spaces_id}/items/new`)
                      }
                    >
                      +
                    </button>
                  </>
                ) : (
                  <p>
                    {ownerName ?? "Ägaren"} har inte lagt till några föremål ännu.
                  </p>
                )}
              </div>
            ) : (
              <>
                {filteredItems.length === 0 ? (
                  <div className="empty-state">
                    <h3>Inga träffar</h3>
                    <p>Testa att ändra filter eller klicka på “Rensa”.</p>
                  </div>
                ) : (
                  <div className="items-grid" aria-label="Items">
                    {filteredItems.map((item) => (
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
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default SpaceView;
