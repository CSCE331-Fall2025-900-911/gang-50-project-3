import React, {useLayoutEffect, useRef, useState, useEffect} from "react";
import CashierNavbar from "../components/CashierNavbar";

export default function UpdateMenu() {
  const [viewItemId, setViewItemId] = useState("");
  const [viewData, setViewData] = useState("");
  const [updateItemId, setUpdateItemId] = useState("");
  const [updatePrice, setUpdatePrice] = useState("");
  const [itemNewName, setItemNewName] = useState("");
  const [itemNewID, setItemNewID] = useState("");
  const [itemNewPrice, setItemNewPrice] = useState("");
  const [itemIsAvailable, setItemIsAvailable] = useState(false);
  const [itemSizes, setItemSizes] = useState("");
  const [itemPhotoPath, setItemPhotoPath] = useState("");
  const [itemIsSeasonal, setItemIsSeasonal] = useState(false);
  const [itemSeasonalTimeBegin, setItemIsSeasonalTimeBegin] = useState("");
  const [itemSeasonalTimeEnd, setItemIsSeasonalTimeEnd] = useState("");
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
      `Add item:\n name=${itemNewName}\n price=${itemNewPrice}\n available=${itemIsAvailable}`
    );
  };

  return (
    <div id="rootPane" className="min-h-screen flex flex-col bg-white text-gray-900">
      <nav ref={headerRef as any} className="cashier-nav">
        <CashierNavbar />
      </nav>

      <div style={{ paddingTop: headerH }} className="flex-1">
        <div className="mx-auto max-w-6xl p-6">
          <div className="update-menu-grid">
            <section className="rounded-2xl border p-4 shadow-sm flex flex-col">
              <h2 className="mb-3 text-lg font-bold text-center text-black" style={{ color: "#000000" }}>View Item Data</h2>
              <form onSubmit={handleViewSubmit} className="space-y-3 flex-1">
                <label htmlFor="viewItemDataField" className="label-updateMenu" style={{ color: "#000000" }}>Item ID: </label>
                <input
                  id="viewItemDataField"
                  className={inputBase}
                  placeholder="Item ID"
                  style={{backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid"}}
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
                    style={{backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid"}}
                    value={updateItemId}
                    onChange={(e) => setUpdateItemId(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="updatePrice" className="label-updateMenu" style={{ color: "#000000" }}>New Price: </label>
                  <input
                    id="updatePrice"
                    className={inputBase}
                    placeholder="0.00"
                    style={{backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid"}}
                    value={updatePrice}
                    onChange={(e) => setUpdatePrice(e.target.value)}
                  />
                </div>
                <div className="mt-auto pt-2">
                  <button type="submit" className="btn-updateMenu">Update</button>
                </div>
              </form>
          <h2 className="mb-2 text-base font-semibold text-center text-black" style={{ color: "#000000" }}>Data Output</h2>
          <textarea
            id="viewDataTextArea"
            className="w-full resize-none rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={viewData}
            readOnly
            style={{height: "300px", width: "300px", resize: "none", backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid"}}
            onChange={(e) => setViewData(e.target.value)}
            placeholder="Waiting..."/>
        </section>

            <section className="rounded-2xl border p-4 shadow-sm flex flex-col">
              <h2 className="mb-3 text-lg font-bold text-center text-black" style={{ color: "#000000" }}>Add Item</h2>
              <form onSubmit={handleAddItem} className="grid grid-cols-1 gap-4 flex-1">
                <div>
                  <label htmlFor="itemNewName" className="label-updateMenu" style={{ color: "#000000" }}>Name: </label>
                  <input
                    id="itemNewName"
                    className={inputBase}
                    placeholder="Name"
                    style={{backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid"}}
                    value={itemNewName}
                    onChange={(e) => setItemNewName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="itemNewID" className="label-updateMenu" style={{ color: "#000000" }}>Item ID: </label>
                  <input
                    id="itemNewID"
                    className={inputBase}
                    placeholder="ID"
                    style={{backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid"}}
                    value={itemNewID}
                    onChange={(e) => setItemNewID(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="itemNewPrice" className="label-updateMenu" style={{ color: "#000000" }}>Price: </label>
                  <input
                    id="itemNewPrice"
                    className={inputBase}
                    style={{backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid"}}
                    placeholder="0.00"
                    value={itemNewPrice}
                    onChange={(e) => setItemNewPrice(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="itemIsAvailable"
                    type="checkbox"
                    checked={itemIsAvailable}
                    style={{backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid"}}
                    onChange={(e) => setItemIsAvailable(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="itemIsAvailable" className="label-updateMenu" style={{ color: "#000000" }}>In stock: </label>
                </div>
                <div>
                  <label htmlFor="itemSizes" className="label-updateMenu" style={{ color: "#000000" }}>Sizes: </label>
                  <input
                    id="itemSizes"
                    className={inputBase}
                    placeholder="S/M/L"
                    style={{backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid"}}
                    value={itemSizes}
                    onChange={(e) => setItemSizes(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="itemPhotoPath" className="label-updateMenu" style={{ color: "#000000" }}>Photo: </label>
                  <input
                    id="itemPhotoPath"
                    className={inputBase}
                    placeholder="/tmp/photo"
                    style={{backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid"}}
                    value={itemPhotoPath}
                    onChange={(e) => setItemPhotoPath(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="itemIsSeasonal"
                    type="checkbox"
                    checked={itemIsSeasonal}
                    style={{backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid"}}
                    onChange={(e) => setItemIsSeasonal(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="isSeasonal" className="label-updateMenu" style={{ color: "#000000" }}>Seasonal item: </label>
                </div>
                <div>
                  <label htmlFor="itemSeasonalTimeBegin" className="label-updateMenu" style={{ color: "#000000" }}>Seasonal time begin: </label>
                  <input
                    id="itemSeasonalTimeBegin"
                    className={inputBase}
                    placeholder="YR-M-D"
                    style={{backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid"}}
                    value={itemSeasonalTimeBegin}
                    onChange={(e) => setItemIsSeasonalTimeBegin(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="itemSeasonalTimeEnd" className="label-updateMenu" style={{ color: "#000000" }}>Seasonal time end: </label>
                  <input
                    id="itemSeasonalTimeEnd"
                    className={inputBase}
                    placeholder="YR-M-D"
                    style={{backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid"}}
                    value={itemSeasonalTimeEnd}
                    onChange={(e) => setItemIsSeasonalTimeEnd(e.target.value)}
                  />
                </div>
                <div className="mt-auto flex items-center gap-2 pt-2">
                  <button type="submit" className="btn-updateMenu">Add</button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
