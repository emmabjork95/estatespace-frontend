import { type FormEvent, useEffect } from "react";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import { STATUS_OPTIONS, type Item, type Status } from "../ItemsTypes";


const EditItem = () => {
  const navigate = useNavigate();
  const { itemsID } = useParams();

  const [item, setItem] = useState<Item | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<Status>("Unsorted");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1) Hämta item och fyll formuläret
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
        setErrorMessage("Du måste vara inloggad för att redigera ett item.");
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

      // (valfritt men bra) dubbelkolla att du äger itemet
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
    };

    fetchItem();
  }, [itemsID]);

  // 2) Spara ändringar
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
      setErrorMessage("Du måste vara inloggad för att spara ändringar.");
      return;
    }

    // Uppdatera
    const { error } = await supabase
      .from("items")
      .update({
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        category: category.trim() ? category.trim() : null,
        status,
      })
      .eq("items_id", itemsID)
      .eq("profiles_id", user.id); // extra skydd

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    // Tillbaka till item detail
    navigate(`/items/${itemsID}`);
  };

  return (
    <div
      className="edit-item-page"
    >
      <div className="edit-item-card">
        <h1 className="edit-item-title">Edit item</h1>

        {loading && <p>Loading...</p>}

        {!loading && errorMessage && (
          <p className="error-message">{errorMessage}</p>
        )}

        {!loading && !errorMessage && item && (
          <>
            <form onSubmit={handleSubmit} className="edit-item-form">
              <div className="field">
                <label htmlFor="name">Item name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="category">Category</label>
                <input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Optional"
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
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Optional"
                />
              </div>

              <div className="edit-item-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => navigate(`/items/${itemsID}`)}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button className="primary-btn" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default EditItem;