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

export default function UpdateMenu() {
  const [viewData, setViewData] = useState("");
  const [ingredientNewName, setIngredientNewName] = useState("");
  const [ingredientNewID, setIngredientNewID] = useState("");
  const [ingredientNewPrice, setIngredientNewPrice] = useState("");
  const [ingredientSupply, setIngredientSupply] = useState("");
  const [ingredientExpirationDate, setIngredientExpirationDate] =
    useState("");
  const [ingredientVendor, setIngredientVendor] = useState("");
  const [ingredientCategoryId, setIngredientCategoryId] = useState<string>("");

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<IngredientCategory[]>([]);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [error, setError] = useState("");

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

  // when user clicks "Load" in table, prefill the form
  const handleRowSelect = (ing: Ingredient) => {
    setIngredientNewID(String(ing.ingredient_id ?? ""));
    setIngredientNewName(ing.ingredient_name ?? "");
    setIngredientSupply(
      ing.supply_level !== null && ing.supply_level !== undefined
        ? String(ing.supply_level)
        : ""
    );
    setIngredientExpirationDate(
      ing.expiration_date ? ing.expiration_date.slice(0, 10) : ""
    );
    setIngredientNewPrice(
      ing.ingredient_cost !== null && ing.ingredient_cost !== undefined
        ? String(ing.ingredient_cost)
        : ""
    );
    setIngredientVendor(ing.vendor ?? "");
    setIngredientCategoryId(
      ing.category_id !== null && ing.category_id !== undefined
        ? String(ing.category_id)
        : ""
    );
    setViewData(`Loaded ingredient #${ing.ingredient_id} into the form.`);
  };

  const handleAddIngredient = async (e?: React.FormEvent) => {
    e?.preventDefault();

    let targetName = ingredientNewName.trim();
    let targetID = ingredientNewID.trim(); // used only for update/delete
    let targetPrice = ingredientNewPrice.trim();
    let targetSupply = ingredientSupply.trim();
    let targetVendor = ingredientVendor.trim();
    let targetExpirationDate =
      ingredientExpirationDate.trim() &&
      ingredientExpirationDate.trim() + " 00:00:00";
    let targetCategoryId =
      ingredientCategoryId.trim() !== ""
        ? Number(ingredientCategoryId.trim())
        : null;

    const submitter = (e?.nativeEvent as any).submitter;
    const action = submitter?.value; // "add" | "update" | "delete"

    // ---------- ADD: no ingredient_id needed ----------
    if (action === "add") {
      if (
        !targetName ||
        !targetPrice ||
        !targetSupply ||
        !targetVendor ||
        !targetExpirationDate
      ) {
        setViewData("Verify all information is valid.");
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
          setViewData(
            `Error ${res.status}\n${
              data.error || "Failed to create ingredient"
            }`
          );
          return;
        }

        alert(`Ingredient created! New ID: ${data.ingredient_id ?? "(unknown)"}`);
        await loadIngredients();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setViewData(`Something happened -> ${message}`);
      }
    }

    // ---------- UPDATE ----------
    if (action === "update") {
        if (!targetName) {
            setViewData("Verify all information is valid (Name required).");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/inventorypage/ingredient`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ingredient_name: targetName,
                    supply_level: targetSupply ? Number(targetSupply) : null,
                    expiration_date: targetExpirationDate || null,
                    ingredient_cost: targetPrice ? Number(targetPrice) : null,
                    vendor: targetVendor || null,
                    category_id: targetCategoryId,
                }),
            });

            const raw = await res.text();

            if (!res.ok) {
                setViewData(`Error ${res.status}\n${raw}`);
                return;
            } 

            alert("Ingredient updated!");
            await loadIngredients();

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setViewData(`Something happened -> ${message}`);
        }
    }


    // ---------- DELETE ----------
    if (action === "delete") {
      if (!targetID) {
        setViewData("Verify all information is valid (ID required).");
        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/inventorypage/deleteingredient/${encodeURIComponent(
            targetID
          )}`
        );
        const raw = await res.text();

        if (!res.ok) {
          setViewData(
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
          await loadIngredients();
        } catch {
          setViewData(`Non-JSON response from server:\n${raw}`);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        alert(`Something happened -> ${message}`);
      }
    }
  };

  const clearForm = () => {
    setIngredientNewName("");
    setIngredientNewID("");
    setIngredientNewPrice("");
    setIngredientSupply("");
    setIngredientExpirationDate("");
    setIngredientVendor("");
    setIngredientCategoryId("");
    setViewData("Form cleared.");
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
          <div className="update-table-header-row">
            <h2>Ingredient List</h2>
          </div>

          <div className="update-table-wrapper">
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
                  ingredients.map((ing) => (
                    <tr key={ing.ingredient_id}>
                      <td>{ing.ingredient_id}</td>
                      <td>{ing.ingredient_name}</td>
                      <td>
                        {ing.ingredient_category_name ??
                          (ing.category_id
                            ? `#${ing.category_id}`
                            : "")}
                      </td>
                      <td>{ing.supply_level}</td>
                      <td>
                        {ing.expiration_date?.slice(0, 10) || ""}
                      </td>
                      <td>{ing.ingredient_cost}</td>
                      <td>{ing.vendor}</td>
                      <td>
                        <button
                          className="btn-update btn-update--outline"
                          onClick={() => handleRowSelect(ing)}
                        >
                          Load
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>


          <h2 style={{ marginTop: "1.2rem" }}>Add / Update / Delete</h2>

          <form onSubmit={handleAddIngredient} className="update-form-grid">
            <div className="update-field">
              <label className="update-label">Name</label>
              <input
                className="update-input"
                value={ingredientNewName}
                onChange={(e) => setIngredientNewName(e.target.value)}
              />
            </div>

            <div className="update-field">
              <label className="update-label">Supply</label>
              <input
                className="update-input"
                value={ingredientSupply}
                onChange={(e) => setIngredientSupply(e.target.value)}
              />
            </div>

            <div className="update-field">
              <label className="update-label">Expiration Date</label>
              <input
                className="update-input"
                placeholder="YYYY-MM-DD"
                value={ingredientExpirationDate}
                onChange={(e) =>
                  setIngredientExpirationDate(e.target.value)
                }
              />
            </div>

            <div className="update-field">
              <label className="update-label">Cost</label>
              <input
                className="update-input"
                value={ingredientNewPrice}
                onChange={(e) => setIngredientNewPrice(e.target.value)}
              />
            </div>

            <div className="update-field">
              <label className="update-label">Vendor</label>
              <input
                className="update-input"
                value={ingredientVendor}
                onChange={(e) => setIngredientVendor(e.target.value)}
              />
            </div>

            <div className="update-field">
              <label className="update-label">Category</label>
              <select
                className="update-input"
                value={ingredientCategoryId}
                onChange={(e) => setIngredientCategoryId(e.target.value)}
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
              <button type="submit" value="add" className="btn-update">
                Add
              </button>
              <button
                type="submit"
                value="update"
                className="btn-update btn-update"
              >
                Update
              </button>
              <button
                type="submit"
                value="delete"
                className="btn-update btn-update"
              >
                Delete
              </button>

              <button
                type="button"
                onClick={clearForm}
                className="btn-update btn-update"
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
