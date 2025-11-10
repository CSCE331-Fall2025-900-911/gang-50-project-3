import React, { useLayoutEffect, useRef, useState } from "react";
import CashierNavbar from "../components/CashierNavbar";

export default function UpdateMenu() {
  const [viewItemId, setViewItemId] = useState("");
  const [viewData, setViewData] = useState("");
  const [updateItemId, setUpdateItemId] = useState("");
  const [updatePrice, setUpdatePrice] = useState("");
  const [addName, setAddName] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addCategory, setAddCategory] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
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
  }, 
                  
  useEffect(() => {
    const prev = document.body.style.overflowY;
    document.body.style.overflowY = "auto";     // allow scroll on this page
    return () => { document.body.style.overflowY = prev || "hidden"; }; // restore for others
  }, []);

  const inputBase = "block w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const handleViewSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setViewData((prev) => `Queried item ${viewItemId || "(none)"}.\n` + prev);
  };
  const handleUpdatePrice = (e?: React.FormEvent) => {
    e?.preventDefault();
    alert(`Update price for item ${updateItemId || "(none)"} -> ${updatePrice || "(none)"}`);
  };
  const handleAddItem = (e?: React.FormEvent) => {
    e?.preventDefault();
    alert(
      `Add item:\n name=${addName}\n price=${addPrice}\n category=${addCategory}\n available=${isAvailable}`
    );
  };

  return (
    <div id="rootPane" className="min-h-screen bg-white text-gray-900">
      <nav ref={headerRef as any} className="cashier-nav">
        <CashierNavbar />
      </nav>

      <div style={{ paddingTop: headerH }}>
        <div className="mx-auto max-w-6xl p-6 pb-64">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <section className="rounded-2xl border p-4 shadow-sm flex flex-col">
              <h2 className="mb-3 text-lg font-bold text-center text-black" style={{ color: "#000000" }}>View Item Data</h2>
              <form onSubmit={handleViewSubmit} className="space-y-3 flex-1">
                <label htmlFor="viewItemDataField" className="label-updateMenu" style={{ color: "#000000" }}>Item ID: </label>
                <input
                  id="viewItemDataField"
                  className={inputBase}
                  placeholder="Item ID"
                  value={viewItemId}
                  onChange={(e) => setViewItemId(e.target.value)}
                />
                <div className="mt-auto pt-2">
                  <button id="viewDataSubmitButton" type="submit" className="btn-updateMenu">
                    Submit
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-2xl border p-4 shadow-sm flex flex-col">
              <h2 className="mb-3 text-lg font-bold text-center text-black" style={{ color: "#000000" }}>Update Price</h2>
              <form onSubmit={handleUpdatePrice} className="space-y-3 flex-1">
                <div>
                  <label htmlFor="updateItemId" className="label-updateMenu" style={{ color: "#000000" }}>Item ID: </label>
                  <input
                    id="updateItemId"
                    className={inputBase}
                    placeholder="Item ID"
                    value={updateItemId}
                    onChange={(e) => setUpdateItemId(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="updatePrice" className="label-updateMenu" style={{ color: "#000000" }}>New Price: </label>
                  <input
                    id="updatePrice"
                    type="number"
                    step="0.01"
                    className={inputBase}
                    placeholder="0.00"
                    value={updatePrice}
                    onChange={(e) => setUpdatePrice(e.target.value)}
                  />
                </div>
                <div className="mt-auto pt-2">
                  <button type="submit" className="btn-updateMenu">Update</button>
                </div>
              </form>
            </section>

            <section className="rounded-2xl border p-4 shadow-sm flex flex-col">
              <h2 className="mb-3 text-lg font-bold text-center text-black" style={{ color: "#000000" }}>Add Item</h2>
              <form onSubmit={handleAddItem} className="grid grid-cols-1 gap-4 flex-1">
                <div>
                  <label htmlFor="addName" className="label-updateMenu" style={{ color: "#000000" }}>Name: </label>
                  <input
                    id="addName"
                    className={inputBase}
                    placeholder="Name"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="addPrice" className="label-updateMenu" style={{ color: "#000000" }}>Price: </label>
                  <input
                    id="addPrice"
                    type="number"
                    step="0.01"
                    className={inputBase}
                    placeholder="0.00"
                    value={addPrice}
                    onChange={(e) => setAddPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="addCategory" className="label-updateMenu" style={{ color: "#000000" }}>Category: </label>
                  <input
                    id="addCategory"
                    className={inputBase}
                    placeholder="e.g., Drinks"
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="isAvailable"
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="isAvailable" className="label-updateMenu" style={{ color: "#000000" }}>Available</label>
                </div>
                <div className="mt-auto flex items-center gap-2 pt-2">
                  <button type="submit" className="btn-updateMenu">Add</button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(56rem,92vw)]">
        <section className="rounded-2xl border p-4 shadow-lg bg-white">
          <h2 className="mb-2 text-base font-semibold text-center text-black" style={{ color: "#000000" }}>Data Output</h2>
          <textarea
            id="viewDataTextArea"
            className="h-40 w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={viewData}
            onChange={(e) => setViewData(e.target.value)}
            placeholder="Results appear here..."
          />
        </section>
      </div>
    </div>
  );
}
