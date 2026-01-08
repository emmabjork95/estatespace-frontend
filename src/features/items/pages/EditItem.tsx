import { type FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../shared/lib/supabaseClient";
import { STATUS_LABELS, STATUS_OPTIONS, type Item, type Status } from "../ItemsTypes";
import "../styles/EditItem.css";
import "../../../shared/components/ui/Buttons.css";

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

  const clearError = () => setErrorMessage(null);

  const removeSelectedFile = () => {
    setFile(null);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const markRemoveExistingImage = () => {
    const ok = window.confirm("Är du säker på att du vill ta bort bilden?");
    if (!ok) return;

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
      clearError();
      setLoading(true);

      try {
        if (!itemsID) {
          setErrorMessage("Saknar item-id i URL:en.");
          return;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
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

        if (error || !data) {
          setErrorMessage(error?.message ?? "Kunde inte hämta item.");
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

        const nextStatus: Status =
          STATUS_OPTIONS.includes(data.status as Status) ? (data.status as Status) : "Unsorted";
        setStatus(nextStatus);

        setRemoveImage(false);
        removeSelectedFile();
      } finally {
        setLoading(false);
      }
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
    clearError();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Namn får inte vara tomt.");
      return;
    }

    if (!itemsID) {
      setErrorMessage("Saknar item-id i URL:en.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("Du måste vara inloggad.");
        return;
      }

      if (!item) {
        setErrorMessage("Kunde inte läsa item-data.");
        return;
      }

      if (item.profiles_id !== user.id) {
        setErrorMessage("Du har inte behörighet att redigera detta item.");
        return;
      }

      const oldImageUrl = item.image_url ?? null;
      let imageUrl: string | null = removeImage ? null : oldImageUrl;

      if (removeImage && oldImageUrl) {
        const oldPath = extractStoragePathFromPublicUrl(oldImageUrl);
        if (oldPath) {
          await supabase.storage.from("item-images").remove([oldPath]);
        }
      }

      if (file) {
        const fileExt = file.name.split(".").pop() || "jpg";
        const filePath = `${item.spaces_id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("item-images")
          .upload(filePath, file, {
            upsert: false,
            contentType: file.type || "image/jpeg",
            cacheControl: "3600",
          });

        if (uploadError) {
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

      const nextDescription = description.trim() || null;
      const nextCategory = category.trim() || null;

      const { error } = await supabase
        .from("items")
        .update({
          name: trimmedName,
          description: nextDescription,
          category: nextCategory,
          status,
          image_url: imageUrl,
        })
        .eq("items_id", itemsID)
        .eq("profiles_id", user.id);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setItem((prev) =>
        prev
          ? {
              ...prev,
              name: trimmedName,
              description: nextDescription,
              category: nextCategory,
              status,
              image_url: imageUrl,
            }
          : prev
      );

      setRemoveImage(false);
      removeSelectedFile();

      navigate(`/items/${itemsID}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm(
      "Är du säker på att du vill radera detta item? Detta går inte att ångra."
    );
    if (!ok) return;

    clearError();

    if (!itemsID) {
      setErrorMessage("Saknar item-id i URL:en.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage("Du måste vara inloggad.");
        return;
      }

      if (!item) {
        setErrorMessage("Kunde inte läsa item-data.");
        return;
      }

      const { error } = await supabase
        .from("items")
        .delete()
        .eq("items_id", itemsID)
        .eq("profiles_id", user.id);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      navigate(`/spaces/${item.spaces_id}`);
    } finally {
      setLoading(false);
    }
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