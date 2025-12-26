import { type FormEvent } from "react";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import { STATUS_OPTIONS, type Status } from "../ItemsTypes";


const CreateItem = () => {
  const navigate = useNavigate();
  const { spacesID } = useParams();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<Status>("Unsorted");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        .upload(filePath, file, { upsert: false,   contentType: file.type || "image/jpeg",
    cacheControl: "3600", });

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

    if (data) {
      navigate(`/spaces/${spacesID}`);
    }
  };

  return (
    <div
      className="create-item-page"
    >
      <div className="create-item-card">
        <h1 className="create-item-title">Create new item</h1>

        <form onSubmit={handleSubmit} className="create-item-form">
          <div className="field">
            <label htmlFor="name">Item name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Coffee table"
            />
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Furniture"
            />
          </div>

          <div className="field">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="image">Image</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create item"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateItem;
