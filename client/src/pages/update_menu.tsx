import { useState } from "react";

export default function UpdateMenu() {
  const [viewItemId, setViewItemId] = useState("");
  const [viewData, setViewData] = useState("");

  const [updateItemId, setUpdateItemId] = useState("");
  const [updatePrice, setUpdatePrice] = useState("");

  const [addName, setAddName] = useState("");
  const [addPrice, setAddPrice] = useState("");

  // Example: function to handle view item
  const handleViewItem = async () => {
    if (!viewItemId) return;
    try {
      const response = await fetch(`/api/items/${viewItemId}`);
      const data = await response.json();
      setViewData(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
      setViewData("Error fetching item");
    }
  };

  // Example: function to handle update
  const handleUpdateItem = async () => {
    if (!updateItemId || !updatePrice) return;
    try {
      await fetch(`/api/items/${updateItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: updatePrice }),
      });
      alert("Item updated!");
    } catch (error) {
      console.error(error);
      alert("Update failed");
    }
  };

  // Example: function to handle add
  const handleAddItem = async () => {
    if (!addName || !addPrice) return;
    try {
      await fetch(`/api/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName, price: addPrice }),
      });
      alert("Item added!");
    } catch (error) {
      console.error(error);
      alert("Add failed");
    }
  };

  return (
    <div>
      <h1>Update Menu</h1>

      <section>
        <h2>View Item</h2>
        <input
          type="text"
          placeholder="Item ID"
          value={viewItemId}
          onChange={(e) => setViewItemId(e.target.value)}
        />
        <button onClick={handleViewItem}>View</button>
        <pre>{viewData}</pre>
      </section>

      <section>
        <h2>Update Item Price</h2>
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
        <button onClick={handleUpdateItem}>Update</button>
      </section>

      <section>
        <h2>Add New Item</h2>
        <input
          type="text"
          placeholder="Item Name"
          value={addName}
          onChange={(e) => setAddName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Price"
          value={addPrice}
          onChange={(e) => setAddPrice(e.target.value)}
        />
        <button onClick={handleAddItem}>Add Item</button>
      </section>
    </div>
  );
}
