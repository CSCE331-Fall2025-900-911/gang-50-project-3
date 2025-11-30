import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import ManagerNavbar from "../components/ManagerNavbar";

export default function UpdateMenu() {
  const [viewIngredientName, setViewIngredientName] = useState("");
  const [viewData, setViewData] = useState("");
  const [ingredientNewName, setIngredientNewName] = useState("");
  const [ingredientNewID, setIngredientNewID] = useState("");
  const [ingredientNewPrice, setIngredientNewPrice] = useState("");
  const [ingredientSupply, setIngredientSupply] = useState("");
  const [ingredientExpirationDate, setIngredientExpirationDate] = useState("");
  const [ingredientVendor, setIngredientVendor] = useState("");
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
    document.body.style.overflowY = "auto";     // allow scroll on this page
    return () => { document.body.style.overflowY = prev || "hidden"; }; // restore for others
  }, []);

  const inputBase = "block w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const API_URL = '/api';

  const handleViewSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = viewIngredientName.trim();
    if (!trimmed) {
      setViewData("Please enter a valid ingredient name.");
      return;
    }
  ///api/inventorypage/viewingredientdata/:ingredientName
    try {
      const res = await fetch(`${API_URL}/inventorypage/viewingredientdata/${encodeURIComponent(trimmed)}`);
      const raw = await res.text();

      if (!res.ok) {
        setViewData(
          `Error ${res.status}\n${raw || "Failed to fetch ingredient data"}`
        );
        return;
      }

      try {
        const data = JSON.parse(raw);
        const stringVersion = JSON.stringify(data, null, 2)
        if (stringVersion == "[]")
          setViewData("Result is empty!");
        else {
          const out = data.map((ingredient: any) => {
              return [
                `Ingredient ID: ${ingredient.ingredient_id}`,
                `Name: ${ingredient.ingredient_name}`,
                `Supply Level: ${ingredient.supply_level}`,
                `Expiration Date: ${ingredient.expiration_date}`,
                `Cost: $${ingredient.ingredient_cost}`,
                `Vendor: ${ingredient.vendor}`,
              ]
                .filter(Boolean)
                .join("\n");
            })
          setViewData(out);
        }
      } catch {
        setViewData(`Non-JSON response from server:\n${raw}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setViewData(`Something happend!! -> : ${message}`);
    }
  };

  const handleAddIngredient = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const targetName = ingredientNewName.trim();
    const targetID = ingredientNewID.trim();
    const targetPrice = ingredientNewPrice.trim();
    const targetSupply = ingredientSupply.trim();
    const targetVendor = ingredientVendor.trim();
    var targetExpirationDate = ingredientExpirationDate.trim() + " 00:00:00";

    const submitter = (e?.nativeEvent as any).submitter;
    const action = submitter?.value; // "add" or "update"

    if(action == "add")
    {
      if (!targetName || !targetID || !targetPrice || !targetSupply || !targetVendor || !targetExpirationDate) {
      setViewData("Verify all information is valid.");
      return;
      }
      ///api/inventorypage/createnewingredient/:newIngredientId/:newIngredientName/:newIngredientSupply/:newIngredientExpirationDate/:newIngredientCost/:newIngredientVendor
      try {
      const res = await fetch(`${API_URL}/inventorypage/createnewingredient/${encodeURIComponent(targetID)}/${encodeURIComponent(targetName)}/${encodeURIComponent(targetSupply)}/${encodeURIComponent(targetExpirationDate)}/${encodeURIComponent(targetPrice)}/${encodeURIComponent(targetVendor)}`);
      const raw = await res.text();

      if (!res.ok) {
        setViewData(
          `Error ${res.status}\n${raw || "Failed to fetch item data"}`
        );
        return;
      }

      try {
        const data = JSON.parse(raw);
        const stringVersion = JSON.stringify(data, null, 2)
        if (stringVersion == "[]")
          setViewData("Action successful!");
        else
          setViewData(stringVersion);
      } catch {
        setViewData(`Non-JSON response from server:\n${raw}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setViewData(`Something happend!! -> : ${message}`);
      }
    }
    if(action == "update")
    {
      if (!targetName) {
      setViewData("Verify all information is valid.");
      return;
      }

      const res = await fetch(`${API_URL}/inventorypage/viewingredientdata/${encodeURIComponent(trimmed)}`);
      const raw = await res.text();

      if (!res.ok) {
        setViewData(
          `Error ${res.status}\n${raw || "Failed to fetch ingredient data"}`
        );
        return;
      }
      var ids;
      try {
      try {
        const data = JSON.parse(raw);
        const stringVersion = JSON.stringify(data, null, 2)
        if (stringVersion == "[]")
          setViewData("Result is empty!");
        else {
          ids = data.map((ingredient: any) => ingredient);
          setViewData(ids);
        }
      } catch {
        setViewData(`Non-JSON response from server:\n${raw}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setViewData(`Something happend!! -> : ${message}`);
    }

      
    }
    
    
    /*const idNum = Number(targetID);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      setViewData("Item ID must be a positive whole number.");
      return;
    }

    const priceNum = Number(targetPrice);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setViewData("Price must be a non-negative number.");
      return;
    }

    if (!targetSeasonal) {
      targetSeasonalStart = "1970-01-01 00:00:01";
      targetSeasonalEnd = "1970-01-01 00:00:01";
    }*/
  };

  return (
    <div id="rootPane" className="min-h-screen flex flex-col bg-white text-gray-900">
      <nav ref={headerRef as any} className="cashier-nav">
        <ManagerNavbar />
      </nav>

      <div style={{ paddingTop: headerH }} className="flex-1">
        <div className="mx-auto max-w-6xl p-6">
          <div className="update-menu-grid">
            <section className="rounded-2xl border p-4 shadow-sm flex flex-col">
              <h2 className="mb-3 text-lg font-bold text-center text-black" style={{ color: "#000000" }}>View Ingedient Data</h2>
              <form onSubmit={handleViewSubmit} className="space-y-3 flex-1">
                <label htmlFor="viewItemDataField" className="label-updateMenu" style={{ color: "#000000" }}>Ingredient Name: </label>
                <input
                  id="viewItemDataField"
                  className={inputBase}
                  placeholder="Ingredient Name"
                  style={{ backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid" }}
                  value={viewIngredientName}
                  onChange={(e) => setViewIngredientName(e.target.value)}
                />
                <div className="mt-auto pt-2">
                  <button id="viewDataSubmitButton" type="submit" className="btn-updateMenu">
                    Submit
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-2xl border p-4 shadow-sm flex flex-col">
              <h2 className="mb-2 text-base font-semibold text-center text-black" style={{ color: "#000000" }}>Output</h2>
              <textarea
                id="viewDataTextArea"
                className="w-full resize-none rounded-xl border border-gray-300 p-3"
                value={viewData}
                readOnly
                style={{ height: "300px", width: "300px", resize: "none", backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid" }}
                placeholder="Waiting..." />
            </section>

            <section className="rounded-2xl border p-4 shadow-sm flex flex-col">
              <h2 className="mb-3 text-lg font-bold text-center text-black" style={{ color: "#000000" }}>Add/Update Ingredient</h2>
              <form onSubmit={handleAddIngredient} className="grid grid-cols-1 gap-4 flex-1">
                <div>
                  <label htmlFor="ingredientNewName" className="label-updateMenu" style={{ color: "#000000" }}>Name: </label>
                  <input
                    id="ingredientNewName"
                    className={inputBase}
                    placeholder="Name"
                    style={{ backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid" }}
                    value={ingredientNewName}
                    onChange={(e) => setIngredientNewName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="ingredientNewID" className="label-updateMenu" style={{ color: "#000000" }}>Ingredient ID: </label>
                  <input
                    id="ingredientNewID"
                    className={inputBase}
                    placeholder="ID"
                    style={{ backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid" }}
                    value={ingredientNewID}
                    onChange={(e) => setIngredientNewID(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="ingredientSupply" className="label-updateMenu" style={{ color: "#000000" }}>Supply: </label>
                  <input
                    id="ingredientSupply"
                    className={inputBase}
                    style={{ backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid" }}
                    placeholder="0.00"
                    value={ingredientSupply}
                    onChange={(e) => setIngredientSupply(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="ingredientExpirationDate" className="label-updateMenu" style={{ color: "#000000" }}>Expiration Date: </label>
                  <input
                    id="ingredientExpirationDate"
                    className={inputBase}
                    placeholder="YYYY-MM-DD"
                    style={{ backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid" }}
                    value={ingredientExpirationDate}
                    onChange={(e) => setIngredientExpirationDate(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="ingredientNewPrice" className="label-updateMenu" style={{ color: "#000000" }}>Cost: </label>
                  <input
                    id="ingredientNewPrice"
                    className={inputBase}
                    placeholder="0"
                    style={{ backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid" }}
                    value={ingredientNewPrice}
                    onChange={(e) => setIngredientNewPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="ingredientVendor" className="label-updateMenu" style={{ color: "#000000" }}>Vendor: </label>
                  <input
                    id="ingredientVendor"
                    className={inputBase}
                    placeholder="Vendor Name"
                    style={{ backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid" }}
                    value={ingredientVendor}
                    onChange={(e) => setIngredientVendor(e.target.value)}
                  />
                </div>
                <div className="mt-auto flex items-center gap-2 pt-2">
                  <button type="submit" value="add" className="btn-updateMenu">Add</button>
                </div>
                <div className="mt-auto flex items-center gap-2 pt-2">
                  <button type="submit" value="update" className="btn-updateMenu">Update</button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
