import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/ItemDetail.css";
import "../../../styles/Buttons.css";
import { STATUS_LABELS, type Item, type Status } from "../ItemsTypes";



type InterestRow = {
  profiles_id: string;
  interest: "interested" | "declined";
};

type ProfileRow = {
  profiles_id: string;
  name: string | null;
  email: string | null;
};

type InterestUI = {
  profiles_id: string;
  interest: "interested" | "declined";
  name: string | null;
  email: string | null;
};

const ItemDetail = () => {
  const navigate = useNavigate();
  const { itemsID } = useParams();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);


  const [isMember, setIsMember] = useState(false);

  const [interestList, setInterestList] = useState<InterestUI[]>([]);
  const [myInterest, setMyInterest] = useState<
    "interested" | "declined" | null
  >(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isItemOwner = useMemo(() => {
    return !!currentUserId && !!item && currentUserId === item.profiles_id;
  }, [currentUserId, item]);

  const formatName = (x: InterestUI) => x.name ?? x.email ?? "Okänd";

  const interested = useMemo(
    () => interestList.filter((x) => x.interest === "interested"),
    [interestList]
  );

  const declined = useMemo(
    () => interestList.filter((x) => x.interest === "declined"),
    [interestList]
  );

  const fetchAll = async () => {
    setErrorMessage(null);
    setLoading(true);

    if (!itemsID) {
      setLoading(false);
      setErrorMessage("Saknar item-id i URL:en.");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setErrorMessage("Du måste vara inloggad för att se detta item.");
      return;
    }

    setCurrentUserId(user.id);

    const { data: itemData, error: itemError } = await supabase
      .from("items")
      .select(
        "items_id, spaces_id, profiles_id, name, description, status, category, image_url, created_at"
      )
      .eq("items_id", itemsID)
      .single();

    if (itemError || !itemData) {
      setLoading(false);
      setErrorMessage(itemError?.message ?? "Kunde inte hämta item.");
      return;
    }

    setItem(itemData);

    setSelectedImage(itemData.image_url ?? null);

    const { data: memberRow, error: memberError } = await supabase
      .from("space_members")
      .select("role")
      .eq("spaces_id", itemData.spaces_id)
      .eq("profiles_id", user.id)
      .single();

if (memberError || !memberRow) {
  setIsMember(false);
} else {
  setIsMember((memberRow.role ?? "").toLowerCase() === "member");
}


    const { data: interestRows, error: interestError } = await supabase
      .from("item_interests")
      .select("profiles_id, interest")
      .eq("items_id", itemsID);

    if (interestError) {
      setLoading(false);
      setErrorMessage(interestError.message);
      return;
    }

    const interestsRaw = (interestRows ?? []) as InterestRow[];

    const mine = interestsRaw.find((r) => r.profiles_id === user.id);
    setMyInterest(mine?.interest ?? null);

    const ids = interestsRaw.map((r) => r.profiles_id);

    if (ids.length === 0) {
      setInterestList([]);
      setLoading(false);
      return;
    }

    const { data: profileRows, error: profileError } = await supabase
      .from("profiles")
      .select("profiles_id, name, email")
      .in("profiles_id", ids);

    if (profileError) {
      setLoading(false);
      setErrorMessage(profileError.message);
      return;
    }

    const profiles = (profileRows ?? []) as ProfileRow[];

    const ui: InterestUI[] = interestsRaw.map((r) => {
      const p = profiles.find((x) => x.profiles_id === r.profiles_id);
      return {
        profiles_id: r.profiles_id,
        interest: r.interest,
        name: p?.name ?? null,
        email: p?.email ?? null,
      };
    });

    setInterestList(ui);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [itemsID]);

  const toggleInterest = async (interest: "interested" | "declined") => {
    if (!itemsID || !currentUserId) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      if (myInterest === interest) {
        const { error } = await supabase
          .from("item_interests")
          .delete()
          .eq("items_id", itemsID)
          .eq("profiles_id", currentUserId);

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        setMyInterest(null);
        await fetchAll();
        return;
      }

      const { error } = await supabase
        .from("item_interests")
        .upsert(
          { items_id: itemsID, profiles_id: currentUserId, interest },
          { onConflict: "items_id,profiles_id" }
        );

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setMyInterest(interest);
      await fetchAll();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="itemPage">
      <div className="itemCard">
    
        <div className="itemTopRow">
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              if (item?.spaces_id) navigate(`/spaces/${item.spaces_id}`);
              else navigate(-1);
            }}
          >
            Tillbaka
          </button>

          <div className="itemTopActions">
            {isItemOwner && item && (
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => navigate(`/items/${item.items_id}/edit`)}
              >
                Redigera
              </button>
            )}
          </div>
        </div>

        {loading && <p className="itemLoading">Laddar...</p>}

        {!loading && errorMessage && (
          <p className="error-message">{errorMessage}</p>
        )}

        {!loading && !errorMessage && item && (
          <>
            <div className="itemHeader">
              <h1 className="itemTitle">{item.name}</h1>

              <div className="itemPills">
                <span className="itemPill">
                 Status: <strong>{STATUS_LABELS[item.status as Status] ?? item.status}</strong>

                </span>

                {item.category && (
                  <span className="itemPill">
                    Kategori: <strong>{item.category}</strong>
                  </span>
                )}
              </div>
            </div>

<div className="itemMediaSingle">
  <div className="itemMediaInner">
    {selectedImage ? (
      <img className="itemHeroImage" src={selectedImage} alt={item.name} />
    ) : (
      <div className="itemImagePlaceholder" aria-label="Ingen bild" />
    )}
  </div>
</div>

            {isMember && (
              <div className="itemInterestRow">
                <button
                  type="button"
                  className={
                    "btn itemPillBtn itemPillBtn--interest" +
                    (myInterest === "interested" ? " itemPillBtn--active" : "")
                  }
                  disabled={loading}
                  aria-pressed={myInterest === "interested"}
                  onClick={() => toggleInterest("interested")}
                >
                  {myInterest === "interested" ? "✓ Intresserad" : "Intresserad"}
                </button>

                <button
                  type="button"
                  className={
                    "btn itemPillBtn itemPillBtn--decline" +
                    (myInterest === "declined" ? " itemPillBtn--active" : "")
                  }
                  disabled={loading}
                  aria-pressed={myInterest === "declined"}
                  onClick={() => toggleInterest("declined")}
                >
                  {myInterest === "declined" ? "✓ Avstår" : "Avstår"}
                </button>
              </div>
            )}

        
            {item.description && (
              <div className="itemSection">
                <h3 className="itemSectionTitle">Beskrivning</h3>
                <p className="itemDescription">{item.description}</p>
              </div>
            )}


            <div className="itemSection">
              <h3 className="itemSectionTitle">Markeringar</h3>

              <div className="itemMarkRow">
                <div className="itemMarkLabel">
                  Intresserade{" "}
                  <span className="itemMarkCount">({interested.length})</span>
                </div>
                <div className="itemMarkValue">
                  {interested.length
                    ? interested.map(formatName).join(", ")
                    : "Inga ännu"}
                </div>
              </div>

              <div className="itemMarkRow">
                <div className="itemMarkLabel">
                  Avstår <span className="itemMarkCount">({declined.length})</span>
                </div>
                <div className="itemMarkValue">
                  {declined.length
                    ? declined.map(formatName).join(", ")
                    : "Inga ännu"}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;
