import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import ManagerNavbar from "../components/ManagerNavbar";

export default function UpdateMenu() {
    const [viewItemId, setViewItemId] = useState("");
    const [viewData, setViewData] = useState("");
    //const [updateItemId, setUpdateItemId] = useState("");
    //const [updatePrice, setUpdatePrice] = useState("");
    const [itemNewName, setItemNewName] = useState("");
    const [itemNewID, setItemNewID] = useState("");
    const [itemNewPrice, setItemNewPrice] = useState("");
    const [itemIsAvailable, setItemIsAvailable] = useState(false);
    const [itemSizes, setItemSizes] = useState("");
    const [itemPhotoPath, setItemPhotoPath] = useState("");
    const [itemIsSeasonal, setItemIsSeasonal] = useState(false);
    const [itemSeasonalTimeBegin, setItemIsSeasonalTimeBegin] = useState("");
    const [itemSeasonalTimeEnd, setItemIsSeasonalTimeEnd] = useState("");
    const [itemIsAvailableTouched, setItemIsAvailableTouched] = useState(false);
    const [itemIsSeasonalTouched, setItemIsSeasonalTouched] = useState(false);
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
        const trimmed = viewItemId.trim();
        if (!trimmed) {
            setViewData("Please enter a valid item ID.");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/updatemenu/viewitemdata/${encodeURIComponent(trimmed)}`);
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
                    setViewData("Result is empty!");
                else {
                    const out = data.map((item: any) => {
                        return [
                            `Pulled Data -->`,
                            `Item ID: ${item.item_id}`,
                            `Name: ${item.item_name}`,
                            `Cost: $${item.item_cost}`,
                            `In stock: ${item.in_stock ? "Yes" : "No"}`,
                            `Sizes: ${item.size_options}`,
                            `Photo: ${item.photo}`,
                            `Seasonal: ${item.seasonal_item ? "Yes" : "No"}`,
                            item.seasonal_item_beginning_time && `  From: ${item.seasonal_item_beginning_time}`,
                            item.seasonal_item_ending_time && `  To:   ${item.seasonal_item_ending_time}`,
                            `Category ID: ${item.category_id}`,
                        ]
                            .filter(Boolean)         // drop empty lines
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

    /*const handleUpdatePrice = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const targetID = updateItemId.trim();
        const targetPrice = updatePrice.trim();
        if (!targetID) {
            setViewData("Please enter a valid item ID.");
            return;
        }
        if (!targetPrice) {
            setViewData("Please enter a valid item price.");
            return;
        }

        const idNum = Number(targetID);
        if (!Number.isInteger(idNum) || idNum <= 0) {
            setViewData("Item ID must be a positive whole number.");
            return;
        }

        const priceNum = Number(targetPrice);
        if (!Number.isFinite(priceNum) || priceNum < 0) {
            setViewData("Price must be a non-negative number.");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/updatemenu/updateitemprice/${encodeURIComponent(idNum)}/${encodeURIComponent(priceNum)}`);
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
    };*/
    const handleAddItem = async (e?: React.FormEvent) => {
        e?.preventDefault();
        var targetName = itemNewName.trim();
        var targetID = itemNewID.trim();
        var targetPrice = itemNewPrice.trim();
        var targetAvailability = itemIsAvailable;
        var targetSizes = itemSizes.trim();
        var targetPhoto = itemPhotoPath.trim();
        var targetSeasonal = itemIsSeasonal;
        var targetSeasonalStart = itemSeasonalTimeBegin.trim() + " 00:00:00";
        var targetSeasonalEnd = itemSeasonalTimeEnd.trim() + " 00:00:00";

        const submitter = (e?.nativeEvent as any).submitter;
        const action = submitter?.value;

        if(!targetID)
        {
            setViewData("Missing target item id!");
            return;
        }

        if (action == "add") {
            if (!targetName || !targetID || !targetPrice || !targetSizes || !targetPhoto || !targetSeasonalStart || !targetSeasonalEnd) {
                setViewData("Verify all information is valid.");
                return;
            }

            const idNum = Number(targetID);
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
            }

            try {
                const res = await fetch(`${API_URL}/updatemenu/createnewitem/${encodeURIComponent(targetName)}/${encodeURIComponent(targetID)}/${encodeURIComponent(targetPrice)}/${encodeURIComponent(targetAvailability)}/${encodeURIComponent(targetSizes)}/${encodeURIComponent(targetPhoto)}/${encodeURIComponent(targetSeasonal)}/${encodeURIComponent(targetSeasonalStart)}/${encodeURIComponent(targetSeasonalEnd)}`);
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

        if (action == "update") {
            const res = await fetch(`${API_URL}/updatemenu/viewitemdata/${encodeURIComponent(targetID)}`);
            const raw = await res.text();

            if (!res.ok) {
                setViewData(
                    `Error ${res.status}\n${raw || "Failed to fetch item data"}`
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
                        ids = data.map((item: any) => item);
                    }
                } catch {
                    setViewData(`Non-JSON response from server:\n${raw}`);
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err);
                setViewData(`Something happend!! -> : ${message}`);
            }
          
            if (!targetName)
                targetName = ids[0].item_name;
            if (!targetPrice)
                targetPrice = ids[0].item_cost;
            if (!targetSizes)
                targetSizes = ids[0].size_options;
            if (!targetPhoto)// || targetExpirationDate == " 00:00:00")
                targetPhoto = ids[0].photo;
            if(!targetSeasonalStart || targetSeasonalStart == " 00:00:00")
                targetSeasonalStart = ids[0].seasonal_item_beginning_time;
            if(!ids[0].seasonal_item_beginning_time)
                targetSeasonalStart = "1970-01-01 00:00:01";
            if(!targetSeasonalEnd || targetSeasonalEnd == " 00:00:00")
                targetSeasonalEnd = ids[0].seasonal_item_ending_time;
            if(!ids[0].seasonal_item_ending_time)
               targetSeasonalEnd = "1970-01-01 00:00:01";
            
            if (itemIsAvailableTouched)
                targetAvailability = itemIsAvailable;
            else
            {
                if(!ids[0].in_stock)
                    targetAvailability = false;
                else
                    targetAvailability = ids[0].in_stock;
            }
            
            if(!ids[0].in_stock)
                targetAvailability = false;
            
            if (itemIsSeasonalTouched)
                targetSeasonal = itemIsSeasonal;
            else
            {
                if(!ids[0].seasonal_item)
                    targetSeasonal = false;
                else
                    targetSeasonal = ids[0].seasonal_item;
            }
          
            try {
                const res = await fetch(`${API_URL}/updatemenu/updateitem/${encodeURIComponent(targetName)}/${encodeURIComponent(targetID)}/${encodeURIComponent(targetPrice)}/${encodeURIComponent(targetAvailability)}/${encodeURIComponent(targetSizes)}/${encodeURIComponent(targetPhoto)}/${encodeURIComponent(targetSeasonal)}/${encodeURIComponent(targetSeasonalStart)}/${encodeURIComponent(targetSeasonalEnd)}`);
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
                        setViewData("Result is empty!");
                    else {
                        const out = data.map((item: any) => {
                            return [
                            `Updated Item -->`,
                            `Item ID: ${item.item_id}`,
                            `Name: ${item.item_name}`,
                            `Cost: $${item.item_cost}`,
                            `In stock: ${item.in_stock ? "Yes" : "No"}`,
                            `Sizes: ${item.size_options}`,
                            `Photo: ${item.photo}`,
                            `Seasonal: ${item.seasonal_item ? "Yes" : "No"}`,
                            item.seasonal_item_beginning_time && `  From: ${item.seasonal_item_beginning_time}`,
                            item.seasonal_item_ending_time && `  To:   ${item.seasonal_item_ending_time}`,
                            `Category ID: ${item.category_id}`,
                        ]
                            .filter(Boolean)         // drop empty lines
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
        }
        if (action == "delete") {
            if (!targetID) {
                setViewData("Verify all information is valid.");
                return;
            }
            try {
                const res = await fetch(`${API_URL}/updatemenu/deleteitem/${encodeURIComponent(targetID)}`);
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
                        <h2 className="mb-3 text-lg font-bold text-center text-black" style={{ color: "#000000" }}>View Item Data</h2>
                        <form onSubmit={handleViewSubmit} className="space-y-3 flex-1">
                            <label htmlFor="viewItemDataField" className="label-updateMenu" style={{ color: "#000000" }}>Item ID: </label>
                            <input
                                id="viewItemDataField"
                                className={inputBase}
                                placeholder="Item ID"
                                style={{ backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid" }}
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
                        <h2 className="mb-3 text-lg font-bold text-center text-black" style={{ color: "#000000" }}>Add/Update Item</h2>
                        <form onSubmit={handleAddItem} className="grid grid-cols-1 gap-4 flex-1">
                            <div>
                                <label htmlFor="itemNewName" className="label-updateMenu" style={{ color: "#000000" }}>Name: </label>
                                <input
                                    id="itemNewName"
                                    className={inputBase}
                                    placeholder="Name"
                                    style={{ backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid" }}
                                    value={itemNewName}
                                    onChange={(e) => setItemNewName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="itemNewID" className="label-updateMenu" style={{ color: "#000000" }}>Item ID (Primary): </label>
                                <input
                                    id="itemNewID"
                                    className={inputBase}
                                    placeholder="ID"
                                    style={{ backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid" }}
                                    value={itemNewID}
                                    onChange={(e) => setItemNewID(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="itemNewPrice" className="label-updateMenu" style={{ color: "#000000" }}>Price: </label>
                                <input
                                    id="itemNewPrice"
                                    className={inputBase}
                                    style={{ backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid" }}
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
                                    style={{ backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid" }}
                                    onChange={(e) => {setItemIsAvailable(e.target.checked); setItemIsAvailableTouched(true);}}
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
                                    style={{ backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid" }}
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
                                    style={{ backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid" }}
                                    value={itemPhotoPath}
                                    onChange={(e) => setItemPhotoPath(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    id="itemIsSeasonal"
                                    type="checkbox"
                                    checked={itemIsSeasonal}
                                    style={{ backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid" }}
                                    onChange={(e) => {setItemIsSeasonal(e.target.checked); setItemIsSeasonalTouched(true);}}
                                    className="h-4 w-4"
                                />
                                <label htmlFor="isSeasonal" className="label-updateMenu" style={{ color: "#000000" }}>Seasonal item: </label>
                            </div>
                            <div>
                                <label htmlFor="itemSeasonalTimeBegin" className="label-updateMenu" style={{ color: "#000000" }}>Seasonal time begin: </label>
                                <input
                                    id="itemSeasonalTimeBegin"
                                    className={inputBase}
                                    placeholder="YYYY-MM-DD"
                                    style={{ backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid" }}
                                    value={itemSeasonalTimeBegin}
                                    onChange={(e) => setItemIsSeasonalTimeBegin(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="itemSeasonalTimeEnd" className="label-updateMenu" style={{ color: "#000000" }}>Seasonal time end: </label>
                                <input
                                    id="itemSeasonalTimeEnd"
                                    className={inputBase}
                                    placeholder="YYYY-MM-DD"
                                    style={{ backgroundColor: "#fff", color: "#CF152D", borderColor: "#CF152D", borderWidth: "2px", borderStyle: "solid" }}
                                    value={itemSeasonalTimeEnd}
                                    onChange={(e) => setItemIsSeasonalTimeEnd(e.target.value)}
                                />
                            </div>
                            <div className="mt-auto flex items-center gap-2 pt-2">
                                <button type="submit" value="add" className="btn-updateMenu">Add</button>
                            </div>
                            <div className="mt-auto flex items-center gap-2 pt-2">
                                <button type="submit" value="update" className="btn-updateMenu">Update</button>
                            </div>
                            <div className="mt-auto flex items-center gap-2 pt-2">
                                <button type="submit" value="delete" className="btn-updateMenu">Delete</button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    </div>
);
}
