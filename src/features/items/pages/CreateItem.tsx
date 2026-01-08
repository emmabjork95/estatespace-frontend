import { type FormEvent, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../shared/lib/supabaseClient";
import { STATUS_LABELS, STATUS_OPTIONS, type Status } from "../ItemsTypes";
import "../styles/CreateItem.css";
import "../../../shared/components/ui/Buttons.css";

const CreateItem = () => {
  const navigate = useNavigate();
  const { spacesID } = useParams();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<Status>("Unsorted");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const removeSelectedFile = () => {
    setFile(null);
    fileInputRef.current && (fileInputRef.current.value = "");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

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
      setErrorMessage("Du måste vara inloggad för att skapa ett item.");
      return;
    }

    let imageUrl: string | null = null;

    if (file) {
      const fileExt = file.name.split(".").pop();
      const filePath = `${spacesID}/${crypto.randomUUID()}.${fileExt}`;

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
    }

    const { data, error } = await supabase
      .from("items")
      .insert({
        spaces_id: spacesID,
        profiles_id: user.id,
        name,
        category: category || null,
        status,
        image_url: imageUrl,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (data) 
      navigate(`/spaces/${spacesID}`);
  };

  return (
    <div className="createItemPage">
      <div className="createCard">
        <div className="createItemHeader">
          <h2>Skapa föremål</h2>
        </div>

        {errorMessage && (
          <div className="Alert Alert--error">
            <span className="AlertText">{errorMessage}</span>
            <button
              className="AlertClose"
              type="button"
              onClick={() => setErrorMessage(null)}
              aria-label="Stäng meddelande"
            >
              ✕
            </button>
          </div>
        )}

        <form className="createItemForm" onSubmit={handleSubmit}>
          <label className="createItemField">
            <span>Namn på föremål</span>
            <input
              className="createItemInput"
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="t.ex. sängbord"
              disabled={loading}
            />
          </label>

          <label className="createItemField">
            <span>Kategori</span>
            <input
              className="createItemInput"
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="t.ex. Möbler"
              disabled={loading}
            />
          </label>

          <label className="createItemField">
            <span>Status</span>
            <select
              className="createItemInput createItemSelect"
              id="status"
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

          <label className="createItemField">
            <span>Bild</span>
            <input
              className="createItemFile"
              id="image"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              disabled={loading}
            />

            {file && (
              <div className="createItemFileRow">
                <span className="createItemFileName">{file.name}</span>
                <button
                  type="button"
                  className="btn btn-ghost createItemRemoveFileBtn"
                  onClick={removeSelectedFile}
                  aria-label="Ta bort vald bild"
                  disabled={loading}
                >
                  Ta bort
                </button>
              </div>
            )}
          </label>

          <div className="createItemActions">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Skapar..." : "Skapa"}
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

export default CreateItem;