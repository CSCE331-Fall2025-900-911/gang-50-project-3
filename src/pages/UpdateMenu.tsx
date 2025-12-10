import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import ManagerNavbar from "../components/ManagerNavbar";

const API_URL = "/api";

type Item = {
  item_id: number;
  item_name: string;
  item_cost: number;
  in_stock: boolean;
  size_options: string | null;
  photo: string | null;
  seasonal_item: boolean;
  seasonal_item_beginning_time: string | null;
  seasonal_item_ending_time: string | null;
  category_id: number | null;
  category_name?: string | null;
};

type ItemCategory = {
  category_id: number;
  name: string;
};

type Ingredient = {
  ingredient_id: number;
  ingredient_name: string;
};

export default function UpdateMenu() {
  // table + status
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState("");

  // NEW: which row is currently selected for editing
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  // form state
  const [itemNewName, setItemNewName] = useState("");
  const [itemNewID, setItemNewID] = useState(""); // still keep this for display if needed
  const [itemNewPrice, setItemNewPrice] = useState("");
  const [itemNewCategory, setItemNewCategory] = useState("");
  const [itemPhotoPath, setItemPhotoPath] = useState("");

  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<number[]>(
    []
  );

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

  // ----------------- data loaders -----------------

  const loadItems = async () => {
    try {
      setLoadingItems(true);
      setError("");
      const res = await fetch(`${API_URL}/admin/items`);
      if (!res.ok) throw new Error("Failed to load items");
      const data: Item[] = await res.json();
      data.sort((a, b) => a.item_id - b.item_id);
      setItems(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load items");
    } finally {
      setLoadingItems(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (!res.ok) throw new Error("Failed to load categories");
      const data: ItemCategory[] = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories");
    }
  };

  const loadAllIngredients = async () => {
    try {
      const res = await fetch(`${API_URL}/inventorypage/ingredients`);
      if (!res.ok) throw new Error("Failed to load ingredients");
      const data = await res.json();

      const mapped: Ingredient[] = data.map((row: any) => ({
        ingredient_id: row.ingredient_id,
        ingredient_name: row.ingredient_name,
      }));

      mapped.sort((a, b) => a.ingredient_name.localeCompare(b.ingredient_name));
      setAllIngredients(mapped);
    } catch (err) {
      console.error(err);
      setError("Failed to load ingredients");
    }
  };

  useEffect(() => {
    loadItems();
    loadCategories();
    loadAllIngredients();
  }, []);

  // ----------------- helpers -----------------

  const getNextItemId = () => {
    if (!items.length) return 1;
    const maxId = Math.max(...items.map((i) => i.item_id));
    return maxId + 1;
  };

  const clearForm = () => {
    setItemNewName("");
    setItemNewID("");
    setItemNewPrice("");
    setItemNewCategory("");
    setItemPhotoPath("");
    setSelectedIngredientIds([]);
    setSelectedItemId(null); // clear selection as well
  };

  const handleRowSelect = (item: Item) => {
    setSelectedItemId(item.item_id);          // <-- key: track which item is selected
    setItemNewID(String(item.item_id));
    setItemNewName(item.item_name);
    setItemNewPrice(String(item.item_cost));
    setItemNewCategory(
      item.category_id != null ? String(item.category_id) : ""
    );
    setItemPhotoPath(item.photo || "");
    loadItemIngredients(item.item_id);
  };

  const handleIngredientToggle = (id: number, checked: boolean) => {
    setSelectedIngredientIds((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      } else {
        return prev.filter((x) => x !== id);
      }
    });
  };

  const loadItemIngredients = async (itemId: number) => {
    try {
      const res = await fetch(`${API_URL}/items/${itemId}/ingredients`);
      if (!res.ok) throw new Error("Failed to load item ingredients");
      const data = await res.json();
      setSelectedIngredientIds(data.map((row: any) => row.ingredient_id));
    } catch (err) {
      console.error(err);
      alert("Failed to load item ingredients.");
    }
  };

  const saveItemIngredients = async (itemId: number) => {
    try {
      const res = await fetch(`${API_URL}/items/${itemId}/ingredients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredient_ids: selectedIngredientIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(
          `Ingredient update error: ${
            data.error || "Failed to update item ingredients"
          }`
        );
      }
    } catch (err: any) {
      alert(`Ingredient update error: ${err?.message ?? String(err)}`);
    }
  };

  // ----------------- add / update / delete -----------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitter = (e.nativeEvent as any).submitter;
    const action = submitter?.value as "add" | "update";

    let targetName = itemNewName.trim();
    let targetPrice = itemNewPrice.trim();
    let targetCategory = itemNewCategory.trim();

    // ---------- ADD ----------
    if (action === "add") {
      if (!targetName || !targetPrice || !targetCategory) {
        alert("Please fill out Name, Category, and Cost.");
        return;
      }

      const priceNum = Number(targetPrice);
      if (!Number.isFinite(priceNum) || priceNum < 0) {
        alert("Price must be a non-negative number.");
        return;
      }

      // backend still expects all params, so we send sensible defaults
      const targetSizes= "Regular";
      const targetPhoto=  "/images/default-drink.png";


      const targetAvailability= true;
      const targetSeasonal= false;

      const targetSeasonalStart= "1970-01-01 00:00:01";
      const targetSeasonalEnd= "1970-01-01 00:00:01";

      const nextId = getNextItemId();
      const targetID = String(nextId);

      try {
        const res = await fetch(
          `${API_URL}/updatemenu/createnewitem/${encodeURIComponent(
            targetName
          )}/${encodeURIComponent(targetID)}/${encodeURIComponent(
            targetPrice
          )}/${encodeURIComponent(targetAvailability)}/${encodeURIComponent(
            targetSizes
          )}/${encodeURIComponent(targetPhoto)}/${encodeURIComponent(
            targetSeasonal
          )}/${encodeURIComponent(
            targetSeasonalStart
          )}/${encodeURIComponent(
            targetSeasonalEnd
          )}/${encodeURIComponent(targetCategory)}`
        );

        const raw = await res.text();

        if (!res.ok) {
          alert(`Error ${res.status}\n${raw || "Failed to create item"}`);
          return;
        }

        try {
          alert("Item created!");
        } catch {
          alert(`Non-JSON response from server:\n${raw}`);
        }

        await loadItems();
        await saveItemIngredients(nextId); // use the ID we passed to backend
        clearForm();
      } catch (err: any) {
        alert(`Something happened -> ${err?.message ?? String(err)}`);
      }
    }

    // ---------- UPDATE ----------
    if (action === "update") {
      // use selectedItemId as the source of truth
      if (selectedItemId == null) {
        alert("Select an item from the table to edit first.");
        return;
      }
      const targetID = String(selectedItemId);

      // get the existing item from our items list instead of a separate fetch
      const existing = items.find((i) => i.item_id === selectedItemId);
      if (!existing) {
        alert("Selected item not found in local list.");
        return;
      }

      if (!targetName) targetName = existing.item_name;
      if (!targetPrice) targetPrice = String(existing.item_cost);
      if (!targetCategory)
        targetCategory =
          existing.category_id != null ? String(existing.category_id) : "";

      const priceNum = Number(targetPrice);
      if (!Number.isFinite(priceNum) || priceNum < 0) {
        alert("Price must be a non-negative number.");
        return;
      }

      // preserve "hidden" fields from existing item
      const targetSizes = existing.size_options || "Regular";
      const targetPhoto = existing.photo || "/images/default-drink.png";
      const targetAvailability = existing.in_stock;
      const targetSeasonal = existing.seasonal_item;
      const targetSeasonalStart =
        existing.seasonal_item_beginning_time || "1970-01-01 00:00:01";
      const targetSeasonalEnd =
        existing.seasonal_item_ending_time || "1970-01-01 00:00:01";

      try {
        const res = await fetch(
          `${API_URL}/updatemenu/updateitem/${encodeURIComponent(
            targetName
          )}/${encodeURIComponent(targetID)}/${encodeURIComponent(
            targetPrice
          )}/${encodeURIComponent(
            targetAvailability
          )}/${encodeURIComponent(targetSizes)}/${encodeURIComponent(
            targetPhoto
          )}/${encodeURIComponent(targetSeasonal)}/${encodeURIComponent(
            targetSeasonalStart
          )}/${encodeURIComponent(
            targetSeasonalEnd
          )}/${encodeURIComponent(targetCategory)}`
        );
        const raw = await res.text();

        if (!res.ok) {
          alert(`Error ${res.status}\n${raw || "Failed to update item"}`);
          return;
        }

        try {
          alert("Item updated!");
        } catch {
          alert(`Non-JSON response from server:\n${raw}`);
        }

        await loadItems();
        await saveItemIngredients(selectedItemId); // <-- always uses selected row's ID
      } catch (err: any) {
        alert(`Something happened -> ${err?.message ?? String(err)}`);
      }
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      const res = await fetch(
        `${API_URL}/updatemenu/deleteitem/${encodeURIComponent(id)}`
      );
      const raw = await res.text();

      if (!res.ok) {
        alert(`Error ${res.status}\n${raw || "Failed to delete item"}`);
        return;
      }

      alert("Item deleted!");


      await loadItems();

      if (itemNewID === String(id)) clearForm();
    } catch (err: any) {
      alert(`Something happened -> ${err?.message ?? String(err)}`);
    }
  };

  // ----------------- UI -----------------

  return (
    <div className="menu-update-page">
      <nav ref={headerRef as any}>
        <ManagerNavbar />
      </nav>

      <main className="menu-update-main" style={{ paddingTop: headerH }}>
        {error && <div className="employee-error-banner">{error}</div>}

        <section className="menu-admin-card">
          <div className="update-table-header-row">
            <h2>Menu Items</h2>
          </div>

          <div className="menu-admin-content">
            <div className="menu-admin-left">
              <div className="update-table-wrapper">
                <table className="update-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Cost</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 && !loadingItems ? (
                      <tr>
                        <td colSpan={5} className="update-empty">
                          No items found.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr
                          key={item.item_id}
                          className={
                            item.item_id === selectedItemId
                              ? "update-row--selected"
                              : ""
                          }
                        >
                          <td>{item.item_id}</td>
                          <td>{item.item_name}</td>
                          <td>{item.category_name || ""}</td>
                          <td>{item.item_cost}</td>
                          <td className="update-actions-cell">
                            <button
                              className="btn-update btn-update--outline"
                              onClick={() => handleRowSelect(item)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-update btn-update--danger"
                              onClick={() => handleDeleteItem(item.item_id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="menu-admin-right">
              <div className="menu-photo-box">
                {itemPhotoPath ? (
                  <img
                    src={itemPhotoPath}
                    alt={itemNewName || "Item photo"}
                  />
                ) : (
                  <span>photo</span>
                )}
              </div>

              <form onSubmit={handleSubmit} className="menu-form">
                <div className="menu-field">
                  <input
                    className="menu-input"
                    placeholder="Name"
                    value={itemNewName}
                    onChange={(e) => setItemNewName(e.target.value)}
                  />
                </div>

                <div className="menu-field">
                  <select
                    className="menu-input"
                    value={itemNewCategory}
                    onChange={(e) => setItemNewCategory(e.target.value)}
                  >
                    <option value="">Category</option>
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="menu-field">
                  <input
                    className="menu-input"
                    placeholder="Cost"
                    value={itemNewPrice}
                    onChange={(e) => setItemNewPrice(e.target.value)}
                  />
                </div>

                <div className="menu-field">
                  <div className="menu-ingredients-label">Ingredients</div>
                  <div className="menu-ingredients-list">
                    {allIngredients.map((ing) => (
                      <label
                        key={ing.ingredient_id}
                        className="menu-ingredient-row"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIngredientIds.includes(
                            ing.ingredient_id
                          )}
                          onChange={(e) =>
                            handleIngredientToggle(
                              ing.ingredient_id,
                              e.target.checked
                            )
                          }
                        />
                        <span>{ing.ingredient_name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="menu-form-actions">
                  <button
                    type="submit"
                    value="add"
                    className="btn-menu-primary"
                  >
                    Add
                  </button>
                  <button
                    type="submit"
                    value="update"
                    className="btn-menu-secondary"
                    disabled={selectedItemId == null}
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    className="btn-menu-secondary"
                    onClick={clearForm}
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
