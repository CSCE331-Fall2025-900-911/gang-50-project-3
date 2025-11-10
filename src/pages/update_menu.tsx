import React, { useMemo, useState } from "react";
//import CashierNavbar from '../components/CashierNavbar';

export default function UpdateMenu() {
  const [viewItemId, setViewItemId] = useState("");
  const [viewData, setViewData] = useState("");

  const [updateItemId, setUpdateItemId] = useState("");
  const [updatePrice, setUpdatePrice] = useState("");

  const [addName, setAddName] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addCategory, setAddCategory] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const menuItems = useMemo(
    () => ({
      file: [
        { label: "New", onClick: () => console.log("New clicked") },
        { label: "Open", onClick: () => console.log("Open clicked") },
        { label: "Save", onClick: () => console.log("Save clicked") },
      ],
      help: [{ label: "About", onClick: () => alert("Update Menu") }],
    }),
    []
  );

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

  const buttonBase = "rounded-2xl px-4 py-2 shadow hover:shadow-md transition font-medium";
  const primaryBtn = `${buttonBase} bg-blue-600 text-white`;
  const secondaryBtn = `${buttonBase} bg-gray-100`;
  const inputBase =
    "block w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCl = "text-sm font-semibold text-gray-700";

  return (
    <div id="rootPane" className="min-h-screen bg-white text-gray-900 pt-32">
      {/* Top bar with logo + menu */}
      <div className="flex items-center gap-4 border-b p-2">
        <img
          src="images/sharetealogo.png"
          alt="Logo"
          className="h-6 w-auto"
        />
        <nav className="flex items-center gap-6">
          <Menu label="File" entries={menuItems.file} />
          <Menu label="Help" entries={menuItems.help} />
        </nav>
      </div>

      {/* Content area approximating the Pane absolute layout in a responsive grid */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 p-6 md:grid-cols-2 pt-20">
        {/* View Item Data */}
        <section className="rounded-2xl border p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">View Item Data</h2>
          <form onSubmit={handleViewSubmit} className="space-y-3">
            <label htmlFor="viewItemDataField" className={labelCl}>
              Item ID
            </label>
            <input
              id="viewItemDataField"
              className={inputBase}
              placeholder="Item ID"
              value={viewItemId}
              onChange={(e) => setViewItemId(e.target.value)}
            />
            <button id="viewDataSubmitButton" type="submit" className={primaryBtn}>
              Submit
            </button>
          </form>
        </section>

        {/* Update Price */}
        <section className="rounded-2xl border p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">Update Price</h2>
          <form onSubmit={handleUpdatePrice} className="space-y-3">
            <div>
              <label htmlFor="updateItemId" className={labelCl}>
                Item ID
              </label>
              <input
                id="updateItemId"
                className={inputBase}
                placeholder="Item ID"
                value={updateItemId}
                onChange={(e) => setUpdateItemId(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="updatePrice" className={labelCl}>
                New Price
              </label>
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
            <button type="submit" className={primaryBtn}>
              Update
            </button>
          </form>
        </section>

        {/* Add Item */}
        <section className="rounded-2xl border p-4 shadow-sm md:col-span-2">
          <h2 className="mb-3 text-lg font-bold">Add Item</h2>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label htmlFor="addName" className={labelCl}>
                Name
              </label>
              <input
                id="addName"
                className={inputBase}
                placeholder="Name"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="addPrice" className={labelCl}>
                Price
              </label>
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
              <label htmlFor="addCategory" className={labelCl}>
                Category
              </label>
              <input
                id="addCategory"
                className={inputBase}
                placeholder="e.g., Drinks"
                value={addCategory}
                onChange={(e) => setAddCategory(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 md:col-span-4">
              <input
                id="isAvailable"
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="isAvailable" className={labelCl}>
                Available
              </label>
            </div>
            <div className="md:col-span-4 flex items-center gap-2">
              <button type="submit" className={primaryBtn}>
                Add
              </button>
              <button
                type="button"
                className={secondaryBtn}
                onClick={() => {
                  setAddName("");
                  setAddPrice("");
                  setAddCategory("");
                  setIsAvailable(true);
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        {/* TextArea that mirrors the JavaFX viewDataTextArea */}
        <section className="rounded-2xl border p-4 shadow-sm md:col-span-2">
          <h2 className="mb-3 text-lg font-bold">Data Output</h2>
          <textarea
            id="viewDataTextArea"
            className="h-60 w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={viewData}
            onChange={(e) => setViewData(e.target.value)}
            placeholder="Results appear here..."
          />
        </section>
      </div>
    </div>
  );
}

// Simple menu component
function Menu({
  label,
  entries,
}: {
  label: string;
  entries: { label: string; onClick: () => void }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative select-none">
      <button
        className="rounded-xl px-3 py-1 hover:bg-gray-100"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        type="button"
      >
        {label}
      </button>
      {open && (
        <div className="absolute left-0 z-10 mt-1 w-40 overflow-hidden rounded-xl border bg-white shadow-lg">
          {entries.map((e, i) => (
            <button
              key={i}
              className="block w-full px-3 py-2 text-left hover:bg-gray-50"
              onMouseDown={(evt) => evt.preventDefault()}
              onClick={e.onClick}
              type="button"
            >
              {e.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
