import { useState } from "react";

export default function UpdateMenu() {
  const [viewItemId, setViewItemId] = useState("");
  const [viewData, setViewData] = useState<any>(null);

  const [updateItemId, setUpdateItemId] = useState("");
  const [updatePrice, setUpdatePrice] = useState("");
  const [updateStock, setUpdateStock] = useState(true);

  const [addName, setAddName] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addStock, setAddStock] = useState(true);

  // View item by ID
  const handleView = async () => {
    if (!viewItemId) return alert("Enter an item ID.");
    const res = await fetch(`http://localhost:5000/api/items/${viewItemId}`);
    const data = await res.json();
    setViewData(data);
  };

  // Update item
  const handleUpdate = async () => {
    if (!updateItemId || !updatePrice) return alert("Enter ID and new price.");
    const res = await fetch(`http://localhost:5000/api/items/${updateItemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_cost: parseFloat(updatePrice),
        in_stock: updateStock,
      }),
    });
    const data = await res.json();
    alert(data.message);
  };

  // Add new item
  const handleAdd = async () => {
    if (!addName || !addPrice) return alert("Enter name and price.");
    const res = await fetch(`http://localhost:5000/api/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_name: addName,
        item_cost: parseFloat(addPrice),
        in_stock: addStock,
      }),
    });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <div style={{ padding: "2em" }}>
      <h1>Update Menu</h1>

      {/* View Section */}
      <div style={{ marginTop: "2em" }}>
        <h2>View Item Data</h2>
        <input
          type="text"
          placeholder="Item ID"
          value={viewItemId}
          onChange={(e) => setViewItemId(e.target.value)}
        />
        <button onClick={handleView}>View</button>
        {viewData && (
          <div style={{ marginTop: "1em" }}>
            <p><b>Name:</b> {viewData.item_name}</p>
            <p><b>Price:</b> ${viewData.item_cost}</p>
            <p><b>In Stock:</b> {viewData.in_stock ? "Yes" : "No"}</p>
          </div>
        )}
      </div>

      {/* Update Section */}
      <div style={{ marginTop: "3em" }}>
        <h2>Update Item</h2>
        <input
          type="text"
          placeholder="Item ID"
          value={updateItemId}
          onChange={(e) => setUpdateItemId(e.target.value)}
        />
        <input
          type="text"
          placeholder="New Price"
          value={updatePrice}
          onChange={(e) => setUpdatePrice(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={updateStock}
            onChange={(e) => setUpdateStock(e.target.checked)}
          />
          In Stock
        </label>
        <button onClick={handleUpdate}>Update</button>
      </div>

      {/* Add Section */}
      <div style={{ marginTop: "3em" }}>
        <h2>Add New Item</h2>
        <input
          type="text"
          placeholder="Name"
          value={addName}
          onChange={(e) => setAddName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Price"
          value={addPrice}
          onChange={(e) => setAddPrice(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={addStock}
            onChange={(e) => setAddStock(e.target.checked)}
          />
          In Stock
        </label>
        <button onClick={handleAdd}>Add Item</button>
      </div>
    </div>
  );
}
