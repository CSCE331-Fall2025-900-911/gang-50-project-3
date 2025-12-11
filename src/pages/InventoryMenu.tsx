import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import ManagerNavbar from "../components/ManagerNavbar";

const API_URL = "/api";

type Ingredient = {
  ingredient_id: number;
  ingredient_name: string;
  supply_level: number;
  expiration_date: string;
  ingredient_cost: number;
  vendor: string;
  category_id?: number | null;
  ingredient_category_name?: string | null;
};

type IngredientCategory = {
  ingredient_category_id: number;
  ingredient_category_name: string;
};

// Draft type for inline editing (store as strings for inputs)
type IngredientEditDraft = {
  ingredient_name: string;
  supply_level: string;
  expiration_date: string;
  ingredient_cost: string;
  vendor: string;
  category_id: string;
};

export default function UpdateMenu() {
  // --- Add form state (only used for creating new ingredients) ---
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newSupply, setNewSupply] = useState("");
  const [newExpirationDate, setNewExpirationDate] = useState("");
  const [newVendor, setNewVendor] = useState("");
  const [newCategoryId, setNewCategoryId] = useState<string>("");

  // --- Data + loading/error ---
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<IngredientCategory[]>([]);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [error, setError] = useState("");

  // --- Inline edit state ---
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState<IngredientEditDraft | null>(
    null
  );

  // Layout stuff (navbar height)
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerH, setHeaderH] = useState(64);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => setHeaderH(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflowY;
    document.body.style.overflowY = "auto";
    return () => {
      document.body.style.overflowY = prev || "hidden";
    };
  }, []);

  // -------- load all ingredients for the table ----------
  const loadIngredients = async () => {
    try {
      setLoadingIngredients(true);
      setError("");
      const res = await fetch(`${API_URL}/inventorypage/ingredients`);
      if (!res.ok) throw new Error("Failed to load ingredients");
      const data: Ingredient[] = await res.json();

      data.sort((a, b) => a.ingredient_id - b.ingredient_id);
      setIngredients(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load ingredients");
    } finally {
      setLoadingIngredients(false);
    }
  };

  // -------- load ingredient categories for dropdown ----------
  const loadCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/ingredient-categories`);
      if (!res.ok) throw new Error("Failed to load ingredient categories");
      const data: IngredientCategory[] = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load ingredient categories");
    }
  };

  useEffect(() => {
    loadIngredients();
    loadCategories();
  }, []);

  // ---------- Inline editing helpers ----------

  const startEditingRow = (ing: Ingredient) => {
    setEditingId(ing.ingredient_id);
    setEditingDraft({
      ingredient_name: ing.ingredient_name ?? "",
      supply_level:
        ing.supply_level !== null && ing.supply_level !== undefined
          ? String(ing.supply_level)
          : "",
      expiration_date: ing.expiration_date
        ? ing.expiration_date.slice(0, 10)
        : "",
      ingredient_cost:
        ing.ingredient_cost !== null && ing.ingredient_cost !== undefined
          ? String(ing.ingredient_cost)
          : "",
      vendor: ing.vendor ?? "",
      category_id:
        ing.category_id !== null && ing.category_id !== undefined
          ? String(ing.category_id)
          : "",
    });
  };

  const cancelEditingRow = () => {
    setEditingId(null);
    setEditingDraft(null);
  };

  const updateEditingField = <K extends keyof IngredientEditDraft>(
    field: K,
    value: string
  ) => {
    setEditingDraft((prev) =>
      prev ? { ...prev, [field]: value } : prev
    );
  };

  const saveEditingRow = async () => {
    if (editingId == null || !editingDraft) return;

    const nameTrimmed = editingDraft.ingredient_name.trim();
    if (!nameTrimmed) {
      alert("Name is required.");
      return;
    }

    const payload = {
      ingredient_name: nameTrimmed,
      supply_level: editingDraft.supply_level
        ? Number(editingDraft.supply_level)
        : null,
      expiration_date: editingDraft.expiration_date
        ? editingDraft.expiration_date + " 00:00:00"
        : null,
      ingredient_cost: editingDraft.ingredient_cost
        ? Number(editingDraft.ingredient_cost)
        : null,
      vendor: editingDraft.vendor.trim() || null,
      category_id: editingDraft.category_id
        ? Number(editingDraft.category_id)
        : null,
    };

    try {
      const res = await fetch(
        `${API_URL}/inventorypage/ingredients/${editingId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const raw = await res.text();
      if (!res.ok) {
        alert(`Error ${res.status}\n${raw}`);
        return;
      }

      alert("Ingredient updated!");
      await loadIngredients();
      cancelEditingRow();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Something happened -> ${message}`);
    }
  };

  const deleteIngredientInline = async (ingredientId: number) => {
    if (!window.confirm("Delete this ingredient?")) return;

    try {
      const res = await fetch(
        `${API_URL}/inventorypage/deleteingredient/${encodeURIComponent(
          String(ingredientId)
        )}`
      );
      const raw = await res.text();

      if (!res.ok) {
        alert(
          `Error ${res.status}\n${
            raw || "Failed to delete ingredient"
          }`
        );
        return;
      }

      try {
        const data = JSON.parse(raw);
        const stringVersion = JSON.stringify(data, null, 2);
        if (stringVersion === "[]") alert("Ingredient deleted!");
        else alert(stringVersion);
      } catch {
        alert(`Non-JSON response from server:\n${raw}`);
      }

      await loadIngredients();
      if (editingId === ingredientId) cancelEditingRow();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Something happened -> ${message}`);
    }
  };

  // ---------- Add new ingredient ----------

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetName = newName.trim();
    const targetPrice = newPrice.trim();
    const targetSupply = newSupply.trim();
    const targetVendor = newVendor.trim();
    const targetExpirationDate =
      newExpirationDate.trim() &&
      newExpirationDate.trim() + " 00:00:00";
    const targetCategoryId =
      newCategoryId.trim() !== ""
        ? Number(newCategoryId.trim())
        : null;

    if (
      !targetName ||
      !targetPrice ||
      !targetSupply ||
      !targetVendor ||
      !targetExpirationDate
    ) {
      alert("Verify all information is valid.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/inventorypage/ingredients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredient_name: targetName,
          supply_level: Number(targetSupply),
          expiration_date: targetExpirationDate,
          ingredient_cost: Number(targetPrice),
          vendor: targetVendor,
          category_id: targetCategoryId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(
          `Error ${res.status}\n${
            data.error || "Failed to create ingredient"
          }`
        );
        return;
      }

      alert(
        `Ingredient created! New ID: ${data.ingredient_id ?? "(unknown)"}`
      );
      clearAddForm();
      await loadIngredients();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Something happened -> ${message}`);
    }
  };

  const clearAddForm = () => {
    setNewName("");
    setNewPrice("");
    setNewSupply("");
    setNewExpirationDate("");
    setNewVendor("");
    setNewCategoryId("");
  };

  return (
    <div className="update-page">
      <nav ref={headerRef as any}>
        <ManagerNavbar />
      </nav>

      <main className="update-main" style={{ paddingTop: headerH }}>
        {error && <div className="employee-error-banner">{error}</div>}

        <section className="update-card-big">
          {/* ---------- TABLE ---------- */}
          <div>
            <h2>Ingredient List</h2>
          </div>

          <div className="ingredient-table-wrapper">
            <table className="update-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Supply</th>
                  <th>Expiration</th>
                  <th>Cost</th>
                  <th>Vendor</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {ingredients.length === 0 && !loadingIngredients ? (
                  <tr>
                    <td colSpan={8} className="update-empty">
                      No ingredients found.
                    </td>
                  </tr>
                ) : (
                  ingredients.map((ing) => {
                    const isEditing = editingId === ing.ingredient_id;

                    return (
                      <tr key={ing.ingredient_id}>
                        <td>{ing.ingredient_id}</td>

                        {/* Name */}
                        <td>
                          {isEditing && editingDraft ? (
                            <input
                              className="update-input"
                              value={editingDraft.ingredient_name}
                              onChange={(e) =>
                                updateEditingField(
                                  "ingredient_name",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            ing.ingredient_name
                          )}
                        </td>

                        {/* Category */}
                        <td>
                          {isEditing && editingDraft ? (
                            <select
                              className="update-input"
                              value={editingDraft.category_id}
                              onChange={(e) =>
                                updateEditingField(
                                  "category_id",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">(None)</option>
                              {categories.map((cat) => (
                                <option
                                  key={cat.ingredient_category_id}
                                  value={cat.ingredient_category_id}
                                >
                                  {cat.ingredient_category_name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            ing.ingredient_category_name ??
                            (ing.category_id
                              ? `#${ing.category_id}`
                              : "")
                          )}
                        </td>

                        {/* Supply */}
                        <td>
                          {isEditing && editingDraft ? (
                            <input
                              className="update-input"
                              value={editingDraft.supply_level}
                              onChange={(e) =>
                                updateEditingField(
                                  "supply_level",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            ing.supply_level
                          )}
                        </td>

                        {/* Expiration */}
                        <td>
                          {isEditing && editingDraft ? (
                            <input
                              className="update-input"
                              placeholder="YYYY-MM-DD"
                              value={editingDraft.expiration_date}
                              onChange={(e) =>
                                updateEditingField(
                                  "expiration_date",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            ing.expiration_date?.slice(0, 10) || ""
                          )}
                        </td>

                        {/* Cost */}
                        <td>
                          {isEditing && editingDraft ? (
                            <input
                              className="update-input"
                              value={editingDraft.ingredient_cost}
                              onChange={(e) =>
                                updateEditingField(
                                  "ingredient_cost",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            ing.ingredient_cost
                          )}
                        </td>

                        {/* Vendor */}
                        <td>
                          {isEditing && editingDraft ? (
                            <input
                              className="update-input"
                              value={editingDraft.vendor}
                              onChange={(e) =>
                                updateEditingField(
                                  "vendor",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            ing.vendor
                          )}
                        </td>

                        {/* Actions */}
                        <td>
                          {isEditing ? (
                            <div className="update-actions-row">
                              <button
                                type="button"
                                className="btn-update"
                                onClick={saveEditingRow}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="btn-update btn-update--outline"
                                onClick={cancelEditingRow}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="btn-update btn-update--danger"
                                onClick={() =>
                                  deleteIngredientInline(
                                    ing.ingredient_id
                                  )
                                }
                              >
                                Delete
                              </button>
                            </div>
                          ) : (
                            <div className="update-actions-row">
                              <button
                                type="button"
                                className="btn-update btn-update--outline"
                                onClick={() => startEditingRow(ing)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn-update btn-update--danger"
                                onClick={() =>
                                  deleteIngredientInline(
                                    ing.ingredient_id
                                  )
                                }
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ---------- ADD NEW INGREDIENT FORM ---------- */}
          <h2 style={{ marginTop: "1.2rem" }}>Add New Ingredient</h2>

          <form
            onSubmit={handleAddIngredient}
            className="update-form-grid"
          >
            <div className="update-field">
              <label>Name</label>
              <input
                className="update-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="update-field">
              <label>Supply</label>
              <input
                className="update-input"
                value={newSupply}
                onChange={(e) => setNewSupply(e.target.value)}
              />
            </div>

            <div className="update-field">
              <label>Expiration Date</label>
              <input
                className="update-input"
                placeholder="YYYY-MM-DD"
                value={newExpirationDate}
                onChange={(e) =>
                  setNewExpirationDate(e.target.value)
                }
              />
            </div>

            <div className="update-field">
              <label>Cost</label>
              <input
                className="update-input"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
            </div>

            <div className="update-field">
              <label>Vendor</label>
              <input
                className="update-input"
                value={newVendor}
                onChange={(e) => setNewVendor(e.target.value)}
              />
            </div>

            <div className="update-field">
              <label>Category</label>
              <select
                className="update-input"
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
              >
                <option value="">(None)</option>
                {categories.map((cat) => (
                  <option
                    key={cat.ingredient_category_id}
                    value={cat.ingredient_category_id}
                  >
                    {cat.ingredient_category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="update-actions-row">
              <button type="submit" className="btn-update">
                Add
              </button>

              <button
                type="button"
                onClick={clearAddForm}
                className="btn-update btn-update--outline"
                style={{ marginLeft: "auto" }}
              >
                Clear
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
