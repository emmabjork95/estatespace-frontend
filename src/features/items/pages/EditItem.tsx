import { type FormEvent, useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import { STATUS_OPTIONS, STATUS_LABELS, type Item, type Status } from "../ItemsTypes";
import "../styles/EditItem.css";
import "../../../styles/Buttons.css";



const EditItem = () => {
  const navigate = useNavigate();
  const { itemsID } = useParams();

  const [item, setItem] = useState<Item | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<Status>("Unsorted");


  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const removeSelectedFile = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const markRemoveExistingImage = () => {
    const confirmed = window.confirm(
    "Är du säker på att du vill ta bort bilden?"
  );

  if (!confirmed) return;

  setRemoveImage(true);
  removeSelectedFile();
};


  const extractStoragePathFromPublicUrl = (publicUrl: string) => {
    const marker = "/storage/v1/object/public/item-images/";
    try {
      const url = new URL(publicUrl);
      const idx = url.pathname.indexOf(marker);
      if (idx === -1) return null;
      const path = url.pathname.slice(idx + marker.length);
      return path || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchItem = async () => {
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
        setErrorMessage("Du måste vara inloggad.");
        return;
      }

      const { data, error } = await supabase
        .from("items")
        .select(
          "items_id, spaces_id, profiles_id, name, description, category, status, image_url"
        )
        .eq("items_id", itemsID)
        .single();

      setLoading(false);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.profiles_id !== user.id) {
        setErrorMessage("Du har inte behörighet att redigera detta item.");
        return;
      }

      setItem(data);
      setName(data.name ?? "");
      setDescription(data.description ?? "");
      setCategory(data.category ?? "");

      const validStatus = STATUS_OPTIONS.includes(data.status as Status)
        ? (data.status as Status)
        : "Unsorted";
      setStatus(validStatus);

      setRemoveImage(false);
      removeSelectedFile();
    };

    fetchItem();

  }, [itemsID]);


  useEffect(() => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
      setErrorMessage("Du måste vara inloggad.");
      return;
    }

    const { data: currentItem, error: currentError } = await supabase
      .from("items")
      .select("items_id, spaces_id, profiles_id, image_url")
      .eq("items_id", itemsID)
      .single();

    if (currentError || !currentItem) {
      setLoading(false);
      setErrorMessage(currentError?.message ?? "Kunde inte hämta item.");
      return;
    }

    if (currentItem.profiles_id !== user.id) {
      setLoading(false);
      setErrorMessage("Du har inte behörighet att redigera detta item.");
      return;
    }

    const oldImageUrl = (currentItem.image_url as string | null) ?? null;


    let imageUrl: string | null = removeImage ? null : oldImageUrl;


    if (removeImage && oldImageUrl) {
      const oldPath = extractStoragePathFromPublicUrl(oldImageUrl);
      if (oldPath) {
    
        await supabase.storage.from("item-images").remove([oldPath]);
      }
    }


    if (file) {
      const fileExt = file.name.split(".").pop() || "jpg";
      const filePath = `${currentItem.spaces_id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type || "image/jpeg",
          cacheControl: "3600",
        });

      if (uploadError) {
        setLoading(false);
        setErrorMessage(uploadError.message);
        return;
      }

      const { data: publicData } = supabase.storage
        .from("item-images")
        .getPublicUrl(filePath);

      imageUrl = publicData.publicUrl;


      if (oldImageUrl) {
        const oldPath = extractStoragePathFromPublicUrl(oldImageUrl);
        if (oldPath) {
          await supabase.storage.from("item-images").remove([oldPath]);
        }
      }
    }


    const { error } = await supabase
      .from("items")
      .update({
        name: name.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        status,
        image_url: imageUrl,
      })
      .eq("items_id", itemsID)
      .eq("profiles_id", user.id);

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setRemoveImage(false);
    removeSelectedFile();

    navigate(`/items/${itemsID}`);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Är du säker på att du vill radera detta item? Detta går inte att ångra."
    );
    if (!confirmDelete) return;

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
      setErrorMessage("Du måste vara inloggad.");
      return;
    }

    const { error } = await supabase
      .from("items")
      .delete()
      .eq("items_id", itemsID)
      .eq("profiles_id", user.id);

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate(`/spaces/${item?.spaces_id}`);
  };

  return (
    <div className="editItemPage">
      <div className="editItemCard">
        <div className="editItemTopRow">
          <button className="btn btn-ghost" type="button" onClick={() => navigate(-1)}>
            Tillbaka
          </button>
        </div>

        <div className="editItemHeader">
          <h2>Redigera föremål</h2>
         
        </div>

          <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={loading}
              >
                Ta bort föremål
              </button>

        {loading && <p className="editItemLoading">Laddar…</p>}

        {!loading && errorMessage && (
          <div className="editItemAlert editItemAlert--error">
            <span className="editItemAlertText">{errorMessage}</span>
            <button
              className="editItemAlertClose"
              type="button"
              onClick={() => setErrorMessage(null)}
              aria-label="Stäng meddelande"
            >
              ✕
            </button>
          </div>
        )}

        {!loading && !errorMessage && item && (
          <form onSubmit={handleSubmit} className="editItemForm">
            <label className="editItemField">
              <span>Namn</span>
              <input
                className="editItemInput"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </label>

            <label className="editItemField">
              <span>Kategori</span>
              <input
                className="editItemInput"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Valfritt"
                disabled={loading}
              />
            </label>

            <label className="editItemField">
              <span>Status</span>
              <select
                className="editItemInput editItemSelect"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                disabled={loading}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>

    
            </label>

            <label className="editItemField">
              <span>Beskrivning</span>
              <textarea
                className="editItemInput editItemTextarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Valfritt"
                disabled={loading}
              />
            </label>


            <div className="editItemField">
              <span>Bild</span>

              <div className="editItemImageBlock">
                <div className="editItemImagePreview">

                  {previewUrl ? (
                    <div className="editItemImageWrap">
                      <img src={previewUrl} alt="Ny vald bild" />
                      <div className="editItemImageOverlay" />
                      <button
                        type="button"
                        className="editItemImageRemoveBtn"
                        onClick={removeSelectedFile}
                        aria-label="Ta bort vald bild"
                        disabled={loading}
                      >
                        ✕
                      </button>
                    </div>
                  ) : removeImage ? (
                    <div className="editItemImagePlaceholder" aria-label="Ingen bild" />
                  ) : item.image_url ? (
                    <div className="editItemImageWrap">
                      <img src={item.image_url} alt={item.name} />
                      <div className="editItemImageOverlay" />
                      <button
                        type="button"
                        className="editItemImageRemoveBtn"
                        onClick={markRemoveExistingImage}
                        aria-label="Ta bort bild"
                        disabled={loading}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="editItemImagePlaceholder" aria-label="Ingen bild" />
                  )}
                </div>

                <div className="editItemImageActions">
                  <input
                    className="editItemFile"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => {
                      setFile(e.target.files?.[0] ?? null);
                      setRemoveImage(false);
                    }}
                    disabled={loading}
                  />

                 

                  
                </div>
              </div>
            </div>

            <div className="editItemActions">
             <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Sparar..." : "Spara ändringar"}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(`/items/${itemsID}`)}
                disabled={loading}
              >
                Avbryt
              </button>

             
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditItem;
