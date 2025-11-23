import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import CashierNavbar from "../components/CashierNavbar";

export default function Reports() {
    return (
        <div id="rootPane" className="min-h-screen flex flex-col bg-white text-gray-900">
            <nav ref={headerRef as any} className="cashier-nav">
                <CashierNavbar />
            </nav>
        </div>
    );
}
