import { useState, useRef, useLayoutEffect, useEffect } from "react";
import ManagerNavbar from "../components/ManagerNavbar";

export default function Analytics() {
  const headerRef = useRef<HTMLElement>(null);
  const [headerH, setHeaderH] = useState(64);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const update = () => setHeaderH(el.getBoundingClientRect().height);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflowY;
    document.body.style.overflowY = "auto";
    return () => {
      document.body.style.overflowY = prev;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav
        ref={headerRef}
        className="cashier-nav fixed top-0 left-0 right-0 z-50"
      >
        <ManagerNavbar />
      </nav>

      <main
        style={{ paddingTop: headerH }}
        className="p-6 max-w-7xl mx-auto overflow-y-auto"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          Sales Analytics
        </h1>

        {/* Two-column layout */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Graph */}
          <div className="bg-gray-50 border rounded-xl shadow-sm p-4 flex items-center justify-center h-80">
            {/* Replace this with your actual chart */}
            <span className="text-gray-400 text-sm">
              Graph / Chart goes here
            </span>
          </div>

          {/* RIGHT: Order Statistics panel */}
          <div className="bg-gray-50 border rounded-xl shadow-sm px-8 py-10 flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-10 text-center">
              Order Statistics
            </h2>

            {/* Total Sales */}
            <div className="mb-10 text-center">
              <div className="text-xl font-medium mb-2">Total Sales</div>
              <div className="text-gray-500">(Value)</div>
            </div>

            {/* Total Orders */}
            <div className="mb-10 text-center">
              <div className="text-xl font-medium mb-2">Total Orders</div>
              <div className="text-gray-500">(Value)</div>
            </div>

            {/* Total Tips */}
            <div className="mb-10 text-center">
              <div className="text-xl font-medium mb-2">Total Tips</div>
              <div className="text-gray-500">(Value)</div>
            </div>

            {/* Generate Reports */}
            <div className="w-full max-w-xs mt-4">
              <h3 className="text-xl font-medium text-center mb-4">
                Generate Reports
              </h3>

              {/* Date + Hour + X/Z */}
              <div className="space-y-3 mb-6">
                <input
                  type="date"
                  className="w-full border rounded-md px-3 py-2 text-sm placeholder-gray-400"
                  placeholder="Date (YYYY-MM-DD)"
                />

                <select className="w-full border rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">Select Hour</option>
                  {/* Add options as needed */}
                </select>

                <button className="w-full border rounded-md px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200">
                  Generate X/Z Report
                </button>
              </div>

              {/* Two more dates */}
              <div className="space-y-3 mb-6">
                <input
                  type="date"
                  className="w-full border rounded-md px-3 py-2 text-sm placeholder-gray-400"
                  placeholder="Date (YYYY-MM-DD)"
                />
                <input
                  type="date"
                  className="w-full border rounded-md px-3 py-2 text-sm placeholder-gray-400"
                  placeholder="Date (YYYY-MM-DD)"
                />
              </div>

              {/* Bottom buttons */}
              <div className="flex gap-3">
                <button className="flex-1 border rounded-md px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200">
                  Generate Sales Report
                </button>
                <button className="flex-1 border rounded-md px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200">
                  Product Usage Report
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
