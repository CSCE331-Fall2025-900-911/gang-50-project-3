import React, { useState } from "react";
import CashierNavbar from '../components/CashierNavbar';

export default function UpdateMenu() {
    const [viewItemId, setViewItemId] = useState("");
    const [viewData, setViewData] = useState("");

    const [updateItemId, setUpdateItemId] = useState("");
    const [updatePrice, setUpdatePrice] = useState("");

    const [addName, setAddName] = useState("");
    const [addPrice, setAddPrice] = useState("");
    const [addCategory, setAddCategory] = useState("");
    const [isAvailable, setIsAvailable] = useState(true);

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
        <div id="rootPane" className="min-h-screen bg-white text-gray-900">
            {/* Fixed top bar */}
            <div className="fixed top-0 left-0 w-full flex items-center gap-4 border-b bg-white z-50 h-45 px-4">
                <img src="/images/sharetealogo.png" alt="Logo" className="h-6 w-auto" />
                <CashierNavbar />
            </div>
            <div className="mx-auto max-w-6xl p-6 pt-24 pb-64">
                {/* Three equal-sized groups, side-by-side on md+; stacked on small screens */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {/* View Item Data */}
                    <section className="rounded-2xl border p-4 shadow-sm flex flex-col">
                        <h2 className="mb-3 text-lg font-bold text-center">View Item Data</h2>
                        <form onSubmit={handleViewSubmit} className="space-y-3 flex-1">
                            <label htmlFor="viewItemDataField" className={labelCl}>Item ID</label>
                            <input
                                id="viewItemDataField"
                                className={inputBase}
                                placeholder="Item ID"
                                value={viewItemId}
                                onChange={(e) => setViewItemId(e.target.value)}
                            />
                            <div className="mt-auto pt-2">
                                <button id="viewDataSubmitButton" type="submit" className={primaryBtn}>
                                    Submit
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Update Price */}
                    <section className="rounded-2xl border p-4 shadow-sm flex flex-col">
                        <h2 className="mb-3 text-lg font-bold text-center">Update Price</h2>
                        <form onSubmit={handleUpdatePrice} className="space-y-3 flex-1">
                            <div>
                                <label htmlFor="updateItemId" className={labelCl}>Item ID</label>
                                <input
                                    id="updateItemId"
                                    className={inputBase}
                                    placeholder="Item ID"
                                    value={updateItemId}
                                    onChange={(e) => setUpdateItemId(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="updatePrice" className={labelCl}>New Price</label>
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
                                <button type="submit" className={primaryBtn}>Update</button>
                            </div>
                        </form>
                    </section>

                    {/* Add Item */}
                    <section className="rounded-2xl border p-4 shadow-sm flex flex-col">
                        <h2 className="mb-3 text-lg font-bold text-center">Add Item</h2>
                        <form onSubmit={handleAddItem} className="grid grid-cols-1 gap-4 flex-1">
                            <div>
                                <label htmlFor="addName" className={labelCl}>Name</label>
                                <input
                                    id="addName"
                                    className={inputBase}
                                    placeholder="Name"
                                    value={addName}
                                    onChange={(e) => setAddName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="addPrice" className={labelCl}>Price</label>
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
                                <label htmlFor="addCategory" className={labelCl}>Category</label>
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
                                <label htmlFor="isAvailable" className={labelCl}>Available</label>
                            </div>

                            <div className="mt-auto flex items-center gap-2 pt-2">
                                <button type="submit" className={primaryBtn}>Add</button>
                                <button
                                    type="button"
                                    className={secondaryBtn}
                                    onClick={() => {
                                        setAddName(""); setAddPrice(""); setAddCategory(""); setIsAvailable(true);
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>

            {/* Fixed, centered “View Data” box at the bottom */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(56rem,92vw)]">
                <section className="rounded-2xl border p-4 shadow-lg bg-white">
                    <h2 className="mb-2 text-base font-semibold text-center">Data Output</h2>
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
